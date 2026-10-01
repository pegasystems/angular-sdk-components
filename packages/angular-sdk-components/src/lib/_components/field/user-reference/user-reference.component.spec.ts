import { FormGroup } from '@angular/forms';
import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReferenceComponent } from './user-reference.component';

describe('UserReferenceComponent', () => {
  let component: UserReferenceComponent;
  let fixture: ComponentFixture<UserReferenceComponent>;
  let updateFieldValue: ReturnType<typeof vi.fn>;
  let triggerFieldChange: ReturnType<typeof vi.fn>;
  let invokeRestApi: ReturnType<typeof vi.fn>;

  const operators = {
    data: {
      data: [
        { pyUserIdentifier: 'u1', pyUserName: 'Alice' },
        { pyUserIdentifier: 'u2', pyUserName: 'Bob' }
      ]
    }
  };

  async function create(config: Record<string, any> = {}) {
    fixture = TestBed.createComponent(UserReferenceComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    updateFieldValue = vi.fn();
    triggerFieldChange = vi.fn();
    invokeRestApi = vi.fn().mockResolvedValue(operators);
    (globalThis as any).PCore.getRestClient = () => ({ invokeRestApi });
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Owner' });
    pConn.getActionsApi = () => ({ updateFieldValue, triggerFieldChange });
    (component as any).pConn$ = pConn;
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await stubComponentMapper();
    await TestBed.configureTestingModule({
      imports: [UserReferenceComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReferenceComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updateSelf maps configProps to component state', async () => {
    await create({ label: 'Owner', value: 'u1', required: 'true', readOnly: false, testId: 't1', placeholder: 'pick', helperText: 'help' });
    expect(component.label$).toBe('Owner');
    expect(component.value$).toBe('u1');
    expect(component.userID$).toBe('u1');
    expect(component.bRequired$).toBe(true);
    expect(component.bReadonly$).toBe(false);
    expect(component.testId).toBe('t1');
    expect(component.placeholder).toBe('pick');
    expect(component.helperText).toBe('help');
    expect(component.propName).toBe('.Owner');
  });

  it('uses userName as the value for an object value and empty when it has none', async () => {
    await create({ value: { userId: 'u1', userName: 'Alice' } });
    expect(component.value$).toBe('Alice');
    expect(component.userID$).toBe('u1');
    await create({ value: { userId: 'u1' } });
    expect(component.value$).toBe('');
  });

  it('prefers the field message over the helper text when visible', async () => {
    await create({ helperText: 'help', showFieldMessage: true, messageConfig: { visibility: true, content: 'Careful' } });
    expect(component.bFieldMessageVisible$).toBe(true);
    expect(component.helperText).toBe('Careful');
  });

  it.each([
    [{ readOnly: true, showAsFormattedText: true, displayAs: 'Search box' }, 'operator'],
    [{ displayAs: 'Drop-down list' }, 'dropdown'],
    [{ displayAs: 'Search box' }, 'searchbox'],
    [{ displayAs: 'Other' }, '']
  ])('computes type for %j as "%s"', async (config, type) => {
    await create({ value: { userId: 'u1', userName: 'Alice' }, ...config });
    expect(component.type).toBe(type);
  });

  it('loads operators and renders options for the dropdown', async () => {
    await create({ label: 'Owner', displayAs: 'Drop-down list' });
    expect(invokeRestApi).toHaveBeenCalledWith('getListData', { queryPayload: { dataViewName: 'D_pyGetOperatorsForCurrentApplication' } }, '');
    expect(component.options$).toEqual([
      { key: 'u1', value: 'Alice' },
      { key: 'u2', value: 'Bob' }
    ]);
    expect(fixture.nativeElement.querySelector('mat-select')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Owner');
  });

  it('does not load operators when not a dropdown or search box', async () => {
    await create({ displayAs: 'Other' });
    expect(invokeRestApi).not.toHaveBeenCalled();
  });

  it('survives a failing operator request', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    fixture = TestBed.createComponent(UserReferenceComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    pConn.getConfigProps = () => ({ displayAs: 'Search box' });
    (globalThis as any).PCore.getRestClient = () => ({ invokeRestApi: () => Promise.reject(new Error('boom')) });
    (component as any).pConn$ = pConn;
    fixture.detectChanges();
    await component.updateSelf();
    expect(log).toHaveBeenCalled();
    expect(component.options$).toBeUndefined();
  });

  it('renders the label and input for the search box', async () => {
    await create({ label: 'Find user', displayAs: 'Search box' });
    expect(fixture.nativeElement.querySelector('input')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Find user');
  });

  it('dropdown change sends updateFieldValue only, mapping "Select" to empty', async () => {
    await create({ displayAs: 'Drop-down list' });
    component.fieldOnChange({ value: 'u2' });
    expect(updateFieldValue).toHaveBeenCalledWith('.Owner', 'u2');
    component.fieldOnChange({ value: 'Select' });
    expect(updateFieldValue).toHaveBeenLastCalledWith('.Owner', '');
    expect(triggerFieldChange).not.toHaveBeenCalled();
  });

  it('fieldOnChange remembers the typed filter text', async () => {
    await create({ displayAs: 'Search box' });
    component.fieldOnChange({ target: { value: 'Al' }, value: 'Al' });
    expect(component.filterValue).toBe('Al');
  });

  it('optionChanged sends the selected option value', async () => {
    await create({ displayAs: 'Search box' });
    component.optionChanged({ option: { value: 'Bob' } });
    expect(updateFieldValue).toHaveBeenCalledWith('.Owner', 'Bob');
  });

  it('blur on the search box maps the typed name to its key and calls both actions', async () => {
    await create({ displayAs: 'Search box' });
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'Bob';
    input.dispatchEvent(new Event('blur'));
    expect(updateFieldValue).toHaveBeenCalledWith('.Owner', 'u2');
    expect(triggerFieldChange).toHaveBeenCalledWith('.Owner', 'u2');
  });

  it('blur keeps the raw text when no option matches and sends empty for an empty field', async () => {
    await create({ displayAs: 'Search box' });
    component.fieldOnBlur({ target: { value: 'zed' } });
    expect(triggerFieldChange).toHaveBeenLastCalledWith('.Owner', 'zed');
    component.fieldOnBlur({ target: { value: '' } });
    expect(triggerFieldChange).toHaveBeenLastCalledWith('.Owner', '');
  });

  it('blur invokes onRecordChange with the resolved key', async () => {
    const onRecordChange = vi.fn();
    await create({ displayAs: 'Search box', onRecordChange });
    const event: any = { target: { value: 'Alice' } };
    component.fieldOnBlur(event);
    expect(onRecordChange).toHaveBeenCalledWith(event);
    expect(event.target.value).toBe('u1');
  });

  it('getValue returns the id for dropdowns and the name for search boxes', async () => {
    await create({ displayAs: 'Drop-down list' });
    expect(component.getValue({ userId: 'u1', userName: 'Alice' })).toBe('u1');
    expect(component.getValue('u9')).toBe('u9');
    await create({ displayAs: 'Search box' });
    expect(component.getValue({ userId: 'u1', userName: 'Alice' })).toBe('Alice');
    expect(component.getValue('u9')).toBe('u9');
  });

  it('shows the validation message from the bridge', async () => {
    await create({ displayAs: 'Search box' });
    (component as any).angularPConnectData.validateMessage = 'Not allowed';
    component.fieldControl.setErrors({ message: true });
    component.fieldControl.markAsTouched();
    fixture.detectChanges();
    expect(component.getErrorMessage()).toBe('Not allowed');
    expect(fixture.nativeElement.querySelector('mat-error').textContent).toContain('Not allowed');
  });

  it('returns the required message for a required error', async () => {
    await create({ displayAs: 'Search box' });
    component.fieldControl.setErrors({ required: true });
    expect(component.getErrorMessage()).toBe('You must enter a value');
    component.fieldControl.setErrors(null);
    expect(component.getErrorMessage()).toBe('');
  });

  it('renders FieldValueList via component-mapper in display mode', async () => {
    await create({ label: 'Owner', value: 'u1', displayMode: 'DISPLAY_ONLY' });
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
    expect(mapped[0].props).toEqual({ label$: 'Owner', value$: 'u1', displayMode$: 'DISPLAY_ONLY' });
  });

  it('renders the Operator component for read-only formatted text with a resolved user', async () => {
    await create({ readOnly: true, showAsFormattedText: true, value: { userId: 'u1', userName: 'Alice' } });
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['Operator']);
    expect(mapped[0].props.name$).toBe('Alice');
  });
});
