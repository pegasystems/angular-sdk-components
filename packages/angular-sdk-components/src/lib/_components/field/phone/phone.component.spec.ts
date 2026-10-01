import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';

import { PhoneComponent } from './phone.component';

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

describe('PhoneComponent', () => {
  let component: PhoneComponent;
  let fixture: ComponentFixture<PhoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('PhoneComponent behaviour', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PhoneComponent] }).compileComponents();
    await stubComponentMapper();
  });

  const cfg = { label: 'Mobile', value: '+442071838750', required: true, readOnly: false, disabled: false, visibility: true };

  it('maps configProps onto component state', () => {
    const { c } = setup(PhoneComponent, cfg);
    expect(c.label$).toBe('Mobile');
    expect(c.value$).toBe('+442071838750');
    expect(c.fieldControl.value).toBe('+442071838750');
    expect(c.bRequired$).toBe(true);
    expect(c.bReadonly$).toBe(false);
    expect(c.bVisible$).toBe(true);
  });

  it('puts the country of the value first in preferredCountries', () => {
    expect(setup(PhoneComponent, cfg).c.preferredCountries).toEqual(['gb', 'us']);
  });

  it('keeps preferredCountries unchanged for a US number or when no value', () => {
    expect(setup(PhoneComponent, { ...cfg, value: '+12025550123' }).c.preferredCountries).toEqual(['us']);
    expect(setup(PhoneComponent, { label: 'x' }).c.preferredCountries).toEqual(['us']);
  });

  it('renders display-only mode through FieldValueList', async () => {
    const { fx } = setup(PhoneComponent, { ...cfg, displayMode: 'DISPLAY_ONLY' });
    const mapped = await getMappedComponents(fx);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].name).toBe('FieldValueList');
    expect(mapped[0].props).toMatchObject({ label$: 'Mobile', value$: '+442071838750', displayMode$: 'DISPLAY_ONLY' });
  });

  it('renders nothing in display mode when invisible', async () => {
    const { fx } = setup(PhoneComponent, { ...cfg, displayMode: 'DISPLAY_ONLY', visibility: false });
    expect(await getMappedComponents(fx)).toHaveLength(0);
  });

  it('falls back to the Text component without a form group', async () => {
    const pConn = createMockPConn();
    pConn.getConfigProps = () => cfg;
    pConn.resolveConfigProps = (p: any) => p;
    const fx = TestBed.createComponent(PhoneComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    fx.detectChanges();
    expect((await getMappedComponents(fx)).map(m => m.name)).toEqual(['Text']);
  });

  it('change sends the new form value to the engine', () => {
    const { c, actions } = setup(PhoneComponent, cfg);
    c.formGroup$.controls[c.controlName$].setValue('+12025550123');
    c.fieldOnChange();
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Field', '+12025550123');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Field', '+12025550123');
  });

  it('change does nothing when the value is unchanged', () => {
    const { c, actions } = setup(PhoneComponent, cfg);
    c.fieldOnChange();
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
  });

  it('getErrorMessage prioritises validation message, required, then invalid', () => {
    const { c } = setup(PhoneComponent, cfg);
    c.angularPConnectData.validateMessage = 'Server says no';
    c.fieldControl.setErrors({ message: true });
    expect(c.getErrorMessage()).toBe('Server says no');
    c.fieldControl.setErrors({ required: true });
    expect(c.getErrorMessage()).toBe('You must enter a value');
    c.fieldControl.setErrors({ other: true });
    expect(c.getErrorMessage()).toBe('Invalid Phone');
    c.fieldControl.setErrors(null);
    expect(c.getErrorMessage()).toBe('');
  });
});
