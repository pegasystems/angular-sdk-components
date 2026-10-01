import { FormGroup } from '@angular/forms';
import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeComponent } from './time.component';

describe('TimeComponent', () => {
  let component: TimeComponent;
  let fixture: ComponentFixture<TimeComponent>;
  let updateFieldValue: ReturnType<typeof vi.fn>;
  let triggerFieldChange: ReturnType<typeof vi.fn>;
  let clearErrorMessages: ReturnType<typeof vi.fn>;

  function create(config: Record<string, any> = {}, withForm = true) {
    fixture = TestBed.createComponent(TimeComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    updateFieldValue = vi.fn();
    triggerFieldChange = vi.fn();
    clearErrorMessages = vi.fn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Prop' });
    pConn.getActionsApi = () => ({ updateFieldValue, triggerFieldChange });
    pConn.clearErrorMessages = clearErrorMessages;
    pConn.getFieldMetadata = () => ({});
    pConn.getRawConfigProps = () => ({ value: '@P .Prop' });
    (component as any).pConn$ = pConn;
    if (withForm) (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
    return pConn;
  }

  const el = (sel: string): HTMLInputElement | null => fixture.nativeElement.querySelector(sel);

  beforeEach(async () => {
    await stubComponentMapper();
    await TestBed.configureTestingModule({
      imports: [TimeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('maps configProps onto component state', () => {
    create({
      label: 'My label',
      value: '10:30:00',
      required: true,
      readOnly: false,
      visibility: true,
      disabled: false,
      testId: 'tid',
      placeholder: 'ph'
    });
    expect(component.label$).toBe('My label');
    expect(component.value$).toBe('10:30:00');
    expect(component.bRequired$).toBe(true);
    expect(component.bReadonly$).toBe(false);
    expect(component.bVisible$).toBe(true);
    expect(component.displayMode$).toBe('');
    expect(component.placeholder).toBe('ph');
    expect(component.testId).toBe('tid');
    expect(component.propName).toBe('.Prop');
  });

  it('treats string booleans and disabled config', () => {
    create({ label: 'L', required: 'true', disabled: 'true', visibility: 'false' });
    expect(component.bRequired$).toBe(true);
    expect(component.bDisabled$).toBe(true);
    expect(component.fieldControl.disabled).toBe(true);
    expect(component.bVisible$).toBe(false);
    expect(el('input[type=time]')).toBeNull();
  });

  it('renders the label and input', () => {
    create({ label: 'Rendered label', value: '10:30:00' });
    expect(fixture.nativeElement.textContent).toContain('Rendered label');
    expect(el('input[type=time]')).not.toBeNull();
  });

  it('renders helper text from config', () => {
    create({ label: 'L', helperText: 'Some help' });
    expect(fixture.nativeElement.querySelector('mat-hint').textContent).toContain('Some help');
  });

  it('uses the field message instead of helper text when the message is visible', () => {
    create({ label: 'L', helperText: 'Some help', showFieldMessage: true, messageConfig: { visibility: true, content: 'Heads up' } });
    expect(component.bFieldMessageVisible$).toBe(true);
    expect(component.helperText).toBe('Heads up');
  });

  it('on blur with a changed value calls updateFieldValue and triggerFieldChange', () => {
    create({ label: 'L', value: '10:30:00' });
    const input = el('input[type=time]')!;
    input.value = '11:45';
    input.dispatchEvent(new Event('blur'));
    expect(updateFieldValue).toHaveBeenCalledWith('.Prop', '11:45:00');
    expect(triggerFieldChange).toHaveBeenCalledWith('.Prop', '11:45:00');
  });

  it('on blur with an unchanged value does not call the actions API', () => {
    create({ label: 'L', value: '10:30:00' });
    const input = el('input[type=time]')!;
    input.value = '10:30:00';
    input.dispatchEvent(new Event('blur'));
    expect(updateFieldValue).not.toHaveBeenCalled();
    expect(triggerFieldChange).not.toHaveBeenCalled();
  });

  it('on change with a different value clears error messages for the property', () => {
    create({ label: 'L', value: '10:30:00' });
    const input = el('input[type=time]')!;
    input.value = '11:45';
    input.dispatchEvent(new Event('change'));
    expect(clearErrorMessages).toHaveBeenCalledWith({ property: '.Prop' });
  });

  it('on change with the same value does not clear error messages', () => {
    create({ label: 'L', value: '10:30:00' });
    const input = el('input[type=time]')!;
    input.value = '10:30:00';
    input.dispatchEvent(new Event('change'));
    expect(clearErrorMessages).not.toHaveBeenCalled();
  });

  it('shows the validation message when the control has a message error', () => {
    create({ label: 'L' });
    (component as any).angularPConnectData.validateMessage = 'Server says no';
    component.fieldControl.setErrors({ message: true });
    component.fieldControl.markAsTouched();
    component.markForCheck();
    fixture.detectChanges();
    expect(component.getErrorMessage()).toBe('Server says no');
    expect(fixture.nativeElement.querySelector('mat-error').textContent).toContain('Server says no');
  });

  it('shows a required message when the control has a required error', () => {
    create({ label: 'L', required: true });
    component.fieldControl.setErrors({ required: true });
    expect(component.getErrorMessage()).toBe('You must enter a value');
  });

  it('renders FieldValueList via component-mapper in display mode', async () => {
    create({ label: 'Disp', value: '10:30:00', displayMode: 'DISPLAY_ONLY' });
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
    expect(mapped[0].props.label$).toBe('Disp');
    expect(mapped[0].props.displayMode$).toBe('DISPLAY_ONLY');
    expect(mapped[0].props.value$).toBe('10:30 AM');
    expect(el('input[type=time]')).toBeNull();
  });

  it('does not render in display mode when invisible', async () => {
    create({ label: 'Disp', displayMode: 'DISPLAY_ONLY', visibility: false });
    expect(await getMappedComponents(fixture)).toEqual([]);
  });

  it('delegates to the Text component as time when there is no form', async () => {
    create({ label: 'L', value: '10:30:00' }, false);
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['Text']);
    expect(mapped[0].props.formatAs$).toBe('time');
    expect(el('input[type=time]')).toBeNull();
  });

  it('uses OnPush change detection', () => {
    expect((TimeComponent as any).ɵcmp.onPush).toBe(true);
  });

  it('does not append seconds when the blurred value already has them', () => {
    create({ label: 'L', value: '10:30:00' });
    const input = el('input[type=time]')!;
    input.value = '12:15:30';
    input.dispatchEvent(new Event('blur'));
    expect(updateFieldValue).toHaveBeenCalledWith('.Prop', '12:15:30');
  });

  it('formats the value for STACKED_LARGE_VAL display mode', async () => {
    create({ label: 'L', value: '15:05:00', displayMode: 'STACKED_LARGE_VAL' });
    const mapped = await getMappedComponents(fixture);
    expect(mapped[0].props.value$).toBe('03:05 PM');
  });
});
