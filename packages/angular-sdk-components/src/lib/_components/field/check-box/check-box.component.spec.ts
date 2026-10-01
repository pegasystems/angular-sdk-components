import { FormGroup } from '@angular/forms';
import { vi } from 'vitest';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckBoxComponent } from './check-box.component';

describe('CheckBoxComponent', () => {
  let component: CheckBoxComponent;
  let fixture: ComponentFixture<CheckBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckBoxComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckBoxComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('CheckBoxComponent behaviour', () => {
  let actions: { updateFieldValue: any; triggerFieldChange: any };
  let listActions: { insert: any; deleteEntry: any; initDefaultPageInstructions: any };
  let validate: any;
  let pConn: any;
  let config: any;

  async function setup(cfg: any = {}, withForm = true): Promise<{ fixture: ComponentFixture<CheckBoxComponent>; component: CheckBoxComponent }> {
    config = { label: 'Terms', caption: 'I agree', ...cfg };
    actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
    listActions = { insert: vi.fn(), deleteEntry: vi.fn(), initDefaultPageInstructions: vi.fn() };
    validate = vi.fn();
    pConn = createMockPConn();
    pConn.getConfigProps = () => config;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Agree' });
    pConn.getActionsApi = () => actions;
    pConn.getListActions = () => listActions;
    pConn.getValidationApi = () => ({ validate });
    pConn.setReferenceList = vi.fn();
    pConn.getFieldMetadata = () => ({});
    pConn.clearErrorMessages = vi.fn();
    const fixture = TestBed.createComponent(CheckBoxComponent);
    const component = fixture.componentInstance;
    (component as any).pConn$ = pConn;
    if (withForm) (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
    return { fixture, component };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CheckBoxComponent] }).compileComponents();
    await stubComponentMapper();
  });

  it('maps configProps to component state', async () => {
    const { component } = await setup({ required: true, readOnly: false, visibility: true, displayMode: '', value: true, trueLabel: 'On' });
    expect(component.label$).toBe('Terms');
    expect(component.caption$).toBe('I agree');
    expect(component.bRequired$).toBe(true);
    expect(component.bReadonly$).toBe(false);
    expect(component.bVisible$).toBe(true);
    expect(component.displayMode$).toBe('');
    expect(component.value$).toBe(true);
    expect(component.isChecked$).toBe(true);
    expect(component.trueLabel$).toBe('On');
    expect(component.falseLabel$).toBe('No');
    expect(component.showLabel$).toBe(true);
  });

  it('treats the string "true" as checked and anything else as unchecked', async () => {
    expect((await setup({ value: 'true' })).component.isChecked$).toBe(true);
    expect((await setup({ value: 'false' })).component.isChecked$).toBe(false);
    expect((await setup({})).component.isChecked$).toBe(false);
  });

  it('renders the label and caption and a checkbox', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('label.psdk-label-readonly')?.textContent).toContain('Terms');
    expect(el.querySelector('mat-checkbox')?.textContent).toContain('I agree');
  });

  it('hides everything when not visible', async () => {
    const { fixture } = await setup({ visibility: false });
    expect(fixture.nativeElement.querySelector('mat-checkbox')).toBeNull();
  });

  it('renders the Yes/No label through component-mapper in display-only mode', async () => {
    const checked = await setup({ displayMode: 'DISPLAY_ONLY', value: true });
    let mapped = await getMappedComponents(checked.fixture);
    expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
    expect(mapped[0].props.value$).toBe('Yes');
    expect(mapped[0].props.label$).toBe('I agree');
    expect(mapped[0].props.displayMode$).toBe('DISPLAY_ONLY');
    const unchecked = await setup({ displayMode: 'DISPLAY_ONLY', value: false, falseLabel: 'Nope' });
    mapped = await getMappedComponents(unchecked.fixture);
    expect(mapped[0].props.value$).toBe('Nope');
  });

  it('falls back to the Text component when there is no form group', async () => {
    const { fixture } = await setup({}, false);
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['Text']);
    expect(mapped[0].props.formatAs$).toBe('text');
  });

  it('renders the SelectableCard for the card variant', async () => {
    const { fixture } = await setup({ variant: 'card' });
    const mapped = await getMappedComponents(fixture);
    expect(mapped.map(m => m.name)).toEqual(['SelectableCard']);
    expect(mapped[0].props.type).toBe('checkbox');
    expect(fixture.nativeElement.querySelector('h4').textContent).toContain('Terms');
  });

  it('change sends the checked state to the actions API and clears errors', async () => {
    const { component } = await setup();
    const event: any = { checked: true };
    component.fieldOnChange(event);
    expect(event.value).toBe(true);
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Agree', true);
    expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Agree', true);
    expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Agree' });
  });

  it('blur validates the checked state in single mode', async () => {
    const { component } = await setup();
    component.fieldOnBlur({ target: { checked: false } });
    expect(validate).toHaveBeenCalledWith(false);
  });

  it('shows the server validation message', async () => {
    const { fixture, component } = await setup();
    (component as any).angularPConnectData.validateMessage = 'Must accept';
    component.fieldControl.setErrors({ message: true });
    component.fieldControl.markAsTouched();
    component.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-error').textContent).toContain('Must accept');
  });

  describe('multi selection mode', () => {
    const multi = {
      selectionMode: 'multi',
      referenceList: 'Items',
      selectionList: '.Items',
      selectionKey: '.pyID',
      primaryField: '.Name',
      readonlyContextList: [{ pyID: 'b' }],
      datasource: {
        source: [
          { key: 'a', value: 'A', text: 'Alpha' },
          { key: 'b', value: 'B' }
        ]
      }
    };

    it('builds the checkbox list with selection state and initialises the reference list', async () => {
      const { component } = await setup(multi);
      expect(component.listOfCheckboxes.map(c => [c.key, c.selected])).toEqual([
        ['a', false],
        ['b', true]
      ]);
      expect(pConn.setReferenceList).toHaveBeenCalledWith('.Items');
      expect(listActions.initDefaultPageInstructions).toHaveBeenCalled();
    });

    it('renders one checkbox per item using text, falling back to value', async () => {
      const { fixture } = await setup(multi);
      const boxes = Array.from(fixture.nativeElement.querySelectorAll('mat-checkbox')) as HTMLElement[];
      expect(boxes.map(b => b.textContent?.trim())).toEqual(['Alpha', 'B']);
    });

    it('inserts an instruction when an unselected item is toggled and deletes when selected', async () => {
      const { component } = await setup(multi);
      component.handleChangeMultiMode({}, component.listOfCheckboxes[0]);
      expect(listActions.insert).toHaveBeenCalledWith({ pyID: 'a', Name: 'Alpha', nonFormProperties: ['Name'] }, 0);
      expect(listActions.deleteEntry).not.toHaveBeenCalled();
      component.handleChangeMultiMode({}, component.listOfCheckboxes[1]);
      expect(listActions.deleteEntry).toHaveBeenCalledWith(-1);
      expect(pConn.clearErrorMessages).toHaveBeenCalledWith({ property: '.Items', category: '', context: '' });
    });

    it('blur validates the selected values against the selection list', async () => {
      const { component } = await setup(multi);
      component.fieldOnBlur({ target: { checked: true } });
      expect(validate).toHaveBeenCalledWith([{ pyID: 'b' }], '.Items');
    });
  });
});
