import { vi } from 'vitest';
import { stubComponentMapper, getMappedComponents } from '../../../../test-utils';
import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownComponent } from './dropdown.component';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownComponent);
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
    pConn.getStateProps = () => ({ value: '.Color' });
    pConn.getActionsApi = () => actions;
    pConn.clearErrorMessages = vi.fn();
    pConn.getCaseInfo = () => ({ getClassName: () => 'Work-Test' });
    pConn.getLocaleRuleNameFromKeys = () => 'rule';
    const fx = TestBed.createComponent(DropdownComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    if (opts.form !== false) (fx.componentInstance as any).formGroup$ = new FormGroup({});
    fx.detectChanges();
    return { fx, comp: fx.componentInstance as any, actions, pConn, el: fx.nativeElement as HTMLElement };
  }

  const datasource = [
    { key: 'R', value: 'Red' },
    { key: 'G', value: 'Green' }
  ];
  const base = {
    label: 'Colour',
    value: 'R',
    required: true,
    readOnly: false,
    visibility: true,
    displayMode: '',
    listType: 'associated',
    datasource
  };

  it('updateSelf maps config props to component state', () => {
    const { comp } = setup(base);
    expect(comp.label$).toBe('Colour');
    expect(comp.value$).toBe('R');
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

  it('builds options from an associated datasource with a leading placeholder option', () => {
    const { comp } = setup(base);
    expect(comp.options$).toEqual([{ key: 'Select', value: 'Select...' }, ...datasource]);
  });

  it('uses the authored placeholder for the placeholder option', () => {
    const { comp } = setup({ ...base, placeholder: 'Pick one' });
    expect(comp.options$[0]).toEqual({ key: 'Select', value: 'Pick one' });
  });

  it('resolves localizedValue from the option matching the value', () => {
    const { comp } = setup(base);
    expect(comp.localizedValue).toBe('Red');
  });

  it("defaults an empty value to 'Select' when editable but not when readOnly", () => {
    expect(setup({ ...base, value: '' }).comp.value$).toBe('Select');
    expect(setup({ ...base, value: '', readOnly: true }).comp.value$).toBe('');
  });

  it('derives locale info for an associated datasource from the property name', () => {
    const { comp } = setup(base);
    expect(comp.localeContext).toBe('associated');
    expect(comp.localeClass).toBe('Work-Test');
    expect(comp.localeName).toBe('Color');
    expect(comp.localePath).toBe('Color');
  });

  it('derives locale info for a DataPage datasource from the field metadata', () => {
    const { comp } = setup({
      ...base,
      fieldMetadata: { classID: 'Work-Test', datasource: { tableType: 'DataPage', name: 'D_Colours', propertyForDisplayText: '@P .Label' } }
    });
    expect(comp.localeContext).toBe('datapage');
    expect(comp.localeClass).toBe('@baseclass');
    expect(comp.localeName).toBe('D_Colours');
    expect(comp.localePath).toBe('Label');
  });

  it('renders the label and a select', () => {
    const { el } = setup(base);
    expect(el.querySelector('mat-label')?.textContent).toContain('Colour');
    expect(el.querySelector('mat-select')).not.toBeNull();
  });

  it('does not render the select when not visible', () => {
    const { el } = setup({ ...base, visibility: false });
    expect(el.querySelector('mat-select')).toBeNull();
  });

  it('fieldOnChange calls updateFieldValue and triggerFieldChange, clears errors and emits the value', () => {
    const { comp, actions, pConn } = setup(base);
    const emitted: any[] = [];
    comp.onRecordChange.subscribe((v: any) => emitted.push(v));
    comp.fieldOnChange({ value: 'G' });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Color', 'G');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Color', 'G');
    expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Color' });
    expect(emitted).toEqual(['G']);
  });

  it("fieldOnChange converts the 'Select' placeholder to an empty value", () => {
    const { comp, actions } = setup(base);
    comp.fieldOnChange({ value: 'Select' });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Color', '');
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Color', '');
  });

  it('isSelected compares against the current value', () => {
    const { comp } = setup(base);
    expect(comp.isSelected('R')).toBe(true);
    expect(comp.isSelected('G')).toBe(false);
  });

  it('shows the validation message from the bridge when the control has a message error', () => {
    const { comp, fx, el } = setup(base);
    comp.angularPConnectData.validateMessage = 'Pick a colour';
    comp.fieldControl.setErrors({ message: true });
    comp.fieldControl.markAsTouched();
    fx.detectChanges();
    expect(comp.getErrorMessage()).toBe('Pick a colour');
    expect(el.querySelector('mat-error')?.textContent).toContain('Pick a colour');
  });

  it('renders FieldValueList with the localized value in display mode', async () => {
    await stubComponentMapper();
    const { fx } = setup({ ...base, displayMode: 'DISPLAY_ONLY' });
    const mapped = await getMappedComponents(fx);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].name).toBe('FieldValueList');
    expect(mapped[0].props).toMatchObject({ label$: 'Colour', value$: 'Red', displayMode$: 'DISPLAY_ONLY' });
  });

  it('renders the Text component when readOnly or without a form group', async () => {
    await stubComponentMapper();
    const a = setup({ ...base, readOnly: true });
    expect((await getMappedComponents(a.fx)).map(m => m.name)).toEqual(['Text']);
    const b = setup(base, { form: false });
    expect((await getMappedComponents(b.fx)).map(m => m.name)).toEqual(['Text']);
  });

  it('loads options from a data page when the datasource is a string', async () => {
    const fetchData = vi.fn().mockResolvedValue({
      data: [
        { Code: 'A', Name: 'Alpha' },
        { Name: 'Beta', pyGUID: 'guid-2', Code: '' }
      ]
    });
    const init = vi.fn().mockResolvedValue({ fetchData });
    (globalThis as any).PCore.getDataApi = () => ({ init });
    const { comp, pConn } = setup({
      ...base,
      listType: 'datapage',
      datasource: 'D_List',
      columns: [
        { key: 'true', value: '.Code' },
        { display: 'true', primary: 'true', value: '.Name' }
      ]
    });
    pConn.getContextName = () => 'ctx';
    await vi.waitFor(() => expect(comp.options$?.length).toBe(3));
    expect(init.mock.calls[0][0]).toMatchObject({ dataSource: 'D_List', listType: 'datapage' });
    expect(comp.options$).toEqual([
      { key: 'Select', value: 'Select...' },
      { key: 'A', value: 'Alpha' },
      { key: 'guid-2', value: 'Beta' }
    ]);
  });

  it('does not fetch data for an associated datasource', () => {
    const init = vi.fn();
    (globalThis as any).PCore.getDataApi = () => ({ init });
    setup(base);
    expect(init).not.toHaveBeenCalled();
  });
});
