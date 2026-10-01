import { FormGroup } from '@angular/forms';
import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTimeComponent } from './date-time.component';

describe('DateTimeComponent', () => {
  let component: DateTimeComponent;
  let fixture: ComponentFixture<DateTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateTimeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTimeComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('DateTimeComponent behaviour', () => {
  let actions: { updateFieldValue: any; triggerFieldChange: any };
  let pConn: any;
  let config: any;

  async function setup(cfg: any = {}, withForm = true): Promise<{ fixture: ComponentFixture<DateTimeComponent>; component: DateTimeComponent }> {
    config = { label: 'LABEL', ...cfg };
    actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
    pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Prop' });
    pConn.getActionsApi = () => actions;
    pConn.clearErrorMessages = vi.fn();
    pConn.getValidationApi = () => ({ validate: vi.fn() });
    const fixture = TestBed.createComponent(DateTimeComponent);
    const component = fixture.componentInstance;
    (component as any).pConn$ = pConn;
    if (withForm) (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DateTimeComponent] }).compileComponents();
    await stubComponentMapper();
  });

  it('maps configProps to component state', async () => {
    const { component } = await setup({ required: true, readOnly: false, visibility: true, displayMode: '', testId: 'tid', disabled: false });
    expect(component.label$).toBe('LABEL');
    expect(component.bRequired$).toBe(true);
    expect(component.bReadonly$).toBe(false);
    expect(component.bVisible$).toBe(true);
    expect(component.displayMode$).toBe('');
    expect(component.testId).toBe('tid');
  });

  it('renders the label in edit mode and hides the field when not visible', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.querySelector('mat-label').textContent).toContain('LABEL');
    const hidden = await setup({ visibility: false });
    expect(hidden.fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it('falls back to the Text component when read-only', async () => {
    const { fixture } = await setup({ readOnly: true });
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['Text']);
    expect(mapped[0].props.formatAs$).toBe('date-time');
  });

  it('falls back to the Text component when there is no form group', async () => {
    const { fixture, component } = await setup({}, false);
    expect(component.bHasForm$).toBe(false);
    expect((await getMappedComponents(fixture)).map(m => m.name)).toEqual(['Text']);
  });

  it('shows the server validation message', async () => {
    const { fixture, component } = await setup();
    (component as any).angularPConnectData.validateMessage = 'Server says no';
    component.fieldControl.setErrors({ message: true });
    component.fieldControl.markAsTouched();
    component.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-error').textContent).toContain('Server says no');
  });

  it('renders the formatted value through component-mapper in display-only mode', async () => {
    const { fixture, component } = await setup({ displayMode: 'DISPLAY_ONLY', value: '2024-03-05T10:15:00Z' });
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
    expect(component.formattedValue$).toContain('2024');
    expect(mapped[0].props.value$).toBe(component.formattedValue$);
    expect(mapped[0].props.label$).toBe('LABEL');
    expect(mapped[0].props.displayMode$).toBe('DISPLAY_ONLY');
  });

  it('generateDateTime handles empty, date-only and date-time values', async () => {
    const { component } = await setup();
    expect(component.generateDateTime('')).toBe('');
    expect(component.generateDateTime(undefined)).toBe('');
    const utils = (component as any).utils;
    expect(component.generateDateTime('2024-03-05')).toBe(utils.generateDate('2024-03-05', 'Date-Long-Custom-YYYY'));
    expect(component.generateDateTime('2024-03-05T10:15:00Z')).toBe(utils.generateDateTime('2024-03-05T10:15:00Z', 'DateTime-Long-YYYY-Custom'));
    expect(component.generateDateTime('2024-03-05')).not.toBe(utils.generateDateTime('2024-03-05', 'DateTime-Long-YYYY-Custom'));
  });

  it('seeds the control with an ISO string for a value and with an empty string without one', async () => {
    const withValue = await setup({ value: '2024-03-05T10:15:00Z' });
    expect(withValue.component.fieldControl.value).toMatch(/^2024-03-05T\d{2}:\d{2}:00\.000Z$/);
    const noValue = await setup({});
    expect(noValue.component.fieldControl.value).toBe('');
  });

  it('clears the value and notifies the engine when the picker emits null', async () => {
    const { component } = await setup({ value: '2024-03-05T10:15:00Z' });
    component.fieldOnDateChange({ value: null });
    expect(component.fieldControl.value).toBe('');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', '');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Prop', '');
  });

  it('passes through a string value and converts a Date to an ISO string', async () => {
    const { component } = await setup();
    component.fieldOnDateChange({ value: '2025-01-02T03:04:05.000Z' });
    expect(actions.updateFieldValue).toHaveBeenLastCalledWith('.Prop', '2025-01-02T03:04:05.000Z');
    const event: any = { value: new Date('2025-06-07T08:09:10Z') };
    component.fieldOnDateChange(event);
    expect(typeof event.value).toBe('string');
    expect(actions.triggerFieldChange).toHaveBeenLastCalledWith('.Prop', event.value);
    expect(event.value).toContain('2025-06-07');
  });

  it('getErrorMessage reports each error kind', async () => {
    const { component } = await setup();
    component.fieldControl.setErrors({ required: true });
    expect(component.getErrorMessage()).toBe('You must enter a value');
    component.fieldControl.setErrors({ owlDateTimeParse: { text: 'zzz' } });
    expect(component.getErrorMessage()).toBe('zzz is not a valid date time value');
    component.fieldControl.setErrors({ other: true });
    expect(component.getErrorMessage()).toBe('Invalid date time value');
    component.fieldControl.setErrors(null);
    expect(component.getErrorMessage()).toBe('');
  });
});
