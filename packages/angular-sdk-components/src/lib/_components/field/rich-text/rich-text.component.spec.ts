import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichTextComponent } from './rich-text.component';

describe('RichTextFieldComponent', () => {
  let component: RichTextComponent;
  let fixture: ComponentFixture<RichTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTextComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RichTextComponent);
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
    let clearErrorMessages: ReturnType<typeof vi.fn>;

    const setup = (config: any, stateProps: any = {}) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [RichTextComponent] });
      const pConn = createMockPConn();
      actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
      clearErrorMessages = vi.fn();
      pConn.getConfigProps = () => config;
      pConn.resolveConfigProps = (p: any) => p;
      pConn.getActionsApi = () => actions;
      pConn.getStateProps = () => ({ value: '.Notes', ...stateProps });
      pConn.clearErrorMessages = clearErrorMessages;
      const fx = TestBed.createComponent(RichTextComponent);
      fx.componentInstance.pConn$ = pConn;
      fx.componentInstance.formGroup$ = new FormGroup({});
      fx.detectChanges();
      return fx;
    };

    beforeEach(async () => {
      await stubComponentMapper();
    });

    it('maps config props to component state', () => {
      const c = setup({ label: 'Notes', value: '<p>Hi</p>', required: true, readOnly: false, visibility: true, displayMode: '' }).componentInstance;
      expect(c.label$).toBe('Notes');
      expect(c.value$).toBe('<p>Hi</p>');
      expect(c.bRequired$).toBe(true);
      expect(c.bReadonly$).toBe(false);
      expect(c.bVisible$).toBe(true);
      expect(c.displayMode$).toBe('');
      expect(c.propName).toBe('.Notes');
    });

    it('treats a validatemessage in state as an error and prefers it over helper text', () => {
      const c = setup({ label: 'Notes', visibility: true, helperText: 'Help' }, { status: 'error', validatemessage: 'Too short' }).componentInstance;
      expect(c.error).toBe(true);
      expect(c.info).toBe('Too short');
    });

    it('falls back to helper text when there is no validation message', () => {
      const c = setup({ label: 'Notes', visibility: true, helperText: 'Help' }).componentInstance;
      expect(c.error).toBe(false);
      expect(c.info).toBe('Help');
    });

    it('renders the editable RichTextEditor with the field props', async () => {
      const fx = setup({ label: 'Notes', value: 'v', required: true, disabled: true, placeholder: 'Type', testId: 't1', visibility: true });
      const mapped = await getMappedComponents(fx);
      expect(mapped.map(m => m.name)).toEqual(['RichTextEditor']);
      expect(mapped[0].props).toMatchObject({
        label: 'Notes',
        value: 'v',
        required: true,
        disabled: true,
        placeholder: 'Type',
        testId: 't1',
        readonly: false
      });
    });

    it('renders nothing when an editable field is not visible', async () => {
      const fx = setup({ label: 'Notes', visibility: false });
      expect(await getMappedComponents(fx)).toHaveLength(0);
    });

    it('renders a read-only RichTextEditor when readOnly', async () => {
      const fx = setup({ label: 'Notes', value: 'v', readOnly: true, visibility: true });
      const mapped = await getMappedComponents(fx);
      expect(mapped.map(m => m.name)).toEqual(['RichTextEditor']);
      expect(mapped[0].props).toMatchObject({ label: 'Notes', value: 'v', readonly: true });
    });

    it('renders FieldValueList with html in display mode', async () => {
      const fx = setup({ label: 'Notes', value: '<b>x</b>', displayMode: 'DISPLAY_ONLY', visibility: true });
      const mapped = await getMappedComponents(fx);
      expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
      expect(mapped[0].props).toMatchObject({ label$: 'Notes', value$: '<b>x</b>', displayMode$: 'DISPLAY_ONLY', isHtml$: true });
    });

    it('renders nothing in display mode when not visible', async () => {
      const fx = setup({ label: 'Notes', displayMode: 'DISPLAY_ONLY', visibility: false });
      expect(await getMappedComponents(fx)).toHaveLength(0);
    });

    it('fieldOnBlur sends a changed value through the actions API', () => {
      const c = setup({ label: 'Notes', value: 'old', visibility: true }).componentInstance;
      c.fieldOnBlur('new');
      expect(actions.updateFieldValue).toHaveBeenCalledWith('.Notes', 'new');
      expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Notes', 'new');
    });

    it('fieldOnBlur does nothing when the value is unchanged', () => {
      const c = setup({ label: 'Notes', value: 'same', visibility: true }).componentInstance;
      c.fieldOnBlur('same');
      expect(actions.updateFieldValue).not.toHaveBeenCalled();
      expect(actions.triggerFieldChange).not.toHaveBeenCalled();
    });

    it('fieldOnChange clears error messages for the property when the value changed', () => {
      const c = setup({ label: 'Notes', value: 'old', visibility: true }).componentInstance;
      c.fieldOnChange('new');
      expect(clearErrorMessages).toHaveBeenCalledWith({ property: '.Notes', category: '', context: '' });
    });

    it('fieldOnChange does not clear errors when unchanged and not in error', () => {
      const c = setup({ label: 'Notes', value: 'same', visibility: true }).componentInstance;
      c.fieldOnChange('same');
      expect(clearErrorMessages).not.toHaveBeenCalled();
    });

    it('fieldOnChange clears errors even when unchanged if the field is in error status', () => {
      const c = setup({ label: 'Notes', value: 'same', visibility: true }, { status: 'error' }).componentInstance;
      c.fieldOnChange('same');
      expect(clearErrorMessages).toHaveBeenCalledTimes(1);
    });
  });
});
