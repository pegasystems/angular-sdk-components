import { vi } from 'vitest';
import { stubComponentMapper, getMappedComponents } from '../../../../test-utils';
import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailComponent } from './email.component';

describe('EmailComponent', () => {
  let component: EmailComponent;
  let fixture: ComponentFixture<EmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function setup(config: Record<string, any>, opts: { form?: boolean; stateValue?: string } = {}) {
    const actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
    const pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: opts.stateValue ?? '.Prop' });
    pConn.getActionsApi = () => actions;
    pConn.clearErrorMessages = vi.fn();
    const fx = TestBed.createComponent(EmailComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    if (opts.form !== false) (fx.componentInstance as any).formGroup$ = new FormGroup({});
    fx.detectChanges();
    return { fx, comp: fx.componentInstance as any, actions, pConn, el: fx.nativeElement as HTMLElement };
  }

  const base = { label: 'Work email', value: 'a@b.com', required: true, readOnly: false, visibility: true, displayMode: '' };

  it('updateSelf maps config props to component state', () => {
    const { comp } = setup({ ...base, readOnly: false });
    expect(comp.label$).toBe('Work email');
    expect(comp.value$).toBe('a@b.com');
    expect(comp.bRequired$).toBe(true);
    expect(comp.bReadonly$).toBe(false);
    expect(comp.bVisible$).toBe(true);
    expect(comp.displayMode$).toBe('');
  });

  it('maps readOnly, visibility and displayMode', () => {
    const { comp } = setup({ ...base, readOnly: true, visibility: false, displayMode: 'DISPLAY_ONLY' });
    expect(comp.bReadonly$).toBe(true);
    expect(comp.bVisible$).toBe(false);
    expect(comp.displayMode$).toBe('DISPLAY_ONLY');
  });

  it('renders the label and an email input holding the value', () => {
    const { el } = setup(base);
    expect(el.querySelector('mat-label')?.textContent).toContain('Work email');
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('email');
    expect(input.value).toBe('a@b.com');
  });

  it('does not render the input when not visible', () => {
    const { el } = setup({ ...base, visibility: false });
    expect(el.querySelector('input')).toBeNull();
  });

  it('blur with a changed value calls updateFieldValue and triggerFieldChange with the new value', () => {
    const { el, fx, actions } = setup(base);
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'new@b.com';
    input.dispatchEvent(new Event('blur'));
    fx.detectChanges();
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Prop', 'new@b.com');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Prop', 'new@b.com');
  });

  it('blur with an unchanged value does not call the actions API', () => {
    const { el, actions } = setup(base);
    (el.querySelector('input') as HTMLInputElement).dispatchEvent(new Event('blur'));
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
    expect(actions.triggerFieldChange).not.toHaveBeenCalled();
  });

  it('change with a changed value clears the error messages for the property', () => {
    const { el, pConn } = setup(base);
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'other@b.com';
    input.dispatchEvent(new Event('change'));
    expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Prop' });
  });

  it('change with an unchanged value does not clear error messages', () => {
    const { el, pConn } = setup(base);
    (el.querySelector('input') as HTMLInputElement).dispatchEvent(new Event('change'));
    expect(pConn.clearErrorMessages).not.toHaveBeenCalled();
  });

  it('shows the validation message from the bridge when the control has a message error', () => {
    const { comp, fx, el } = setup(base);
    comp.angularPConnectData.validateMessage = 'Invalid email address';
    comp.fieldControl.setErrors({ message: true });
    comp.fieldControl.markAsTouched();
    comp.markForCheck();
    fx.detectChanges();
    expect(comp.getErrorMessage()).toBe('Invalid email address');
    expect(el.querySelector('mat-error')?.textContent).toContain('Invalid email address');
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
    expect(mapped[0].props).toMatchObject({ label$: 'Work email', value$: 'a@b.com', displayMode$: 'DISPLAY_ONLY' });
  });

  it('renders the Text component instead of an input when readOnly', async () => {
    await stubComponentMapper();
    const { fx, el } = setup({ ...base, readOnly: true });
    const mapped = await getMappedComponents(fx);
    expect(mapped.map(m => m.name)).toEqual(['Text']);
    expect(el.querySelector('input')).toBeNull();
  });

  it('renders the Text component when there is no form group', async () => {
    await stubComponentMapper();
    const { fx, comp } = setup(base, { form: false });
    expect(comp.bHasForm$).toBe(false);
    expect((await getMappedComponents(fx)).map(m => m.name)).toEqual(['Text']);
  });
});
