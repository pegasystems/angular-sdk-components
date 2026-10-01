import { FormGroup } from '@angular/forms';
import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyComponent } from './currency.component';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('CurrencyComponent behaviour', () => {
  let actions: { updateFieldValue: any; triggerFieldChange: any };
  let pConn: any;
  let config: any;

  async function setup(cfg: any = {}, withForm = true): Promise<{ fixture: ComponentFixture<CurrencyComponent>; component: CurrencyComponent }> {
    config = { label: 'LABEL', ...cfg };
    actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
    pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Prop' });
    pConn.getActionsApi = () => actions;
    pConn.clearErrorMessages = vi.fn();
    pConn.getValidationApi = () => ({ validate: vi.fn() });
    const fixture = TestBed.createComponent(CurrencyComponent);
    const component = fixture.componentInstance;
    (component as any).pConn$ = pConn;
    if (withForm) (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CurrencyComponent] }).compileComponents();
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

  it('renders a readonly input when read-only', async () => {
    const { fixture } = await setup({ readOnly: true });
    expect(fixture.nativeElement.querySelector('input').readOnly).toBe(true);
    const editable = await setup({ readOnly: false });
    expect(editable.fixture.nativeElement.querySelector('input').readOnly).toBe(false);
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

  it('parses a string value to a number and applies it to the control', async () => {
    const { component } = await setup({ value: '1234.5' });
    expect(component.value$).toBe(1234.5);
    expect(component.fieldControl.value).toBe(1234.5);
  });

  it('derives symbol and separators from the ISO code and precision from allowDecimals', async () => {
    const usd = await setup({ currencyISOCode: 'USD', allowDecimals: true });
    expect(usd.component.currencySymbol).toBe('$');
    expect(usd.component.thousandSeparator).toBe(',');
    expect(usd.component.decimalSeparator).toBe('.');
    expect(usd.component.decimalPrecision).toBe(2);
    const eur = await setup({ currencyISOCode: 'EUR', allowDecimals: false });
    expect(eur.component.currencySymbol).toBe('€');
    expect(eur.component.decimalPrecision).toBe(0);
  });

  it('renders the formatted currency through component-mapper in display-only mode', async () => {
    const { fixture, component } = await setup({ displayMode: 'DISPLAY_ONLY', value: 1234.5, currencyISOCode: 'USD' });
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
    expect(component.formattedValue).toContain('1,234.5');
    expect(mapped[0].props.value$).toBe(component.formattedValue);
    expect(mapped[0].props.displayMode$).toBe('DISPLAY_ONLY');
  });

  it('on blur sends the numeric text (symbol and group separators stripped) when the value changed', async () => {
    const { component } = await setup({ value: 10, currencyISOCode: 'USD' });
    component.fieldOnBlur({ target: { value: '$1,234.50' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', '1234.50');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Prop', '1234.50');
  });

  it('on blur converts a comma decimal separator to a dot', async () => {
    const { component } = await setup({ value: 10, currencyISOCode: 'EUR' });
    component.decimalSeparator = ',';
    component.thousandSeparator = '.';
    component.fieldOnBlur({ target: { value: '€1.234,50' } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', '1234.50');
  });

  it('on blur does nothing when the value is unchanged', async () => {
    const { component } = await setup({ value: 10 });
    component.fieldOnBlur({ target: { value: '10' } });
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });
});
