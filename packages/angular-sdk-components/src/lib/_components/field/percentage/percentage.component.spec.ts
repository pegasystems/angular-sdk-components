import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';

import { PercentageComponent } from './percentage.component';

function setup(Cmp: any, configProps: any, extra: (pConn: any) => void = () => undefined) {
  const pConn = createMockPConn();
  pConn.getConfigProps = () => configProps;
  pConn.resolveConfigProps = (p: any) => p;
  pConn.getStateProps = () => ({ value: '.Field' });
  const actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
  pConn.getActionsApi = () => actions;
  pConn.clearErrorMessages = vi.fn();
  extra(pConn);
  const fx = TestBed.createComponent(Cmp);
  (fx.componentInstance as any).pConn$ = pConn;
  (fx.componentInstance as any).formGroup$ = new FormGroup({});
  fx.detectChanges();
  return { fx, c: fx.componentInstance as any, pConn, actions };
}

describe('PercentageComponent', () => {
  let component: PercentageComponent;
  let fixture: ComponentFixture<PercentageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PercentageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentageComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('PercentageComponent behaviour', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PercentageComponent] }).compileComponents();
    await stubComponentMapper();
  });

  const cfg = { label: 'Rate', value: 12.5, required: true, readOnly: true, visibility: true };

  it('maps configProps onto component state', () => {
    const { c } = setup(PercentageComponent, { ...cfg, placeholder: 'ph', testId: 't1' });
    expect(c.label$).toBe('Rate');
    expect(c.value$).toBe(12.5);
    expect(c.fieldControl.value).toBe(12.5);
    expect(c.bRequired$).toBe(true);
    expect(c.bReadonly$).toBe(true);
    expect(c.bVisible$).toBe(true);
    expect(c.placeholder).toBe('ph');
    expect(c.testId).toBe('t1');
  });

  it('renders the label in the form', () => {
    const { fx } = setup(PercentageComponent, cfg);
    expect(fx.nativeElement.querySelector('mat-label').textContent).toContain('Rate');
  });

  it('hides the field when not visible', () => {
    const { fx } = setup(PercentageComponent, { ...cfg, visibility: false });
    expect(fx.nativeElement.querySelector('mat-form-field')).toBeNull();
  });

  it('defaults decimalPrecision to 2 and honours an explicit one', () => {
    expect(setup(PercentageComponent, cfg).c.decimalPrecision).toBe(2);
    expect(setup(PercentageComponent, { ...cfg, decimalPrecision: 0 }).c.decimalPrecision).toBe(0);
  });

  it('only sets a thousand separator when showGroupSeparators is on', () => {
    expect(setup(PercentageComponent, cfg).c.thousandSeparator).toBe('');
    expect(setup(PercentageComponent, { ...cfg, showGroupSeparators: true }).c.thousandSeparator).toBe(',');
  });

  it('renders display-only mode through FieldValueList with the formatted value', async () => {
    const { fx, c } = setup(PercentageComponent, { ...cfg, displayMode: 'DISPLAY_ONLY' });
    const mapped = await getMappedComponents(fx);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].name).toBe('FieldValueList');
    expect(mapped[0].props.displayMode$).toBe('DISPLAY_ONLY');
    expect(mapped[0].props.label$).toBe('Rate');
    expect(c.formattedValue).toBeTruthy();
    expect(mapped[0].props.value$).toBe(c.formattedValue);
  });

  it('leaves formattedValue empty in display mode without a value', () => {
    const { c } = setup(PercentageComponent, { label: 'Rate', displayMode: 'DISPLAY_ONLY' });
    expect(c.formattedValue).toBe('');
  });

  it('falls back to the Text component without a form group', async () => {
    const pConn = createMockPConn();
    pConn.getConfigProps = () => cfg;
    pConn.resolveConfigProps = (p: any) => p;
    const fx = TestBed.createComponent(PercentageComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    fx.detectChanges();
    const mapped = await getMappedComponents(fx);
    expect(mapped.map(m => m.name)).toEqual(['Text']);
  });

  it('blur sends the cleaned value to the engine via the actions API', () => {
    const { c, actions } = setup(PercentageComponent, { ...cfg, showGroupSeparators: true, value: 1 });
    c.fieldOnBlur({ target: { value: '1,234.5%' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Field', '1234.5');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Field', '1234.5');
  });

  it('blur does nothing when the value is unchanged', () => {
    const { c, actions } = setup(PercentageComponent, { ...cfg, value: 12.5 });
    c.fieldOnBlur({ target: { value: '12.5' } });
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });

  it('change clears error messages only when the value changed', () => {
    const { c, pConn } = setup(PercentageComponent, { ...cfg, value: 12.5 });
    c.fieldOnChange({ target: { value: '12.5' } });
    expect(pConn.clearErrorMessages).not.toHaveBeenCalled();
    c.fieldOnChange({ target: { value: '20' } });
    expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Field' });
  });

  it('shows the required error message', () => {
    const { fx, c } = setup(PercentageComponent, cfg);
    c.fieldControl.setErrors({ required: true });
    c.fieldControl.markAsTouched();
    c.markForCheck();
    fx.detectChanges();
    expect(fx.nativeElement.querySelector('mat-error')?.textContent).toContain('You must enter a value');
  });
});
