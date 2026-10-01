import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableCardComponent } from './selectable-card.component';

describe('SelectableCardComponent', () => {
  let component: SelectableCardComponent;
  let fixture: ComponentFixture<SelectableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectableCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectableCardComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('behaviour', () => {
    let actions: { updateFieldValue: ReturnType<typeof vi.fn>; triggerFieldChange: ReturnType<typeof vi.fn> };
    let listActions: {
      insert: ReturnType<typeof vi.fn>;
      deleteEntry: ReturnType<typeof vi.fn>;
      initDefaultPageInstructions: ReturnType<typeof vi.fn>;
    };
    let pConn: any;

    const source = [
      { Id: '1', Name: 'One', Img: 'one.png', Desc: 'First' },
      { Id: '2', Name: 'Two', Img: 'two.png', Desc: 'Second' },
      { Id: '3', Name: 'Three' }
    ];

    const setup = (type: 'radio' | 'checkbox', config: any, overrides: any = {}) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [SelectableCardComponent] });
      pConn = createMockPConn();
      actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
      listActions = { insert: vi.fn(), deleteEntry: vi.fn(), initDefaultPageInstructions: vi.fn() };
      pConn.getConfigProps = () => config;
      pConn.resolveConfigProps = (p: any) => p;
      pConn.getActionsApi = () => actions;
      pConn.getListActions = () => listActions;
      pConn.getStateProps = () => ({ value: '.Id', primaryField: '.Name', image: '.Img', imageDescription: '.Desc' });
      pConn.getRawMetadata = () => ({ config: { imageDescription: '.Desc' } });
      pConn.setReferenceList = vi.fn();
      pConn.clearErrorMessages = vi.fn();
      Object.assign(pConn, overrides);
      const fx = TestBed.createComponent(SelectableCardComponent);
      fx.componentInstance.type = type;
      fx.componentInstance.pConn$ = pConn;
      fx.componentInstance.formGroup$ = new FormGroup({});
      fx.detectChanges();
      return fx;
    };

    const cards = (fx: ComponentFixture<SelectableCardComponent>) => Array.from(fx.nativeElement.querySelectorAll('mat-card')) as HTMLElement[];

    describe('radio', () => {
      it('builds one card per datasource item with key, label and selection value', () => {
        const c = setup('radio', { value: '2', datasource: { source } }).componentInstance;
        expect(c.value$).toBe('2');
        expect(c.radioBtnValue).toBe('2');
        expect(c.contentList.map(i => i.commonCardProps.key)).toEqual(['1', '2', '3']);
        expect(c.contentList.map(i => i.commonCardProps.label)).toEqual(['One', 'Two', 'Three']);
        expect(c.propName).toBe('.Id');
      });

      it('renders a radio button per card with the current value checked', () => {
        const fx = setup('radio', { value: '2', datasource: { source } });
        expect(cards(fx).map(c => c.textContent?.trim())).toEqual(['One', 'Two', 'Three']);
        const inputs = Array.from(fx.nativeElement.querySelectorAll('input[type=radio]')) as HTMLInputElement[];
        expect(inputs.map(i => i.checked)).toEqual([false, true, false]);
      });

      it('renders images only for items that have one, with alt text when requested', () => {
        const fx = setup('radio', { value: '', datasource: { source }, showImageDescription: true });
        const imgs = Array.from(fx.nativeElement.querySelectorAll('img')) as HTMLImageElement[];
        expect(imgs.map(i => i.getAttribute('src'))).toEqual(['one.png', 'two.png']);
        expect(imgs.map(i => i.getAttribute('alt'))).toEqual(['First', 'Second']);
      });

      it('leaves alt text empty when image descriptions are not requested', () => {
        const fx = setup('radio', { value: '', datasource: { source } });
        const imgs = Array.from(fx.nativeElement.querySelectorAll('img')) as HTMLImageElement[];
        expect(imgs.map(i => i.getAttribute('alt'))).toEqual(['', '']);
      });

      it('sends the card key through the actions API when a card is clicked', () => {
        const fx = setup('radio', { value: '', datasource: { source } });
        cards(fx)[2].click();
        expect(actions.updateFieldValue).toHaveBeenCalledWith('.Id', '3');
        expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Id', '3');
      });

      it('sends the value through the actions API when the radio button itself is chosen', () => {
        const fx = setup('radio', { value: '', datasource: { source } });
        (fx.nativeElement.querySelectorAll('input[type=radio]')[0] as HTMLInputElement).click();
        expect(actions.updateFieldValue).toHaveBeenCalledWith('.Id', '1');
        expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Id', '1');
      });

      it('disables the radio buttons when disabled', () => {
        const fx = setup('radio', { value: '', disabled: true, datasource: { source } });
        const inputs = Array.from(fx.nativeElement.querySelectorAll('input[type=radio]')) as HTMLInputElement[];
        expect(fx.componentInstance.disabled).toBe(true);
        expect(inputs.every(i => i.disabled)).toBe(true);
      });

      it('shows no cards in read-only render mode when nothing is selected', () => {
        const fx = setup('radio', { value: '', renderMode: 'ReadOnly', datasource: { source } });
        expect(fx.componentInstance.readOnly).toBe(true);
        expect(cards(fx)).toHaveLength(0);
      });

      it('treats a readOnly config flag as read-only', () => {
        expect(setup('radio', { value: '', readOnly: true, datasource: { source } }).componentInstance.readOnly).toBe(true);
        expect(setup('radio', { value: '', datasource: { source } }).componentInstance.readOnly).toBeFalsy();
      });

      it('exposes the image field names from state props', () => {
        const c = setup('radio', { value: '', imagePosition: 'inline-start', imageSize: 'small', datasource: { source } }).componentInstance;
        expect(c.commonProps.image).toMatchObject({ imageField: 'Img', imageDescription: 'Desc', imagePosition: 'inline-start', imageSize: 'small' });
        expect(c.commonProps.recordKey).toBe('Id');
        expect(c.commonProps.cardLabel).toBe('Name');
      });
    });

    describe('image layout', () => {
      const layout = (imagePosition?: string, extra: any = {}) =>
        setup('radio', { value: '', imagePosition, datasource: { source }, ...extra }).componentInstance;

      it('defaults to a column layout with a full-width image', () => {
        const c = layout(undefined);
        expect(c.cardStyle).toEqual({ display: 'flex', flexDirection: 'column', height: '100%' });
        expect(c.contentList[0].cardImage.style.width).toBe('100%');
      });

      it('uses a row layout with a 30% image for inline-start', () => {
        const c = layout('inline-start');
        expect(c.cardStyle).toEqual({ display: 'flex', flexDirection: 'row', alignItems: '' });
        expect(c.contentList[0].cardImage.style.width).toBe('30%');
      });

      it('uses a reversed row layout for inline-end', () => {
        expect(layout('inline-end').cardStyle).toEqual({ display: 'flex', flexDirection: 'row-reverse', justifyContent: '', alignItems: '' });
      });

      it('centres inline layouts when read only', () => {
        expect(layout('inline-start', { readOnly: true }).cardStyle).toEqual({ display: 'flex', flexDirection: 'row', alignItems: 'center' });
        expect(layout('inline-end', { readOnly: true }).cardStyle).toEqual({
          display: 'flex',
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center'
        });
      });

      it('falls back to a column layout with a narrow image for unknown positions', () => {
        const c = layout('block-end');
        expect(c.cardStyle).toEqual({ display: 'flex', flexDirection: 'column', height: '100%' });
        expect(c.contentList[0].cardImage.style.width).toBe('30%');
      });
    });

    describe('checkbox', () => {
      const config = (extra: any = {}) => ({
        selectionKey: '.Id',
        primaryField: '.Name',
        selectionList: '.Items',
        image: '.Img',
        testId: 'cards',
        displayMode: '',
        readonlyContextList: [{ Id: '2', Name: 'Two' }],
        datasource: { source },
        ...extra
      });

      it('maps config to state and marks the selected cards', () => {
        const c = setup('checkbox', config()).componentInstance;
        expect(c.selectionKey).toBe('.Id');
        expect(c.primaryField).toBe('.Name');
        expect(c.selectionList).toBe('.Items');
        expect(c.testId).toBe('cards');
        expect(c.contentList.map(i => i.commonCardProps.selected)).toEqual([false, true, false]);
        expect(c.contentList.map(i => i.commonCardProps.key)).toEqual(['1', '2', '3']);
      });

      it('registers the reference list and default instructions when editable', () => {
        setup('checkbox', config());
        expect(pConn.setReferenceList).toHaveBeenCalledWith('.Items');
        expect(listActions.initDefaultPageInstructions).toHaveBeenCalledWith('.Items', []);
      });

      it('does not register the reference list when read only', () => {
        setup('checkbox', config({ readOnly: true }));
        expect(pConn.setReferenceList).not.toHaveBeenCalled();
      });

      it('renders a checkbox per card with the selected state and test id', () => {
        const fx = setup('checkbox', config());
        const boxes = Array.from(fx.nativeElement.querySelectorAll('input[type=checkbox]')) as HTMLInputElement[];
        expect(boxes.map(b => b.checked)).toEqual([false, true, false]);
        expect(fx.nativeElement.querySelector('[data-test-id="cards:Two"]')).toBeTruthy();
      });

      it('shows only the selected values in read-only mode and flags the empty state', () => {
        const fx = setup('checkbox', config({ readOnly: true }));
        expect(cards(fx).map(c => c.textContent?.trim())).toEqual(['Two']);
        const empty = setup('checkbox', config({ readOnly: true, readonlyContextList: [] })).componentInstance;
        expect(empty.showNoValue).toBe(true);
        expect(empty.contentList).toEqual([]);
      });

      it('inserts an instruction and clears errors when an unselected card is clicked', () => {
        const fx = setup('checkbox', config(), { getValue: () => [{ Id: '9' }], getPageReference: () => '' });
        cards(fx)[0].click();
        expect(listActions.insert).toHaveBeenCalledWith({ Id: '1', Name: 'One', nonFormProperties: ['Name'] }, 1);
        expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Items', category: '', context: '' });
      });

      it('deletes the matching instruction when a selected card is clicked', () => {
        const fx = setup('checkbox', config(), { getValue: () => [{ Id: '1' }, { Id: '2' }], getPageReference: () => '' });
        cards(fx)[1].click();
        expect(listActions.deleteEntry).toHaveBeenCalledWith(1);
        expect(listActions.insert).not.toHaveBeenCalled();
        expect(pConn.clearErrorMessages).toHaveBeenCalled();
      });

      it('handles a checkbox click once (does not bubble to the card)', () => {
        const fx = setup('checkbox', config(), { getValue: () => [], getPageReference: () => '' });
        (fx.nativeElement.querySelectorAll('input[type=checkbox]')[0] as HTMLInputElement).click();
        expect(listActions.insert).toHaveBeenCalledTimes(1);
      });

      it('does not send field values through the actions API for checkbox changes', () => {
        const fx = setup('checkbox', config(), { getValue: () => [], getPageReference: () => '' });
        cards(fx)[0].click();
        expect(actions.updateFieldValue).not.toHaveBeenCalled();
      });

      it('validates the selection on blur', () => {
        const validate = vi.fn();
        const fx = setup('checkbox', config(), { getValidationApi: () => ({ validate }) });
        fx.componentInstance.fieldOnBlur();
        expect(validate).toHaveBeenCalledWith([{ Id: '2', Name: 'Two' }], '.Items');
      });

      it('disables checkboxes when disabled', () => {
        const fx = setup('checkbox', config({ disabled: true }));
        const boxes = Array.from(fx.nativeElement.querySelectorAll('input[type=checkbox]')) as HTMLInputElement[];
        expect(boxes.every(b => b.disabled)).toBe(true);
      });
    });

    it('ignores card selection for an unknown type', () => {
      const fx = setup('radio', { value: '', datasource: { source } });
      fx.componentInstance.type = 'other';
      fx.componentInstance.cardSelect({}, { key: 'x' });
      expect(actions.updateFieldValue).not.toHaveBeenCalled();
    });
  });
});
