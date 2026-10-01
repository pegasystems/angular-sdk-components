import { vi } from 'vitest';
import { stubComponentMapper, getMappedComponents } from '../../../../test-utils';
import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegerComponent } from './integer.component';

describe('IntegerComponent', () => {
  let component: IntegerComponent;
  let fixture: ComponentFixture<IntegerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntegerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegerComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function setup(config: Record<string, any>, opts: { form?: boolean } = {}) {
    const actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
    const pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Prop' });
    pConn.getActionsApi = () => actions;
    pConn.clearErrorMessages = vi.fn();
    const fx = TestBed.createComponent(IntegerComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    if (opts.form !== false) (fx.componentInstance as any).formGroup$ = new FormGroup({});
    fx.detectChanges();
    return { fx, comp: fx.componentInstance as any, actions, pConn, el: fx.nativeElement as HTMLElement };
  }

  const base = { label: 'Count', value: 5, required: true, readOnly: false, visibility: true, displayMode: '' };

  it('updateSelf maps config props to component state', () => {
    const { comp } = setup(base);
    expect(comp.label$).toBe('Count');
    expect(comp.value$).toBe(5);
    expect(comp.bRequired$).toBe(true);
    expect(comp.bReadonly$).toBe(false);
    expect(comp.bVisible$).toBe(true);
    expect(comp.displayMode$).toBe('');
  });

  it('parses a string value to an integer', () => {
    const { comp } = setup({ ...base, value: '42' });
    expect(comp.value$).toBe(42);
  });

  it('maps readOnly, visibility and displayMode', () => {
    const { comp } = setup({ ...base, readOnly: true, visibility: false, displayMode: 'DISPLAY_ONLY' });
    expect(comp.bReadonly$).toBe(true);
    expect(comp.bVisible$).toBe(false);
    expect(comp.displayMode$).toBe('DISPLAY_ONLY');
  });

  it('renders the label and a number input', () => {
    const { el } = setup(base);
    expect(el.querySelector('mat-label')?.textContent).toContain('Count');
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.step).toBe('1');
  });

  it('renders the Text component instead of an input when readOnly', async () => {
    await stubComponentMapper();
    const { fx, el } = setup({ ...base, readOnly: true });
    expect((await getMappedComponents(fx)).map(m => m.name)).toEqual(['Text']);
    expect(el.querySelector('input')).toBeNull();
  });

  it('blur with a changed value sends the value as a Number', () => {
    const { el, actions } = setup(base);
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = '7';
    input.dispatchEvent(new Event('blur'));
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', 7);
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Prop', 7);
  });

  it('blur after clearing the input sends an empty string, not 0', () => {
    const { comp, actions } = setup(base);
    comp.fieldOnBlur({ target: { value: '' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', '');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Prop', '');
  });

  it('blur with an unchanged value does not call the actions API', () => {
    const { comp, actions } = setup(base);
    comp.fieldOnBlur({ target: { value: '5' } });
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });

  it('change with a changed value clears the error messages for the property', () => {
    const { comp, pConn } = setup(base);
    comp.fieldOnChange({ target: { value: '9' } });
    expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Prop' });
  });

  it('change with an unchanged value does not clear error messages', () => {
    const { comp, pConn } = setup(base);
    comp.fieldOnChange({ target: { value: '5' } });
    expect(pConn.clearErrorMessages).not.toHaveBeenCalled();
  });

  it('does not render the input when not visible', () => {
    const { el } = setup({ ...base, visibility: false });
    expect(el.querySelector('input')).toBeNull();
  });

  it('shows the validation message from the bridge when the control has a message error', () => {
    const { comp, fx, el } = setup(base);
    comp.angularPConnectData.validateMessage = 'Bad value';
    comp.fieldControl.setErrors({ message: true });
    comp.fieldControl.markAsTouched();
    comp.markForCheck();
    fx.detectChanges();
    expect(comp.getErrorMessage()).toBe('Bad value');
    expect(el.querySelector('mat-error')?.textContent).toContain('Bad value');
  });

  it('getErrorMessage reports a required error', () => {
    const { comp } = setup(base);
    comp.fieldControl.setErrors({ required: true });
    expect(comp.getErrorMessage()).toBe('You must enter a value');
  });

  it('renders FieldValueList via component-mapper in display mode', async () => {
    await stubComponentMapper();
    const { fx } = setup({ ...base, displayMode: 'DISPLAY_ONLY' });
    const mapped = await getMappedComponents(fx);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].name).toBe('FieldValueList');
    expect(mapped[0].props).toMatchObject({ label$: 'Count', displayMode$: 'DISPLAY_ONLY', value$: 5 });
  });

  it('renders the Text component when there is no form group', async () => {
    await stubComponentMapper();
    const { fx, comp } = setup(base, { form: false });
    expect(comp.bHasForm$).toBe(false);
    expect((await getMappedComponents(fx)).map(m => m.name)).toEqual(['Text']);
  });
});
