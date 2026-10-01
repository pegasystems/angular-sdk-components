import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { createMockPConn } from '../../../../test-setup';
import { stubComponentMapper } from '../../../../test-utils';
import { SemanticLinkComponent } from './semantic-link.component';

describe('SemanticLinkComponent', () => {
  let fixture: ComponentFixture<SemanticLinkComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [SemanticLinkComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(SemanticLinkComponent);
    (fixture.componentInstance as any).pConn$ = createMockPConn();
    (fixture.componentInstance as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('behaviour', () => {
    let actions: { openWorkByHandle: ReturnType<typeof vi.fn>; showData: ReturnType<typeof vi.fn> };
    let getResolvedSemanticURL: ReturnType<typeof vi.fn>;
    let isObjectCaseType: ReturnType<typeof vi.fn>;
    let pConn: any;

    const setup = (config: any, pConnOverrides: any = {}, engine: { isObject?: boolean; dataTypeUtils?: any } = {}) => {
      const pcore = (globalThis as any).PCore;
      getResolvedSemanticURL = vi.fn(() => '/resolved');
      isObjectCaseType = vi.fn(() => !!engine.isObject);
      pcore.getConstants = () => ({
        WORKCLASS: 'Work-',
        CASE_INFO: { CASE_INFO_CLASSID: 'caseInfo.classID' },
        RESOURCE_TYPES: { DATA: 'DATA' }
      });
      pcore.getSemanticUrlUtils = () => ({
        getActions: () => ({ ACTION_OPENWORKBYHANDLE: 'OPEN', ACTION_SHOWDATA: 'SHOWDATA', ACTION_GETOBJECT: 'GETOBJECT' }),
        getResolvedSemanticURL
      });
      pcore.getCaseUtils = () => ({ isObjectCaseType });
      pcore.getDataTypeUtils = () =>
        engine.dataTypeUtils ?? { getLookUpDataPage: () => undefined, getLookUpDataPageInfo: () => undefined, getDataPageKeys: () => [] };
      pcore.getAnnotationUtils = () => ({
        isProperty: (v: string) => typeof v === 'string' && v.startsWith('.'),
        getPropertyName: (v: string) => v.replace(/^\./, ''),
        getLeafPropertyName: (v: string) => v.split('.').pop()
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [SemanticLinkComponent] });
      pConn = createMockPConn();
      actions = { openWorkByHandle: vi.fn(), showData: vi.fn() };
      pConn.getConfigProps = () => config;
      pConn.resolveConfigProps = (p: any) => p;
      pConn.getActionsApi = () => actions;
      Object.assign(pConn, pConnOverrides);
      const fx = TestBed.createComponent(SemanticLinkComponent);
      fx.componentInstance.pConn$ = pConn;
      fx.componentInstance.formGroup$ = new FormGroup({});
      fx.detectChanges();
      return fx;
    };

    const click = (fx: ComponentFixture<SemanticLinkComponent>, init: MouseEventInit = {}) => {
      const a: HTMLAnchorElement = fx.nativeElement.querySelector('a');
      const ev = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
      a.dispatchEvent(ev);
      return ev;
    };

    it('maps config props to component state', () => {
      const c = setup({
        label: 'Case',
        text: 'C-1',
        displayMode: 'DISPLAY_ONLY',
        visibility: true,
        previewKey: 'W C-1',
        resourcePayload: {},
        resourceParams: {}
      }).componentInstance;
      expect(c.label$).toBe('Case');
      expect(c.value$).toBe('C-1');
      expect(c.displayMode$).toBe('DISPLAY_ONLY');
      expect(c.bVisible$).toBe(true);
      expect(c.previewKey).toBe('W C-1');
    });

    it('prefers text over value and falls back to value', () => {
      expect(setup({ text: 'T', value: 'V' }).componentInstance.value$).toBe('T');
      expect(setup({ value: 'V' }).componentInstance.value$).toBe('V');
    });

    it('renders an anchor with the link text', () => {
      const fx = setup({ text: 'C-1', previewKey: 'W C-1' });
      const a = fx.nativeElement.querySelector('a.psdk-semantic-link');
      expect(a?.textContent).toBe('C-1');
      expect(fx.componentInstance.isLinkTextEmpty).toBe(false);
    });

    it('renders plain placeholder text instead of a link when the text is empty', () => {
      const fx = setup({ text: '', value: '' });
      expect(fx.componentInstance.isLinkTextEmpty).toBe(true);
      expect(fx.nativeElement.querySelector('a')).toBeNull();
      expect(fx.nativeElement.querySelector('.psdk-value')?.textContent).toBe('---');
    });

    it('renders nothing when visibility is false', () => {
      // A string 'false' is used: a boolean false is ignored by the component (`if (visibility)`), see report.
      const fx = setup({ text: 'C-1', visibility: 'false' });
      expect(fx.componentInstance.bVisible$).toBe(false);
      expect(fx.nativeElement.querySelector('.psdk-value')).toBeNull();
    });

    it('builds an open-work-by-handle URL from the preview key', () => {
      const fx = setup({ text: 'C-1', previewKey: 'OPS-WORK C-1', resourcePayload: { caseClassName: 'My-Work' }, resourceParams: { workID: '' } });
      expect(fx.componentInstance.linkURL).toBe('/resolved');
      expect(getResolvedSemanticURL).toHaveBeenCalledWith('OPEN', { caseClassName: 'My-Work' }, { workID: 'C-1', id: 'OPS-WORK C-1' });
    });

    it('uses the object id key and action for object case types', () => {
      setup(
        { text: 'X', previewKey: 'OBJ X-9', resourcePayload: { caseClassName: 'My-Obj' }, resourceParams: { workID: '' } },
        {},
        { isObject: true }
      );
      expect(isObjectCaseType).toHaveBeenCalledWith('My-Obj');
      expect(getResolvedSemanticURL).toHaveBeenCalledWith('GETOBJECT', { caseClassName: 'My-Obj' }, { workID: '', objectID: 'X-9', id: 'OBJ X-9' });
    });

    it('opens the work item by handle on click and prevents default navigation', () => {
      const fx = setup({ text: 'C-1', previewKey: 'OPS-WORK C-1', resourcePayload: { caseClassName: 'My-Work' }, resourceParams: {} });
      const ev = click(fx);
      expect(ev.defaultPrevented).toBe(true);
      expect(actions.openWorkByHandle).toHaveBeenCalledWith('OPS-WORK C-1', 'My-Work');
    });

    it('lets ctrl/meta clicks through to the browser', () => {
      const fx = setup({ text: 'C-1', previewKey: 'OPS-WORK C-1', resourcePayload: { caseClassName: 'My-Work' }, resourceParams: {} });
      const ev = click(fx, { ctrlKey: true });
      expect(ev.defaultPrevented).toBe(false);
      expect(click(fx, { metaKey: true }).defaultPrevented).toBe(false);
      expect(actions.openWorkByHandle).not.toHaveBeenCalled();
    });

    it('takes the case class from contextPage', () => {
      const fx = setup({ text: 'C-1', previewKey: 'W C-1', resourcePayload: {}, contextPage: { classID: 'Ctx-Class' }, resourceParams: {} });
      expect(fx.componentInstance.resourcePayload.caseClassName).toBe('Ctx-Class');
    });

    it('resolves the generic work class to the case class id from the engine', () => {
      const fx = setup(
        { text: 'C-1', previewKey: 'W C-1', resourcePayload: { caseClassName: 'Work-' }, resourceParams: {} },
        { getValue: (k: string) => (k === 'caseInfo.classID' ? 'Real-Class' : '') }
      );
      expect(fx.componentInstance.resourcePayload.caseClassName).toBe('Real-Class');
    });

    it('treats a reference with a data datasource as a data link and opens showData', () => {
      const fx = setup(
        { text: 'Bob', referenceType: 'Data', resourcePayload: {}, resourceParams: {} },
        {
          getPageReference: () => '.Employee',
          getFieldMetadata: () => ({ datasource: { name: 'D_Emp', parameters: { Id: '.EmpId' } } }),
          getValue: (k: string) => (k === '.EmpId' ? '7' : '')
        }
      );
      const c = fx.componentInstance;
      expect(c.dataViewName).toBe('D_Emp');
      expect(c.payload).toEqual({ Id: '7' });
      expect(getResolvedSemanticURL).toHaveBeenCalledWith('SHOWDATA', { pageName: 'pyDetails', dataViewName: 'D_Emp' }, { Id: '7' });
      click(fx);
      expect(actions.showData).toHaveBeenCalledWith('pyDetails', 'D_Emp', { Id: '7' });
      expect(actions.openWorkByHandle).not.toHaveBeenCalled();
    });

    it('falls back to a non-data link when reading the data reference throws', () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      const fx = setup(
        { text: 'Bob', referenceType: 'DATA', resourcePayload: {}, resourceParams: {} },
        {
          getPageReference: () => '.Employee',
          getFieldMetadata: () => {
            throw new Error('boom');
          }
        }
      );
      expect(log).toHaveBeenCalled();
      expect(fx.componentInstance.dataViewName).toBe('');
      expect(getResolvedSemanticURL).toHaveBeenCalledWith('OPEN', expect.anything(), expect.anything());
    });

    it('builds the data page payload from a DATA resource payload and opens it', () => {
      const dataTypeUtils = {
        getLookUpDataPage: () => 'D_Lookup',
        getLookUpDataPageInfo: () => ({ parameters: { who: '.Name', fixed: 'const' } }),
        getDataPageKeys: () => []
      };
      const fx = setup(
        { text: 'Bob', resourcePayload: { resourceType: 'DATA', className: 'Emp-Class', content: { Name: 'bob' } }, resourceParams: {} },
        {},
        { dataTypeUtils }
      );
      const c = fx.componentInstance;
      expect(c.dataViewName).toBe('D_Lookup');
      expect(c.payload).toEqual({ who: 'bob', fixed: 'const' });
      click(fx);
      expect(actions.showData).toHaveBeenCalledWith('pyDetails', 'D_Lookup', { who: 'bob', fixed: 'const' });
    });

    it('builds the data page payload from the page keys when there is no lookup info', () => {
      const dataTypeUtils = {
        getLookUpDataPage: () => 'D_Keys',
        getLookUpDataPageInfo: () => undefined,
        getDataPageKeys: () => [
          { keyName: 'k1', isAlternateKeyStorage: false },
          { keyName: 'k2', isAlternateKeyStorage: true, linkedField: 'b' }
        ]
      };
      const fx = setup(
        { text: 'Bob', resourcePayload: { resourceType: 'DATA', className: 'Emp-Class', content: { k1: 1, b: 2 } }, resourceParams: {} },
        {},
        { dataTypeUtils }
      );
      expect(fx.componentInstance.payload).toEqual({ k1: 1, k2: 2 });
    });
  });
});
