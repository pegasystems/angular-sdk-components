import { FormGroup } from '@angular/forms';
import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateComponent } from './date.component';

describe('DateComponent', () => {
  let component: DateComponent;
  let fixture: ComponentFixture<DateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('DateComponent behaviour', () => {
  let actions: { updateFieldValue: any; triggerFieldChange: any };
  let pConn: any;
  let config: any;

  async function setup(cfg: any = {}, withForm = true): Promise<{ fixture: ComponentFixture<DateComponent>; component: DateComponent }> {
    config = { label: 'Birthday', value: '2024-03-05', ...cfg };
    actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
    pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Birthday' });
    pConn.getActionsApi = () => actions;
    pConn.clearErrorMessages = vi.fn();
    const fixture = TestBed.createComponent(DateComponent);
    const component = fixture.componentInstance;
    (component as any).pConn$ = pConn;
    if (withForm) (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DateComponent] }).compileComponents();
    await stubComponentMapper();
  });

  it('maps configProps to component state', async () => {
    const { component } = await setup({ required: true, readOnly: false, visibility: true, displayMode: '', testId: 'tid' });
    expect(component.label$).toBe('Birthday');
    expect(component.value$).toBe('2024-03-05');
    expect(component.bRequired$).toBe(true);
    expect(component.bReadonly$).toBe(false);
    expect(component.bVisible$).toBe(true);
    expect(component.displayMode$).toBe('');
    expect(component.testId).toBe('tid');
  });

  it('renders the label in edit mode', async () => {
    const { fixture } = await setup();
    expect(fixture.nativeElement.querySelector('mat-label').textContent).toContain('Birthday');
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });

  it('hides the field when not visible', async () => {
    const { fixture } = await setup({ visibility: false });
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it('propagates a picked date to the actions API and clears errors', async () => {
    const { component } = await setup();
    const format = vi.fn().mockReturnValue('2025-12-31');
    component.fieldOnDateChange({ target: { value: { format } } });
    expect(format).toHaveBeenCalledWith('YYYY-MM-DD');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Birthday', '2025-12-31');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Birthday', '2025-12-31');
    expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Birthday' });
  });

  it('renders the formatted value through component-mapper in display-only mode', async () => {
    const { fixture, component } = await setup({ displayMode: 'DISPLAY_ONLY' });
    const mapped = await getMappedComponents(fixture);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].name).toBe('FieldValueList');
    expect(component.formattedValue$).toBeTruthy();
    expect(mapped[0].props.value$).toBe(component.formattedValue$);
    expect(String(component.formattedValue$)).toContain('2024');
    expect(mapped[0].props.label$).toBe('Birthday');
    expect(mapped[0].props.displayMode$).toBe('DISPLAY_ONLY');
  });

  it('does not render the display-only mapper when not visible', async () => {
    const { fixture } = await setup({ displayMode: 'DISPLAY_ONLY', visibility: false });
    expect(await getMappedComponents(fixture)).toHaveLength(0);
  });

  it('falls back to the Text component when read-only', async () => {
    const { fixture } = await setup({ readOnly: true });
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['Text']);
    expect(mapped[0].props.formatAs$).toBe('date');
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it('falls back to the Text component when there is no form group', async () => {
    const { fixture, component } = await setup({}, false);
    expect(component.bHasForm$).toBe(false);
    expect((await getMappedComponents(fixture)).map(m => m.name)).toEqual(['Text']);
  });

  it('shows the server validation message', async () => {
    const { fixture, component } = await setup();
    (component as any).angularPConnectData.validateMessage = 'Date is in the past';
    component.fieldControl.setErrors({ message: true });
    component.fieldControl.markAsTouched();
    component.markForCheck();
    fixture.detectChanges();
    expect(component.hasErrors()).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-error').textContent).toContain('Date is in the past');
  });

  describe('getErrorMessage', () => {
    it('reports required, parse and empty cases', async () => {
      const { component } = await setup();
      component.fieldControl.setErrors({ required: true });
      expect(component.getErrorMessage()).toBe('You must enter a value');
      component.fieldControl.setErrors({ matDatepickerParse: { text: 'abc' } });
      expect(component.getErrorMessage()).toBe('abc is not a valid date value');
      component.fieldControl.setErrors(null);
      expect(component.getErrorMessage()).toBe('');
      expect(component.hasErrors()).toBe(false);
    });
  });
});
