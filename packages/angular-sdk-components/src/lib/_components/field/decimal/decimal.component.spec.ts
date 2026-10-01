import { vi } from 'vitest';
import { stubComponentMapper, getMappedComponents } from '../../../../test-utils';
import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimalComponent } from './decimal.component';

describe('DecimalComponent', () => {
  let component: DecimalComponent;
  let fixture: ComponentFixture<DecimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecimalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecimalComponent);
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
    const fx = TestBed.createComponent(DecimalComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    if (opts.form !== false) (fx.componentInstance as any).formGroup$ = new FormGroup({});
    fx.detectChanges();
    return { fx, comp: fx.componentInstance as any, actions, pConn, el: fx.nativeElement as HTMLElement };
  }

  const base = { label: 'Count', value: 1234.5, required: false, readOnly: false, visibility: true, displayMode: '', currencyISOCode: 'USD' };

  it('updateSelf maps config props to component state', () => {
    const { comp } = setup({ ...base, required: true });
    expect(comp.label$).toBe('Count');
    expect(comp.value$).toBe(1234.5);
    expect(comp.fieldControl.value).toBe(1234.5);
    expect(comp.bRequired$).toBe(true);
    expect(comp.bReadonly$).toBe(false);
    expect(comp.bVisible$).toBe(true);
    expect(comp.displayMode$).toBe('');
  });

  it('parses a string value to a float', () => {
    const { comp } = setup({ ...base, value: '12.75' });
    expect(comp.value$).toBe(12.75);
  });

  it('maps readOnly, visibility and displayMode', () => {
    const { comp } = setup({ ...base, readOnly: true, visibility: false, displayMode: 'DISPLAY_ONLY' });
    expect(comp.bReadonly$).toBe(true);
    expect(comp.bVisible$).toBe(false);
    expect(comp.displayMode$).toBe('DISPLAY_ONLY');
  });

  it('defaults decimalPrecision to 2 and honours a configured one', () => {
    expect(setup(base).comp.decimalPrecision).toBe(2);
    expect(setup({ ...base, decimalPrecision: 4 }).comp.decimalPrecision).toBe(4);
  });

  it('uses thousand separators only when showGroupSeparators is set', () => {
    expect(setup(base).comp.thousandSeparator).toBe('');
    expect(setup({ ...base, showGroupSeparators: true }).comp.thousandSeparator).toBe(',');
    expect(setup(base).comp.decimalSeparator).toBe('.');
  });

  it('shows the currency symbol only when readOnly with the Currency formatter', () => {
    expect(setup({ ...base, readOnly: true, formatter: 'Currency' }).comp.currencySymbol).toBe('$');
    expect(setup({ ...base, formatter: 'Currency' }).comp.currencySymbol).toBe('');
  });

  it('adds a % suffix only when readOnly with the Percentage formatter', () => {
    expect(setup({ ...base, readOnly: true, formatter: 'Percentage' }).comp.suffix).toBe('%');
    expect(setup({ ...base, formatter: 'Percentage' }).comp.suffix).toBe('');
  });

  it('renders the label and a text input', () => {
    const { el } = setup(base);
    expect(el.querySelector('mat-label')?.textContent).toContain('Count');
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('blur with a changed value calls updateFieldValue and triggerFieldChange', () => {
    const { comp, actions } = setup(base);
    comp.fieldOnBlur({ target: { value: '99.5' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', '99.5');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Prop', '99.5');
  });

  it('blur with an unchanged value does not call the actions API', () => {
    const { comp, actions } = setup(base);
    comp.fieldOnBlur({ target: { value: '1234.5' } });
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
  });

  it('blur strips group separators from the value when showGroupSeparators is set', () => {
    const { comp, actions } = setup({ ...base, showGroupSeparators: true });
    comp.fieldOnBlur({ target: { value: '1,234,567.5' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', '1234567.5');
  });

  it('blur converts a non-dot decimal separator to a dot', () => {
    const { comp, actions } = setup(base);
    comp.decimalSeparator = ',';
    comp.fieldOnBlur({ target: { value: '12,5' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', '12.5');
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
    expect(mapped[0].props).toMatchObject({ label$: 'Count', displayMode$: 'DISPLAY_ONLY', value$: expect.any(String) });
  });

  it('passes the formatted value to FieldValueList', async () => {
    await stubComponentMapper();
    const { fx, comp } = setup({ ...base, displayMode: 'DISPLAY_ONLY' });
    const mapped = await getMappedComponents(fx);
    expect(mapped[0].props.value$).toBe(comp.formattedValue);
    expect(String(comp.formattedValue)).toContain('1,234.5');
  });

  it('renders the Text component when there is no form group', async () => {
    await stubComponentMapper();
    const { fx, comp } = setup(base, { form: false });
    expect(comp.bHasForm$).toBe(false);
    expect((await getMappedComponents(fx)).map(m => m.name)).toEqual(['Text']);
  });
});
