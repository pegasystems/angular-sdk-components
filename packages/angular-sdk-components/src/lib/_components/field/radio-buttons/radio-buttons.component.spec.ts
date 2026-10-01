import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioButtonsComponent } from './radio-buttons.component';

describe('RadioButtonsComponent', () => {
  let component: RadioButtonsComponent;
  let fixture: ComponentFixture<RadioButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioButtonsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioButtonsComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('behaviour', () => {
    let actions: { updateFieldValue: ReturnType<typeof vi.fn>; triggerFieldChange: ReturnType<typeof vi.fn> };

    const setup = (config: any, caseClass = 'Work-Class') => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [RadioButtonsComponent] });
      const pConn = createMockPConn();
      actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
      pConn.getConfigProps = () => config;
      pConn.resolveConfigProps = (p: any) => p;
      pConn.getActionsApi = () => actions;
      pConn.getStateProps = () => ({ value: '.Color' });
      pConn.getCaseInfo = () => ({ getClassName: () => caseClass });
      const fx = TestBed.createComponent(RadioButtonsComponent);
      fx.componentInstance.pConn$ = pConn;
      fx.componentInstance.formGroup$ = new FormGroup({});
      fx.detectChanges();
      return fx;
    };

    const options = [
      { key: 'R', value: 'Red' },
      { key: 'G', value: 'Green' }
    ];

    beforeEach(async () => {
      await stubComponentMapper();
    });

    it('maps config props to component state', () => {
      const fx = setup({
        label: 'Colour',
        value: 'G',
        required: true,
        readOnly: false,
        visibility: true,
        displayMode: '',
        inline: true,
        listType: 'associated',
        datasource: options
      });
      const c = fx.componentInstance;
      expect(c.label$).toBe('Colour');
      expect(c.value$).toBe('G');
      expect(c.bRequired$).toBe(true);
      expect(c.bReadonly$).toBe(false);
      expect(c.bVisible$).toBe(true);
      expect(c.displayMode$).toBe('');
      expect(c.bInline$).toBe(true);
      expect(c.options$).toEqual(options);
      expect(c.propName).toBe('.Color');
    });

    it('renders the label and one radio button per option, with the current value selected', () => {
      const fx = setup({ label: 'Colour', value: 'G', visibility: true, listType: 'associated', datasource: options });
      const el: HTMLElement = fx.nativeElement;
      expect(el.querySelector('mat-label')?.textContent).toContain('Colour');
      const buttons = Array.from(el.querySelectorAll('mat-radio-button'));
      expect(buttons.map(b => b.textContent?.trim())).toEqual(['Red', 'Green']);
      const inputs = Array.from(el.querySelectorAll<HTMLInputElement>('input[type=radio]'));
      expect(inputs.map(i => i.checked)).toEqual([false, true]);
      expect(el.querySelector('.psdk-radio-vertical')).toBeTruthy();
    });

    it('uses the horizontal layout when inline', () => {
      const fx = setup({ label: 'Colour', visibility: true, inline: true, listType: 'associated', datasource: options });
      expect(fx.nativeElement.querySelector('.psdk-radio-horizontal')).toBeTruthy();
      expect(fx.nativeElement.querySelector('.psdk-radio-vertical')).toBeNull();
    });

    it('renders nothing when not visible', () => {
      const fx = setup({ label: 'Colour', visibility: false, listType: 'associated', datasource: options });
      expect(fx.nativeElement.querySelector('mat-radio-group')).toBeNull();
    });

    it('disables the radio buttons when read only', () => {
      const fx = setup({ label: 'Colour', visibility: true, readOnly: true, listType: 'associated', datasource: options });
      const inputs = Array.from(fx.nativeElement.querySelectorAll('input[type=radio]')) as HTMLInputElement[];
      expect(inputs.every(i => i.disabled)).toBe(true);
    });

    it('updates the field value and triggers the field change when an option is picked', () => {
      const fx = setup({ label: 'Colour', visibility: true, listType: 'associated', datasource: options });
      const inputs = fx.nativeElement.querySelectorAll('input[type=radio]') as NodeListOf<HTMLInputElement>;
      inputs[1].click();
      expect(actions.updateFieldValue).toHaveBeenCalledWith('.Color', 'G');
      expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Color', 'G');
    });

    it('fieldOnChange sends the selected value through the actions API', () => {
      const fx = setup({ label: 'Colour', visibility: true, listType: 'associated', datasource: options });
      fx.componentInstance.fieldOnChange({ value: 'R' });
      expect(actions.updateFieldValue).toHaveBeenCalledWith('.Color', 'R');
      expect(actions.triggerFieldChange).toHaveBeenCalledWith('.Color', 'R');
    });

    it('isSelected compares against the current value', () => {
      const fx = setup({ value: 'R', visibility: true, listType: 'associated', datasource: options });
      expect(fx.componentInstance.isSelected('R')).toBe(true);
      expect(fx.componentInstance.isSelected('G')).toBe(false);
    });

    it('exposes the server validation message and the required message via getErrorMessage', () => {
      const c = setup({ label: 'Colour', visibility: true, listType: 'associated', datasource: options }).componentInstance;
      c.fieldControl.setErrors({ required: true });
      expect(c.getErrorMessage()).toBe('You must enter a value');
      (c as any).angularPConnectData.validateMessage = 'Pick a colour';
      c.fieldControl.setErrors({ message: true });
      expect(c.fieldControl.invalid).toBe(true);
      expect(c.getErrorMessage()).toBe('Pick a colour');
    });

    it('renders mat-error once the control is invalid and touched', () => {
      const fx = setup({ label: 'Colour', visibility: true, listType: 'associated', datasource: options });
      const c = fx.componentInstance;
      c.fieldControl.setErrors({ required: true });
      c.fieldControl.markAsTouched();
      c.markForCheck();
      fx.detectChanges();
      expect(fx.nativeElement.querySelector('mat-error')?.textContent).toContain('You must enter a value');
    });

    it('renders helper text from the config', () => {
      const fx = setup({ label: 'Colour', visibility: true, helperText: 'Choose one', listType: 'associated', datasource: options });
      expect(fx.nativeElement.querySelector('mat-hint')?.textContent).toContain('Choose one');
    });

    it('renders FieldValueList with the localized value in display mode', async () => {
      const fx = setup({ label: 'Colour', value: 'G', displayMode: 'DISPLAY_ONLY', visibility: true, listType: 'associated', datasource: options });
      const mapped = await getMappedComponents(fx);
      expect(mapped).toHaveLength(1);
      expect(mapped[0].name).toBe('FieldValueList');
      expect(mapped[0].props).toMatchObject({ label$: 'Colour', value$: 'G', displayMode$: 'DISPLAY_ONLY' });
      expect(fx.nativeElement.querySelector('mat-radio-group')).toBeNull();
    });

    it('renders nothing in display mode when not visible', async () => {
      const fx = setup({ label: 'Colour', displayMode: 'DISPLAY_ONLY', visibility: false });
      expect(await getMappedComponents(fx)).toHaveLength(0);
    });

    it('delegates to SelectableCard for the card variant', async () => {
      const fx = setup({ label: 'Colour', variant: 'card', visibility: true });
      const mapped = await getMappedComponents(fx);
      expect(mapped.map(m => m.name)).toEqual(['SelectableCard']);
      expect(mapped[0].props).toMatchObject({ type: 'radio' });
      expect(fx.nativeElement.querySelector('h4')?.textContent).toContain('Colour');
      expect(fx.nativeElement.querySelector('mat-radio-group')).toBeNull();
    });

    it('derives datapage locale info from the field metadata', () => {
      const fx = setup({
        label: 'Colour',
        visibility: true,
        listType: 'associated',
        datasource: options,
        fieldMetadata: { datasource: { tableType: 'DataPage', name: 'D_Colors', propertyForDisplayText: '.pyLabel' } }
      });
      const c = fx.componentInstance;
      expect(c.localeContext).toBe('datapage');
      expect(c.localeClass).toBe('@baseclass');
      expect(c.localeName).toBe('D_Colors');
      expect(c.localePath).toBe('pyLabel');
    });

    it('derives associated locale info and picks metadata by class from an array', () => {
      const fx = setup(
        {
          label: 'Colour',
          visibility: true,
          listType: 'associated',
          datasource: options,
          fieldMetadata: [{ classID: 'Other', datasource: { tableType: 'DataPage' } }, { classID: 'My-Class' }]
        },
        'My-Class'
      );
      const c = fx.componentInstance;
      expect(c.localeContext).toBe('associated');
      expect(c.localeClass).toBe('My-Class');
      expect(c.localeName).toBe('Color');
      expect(c.localePath).toBe('Color');
    });

    it('localizes option captions through the localization service', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [RadioButtonsComponent] });
      const pConn = createMockPConn();
      pConn.getConfigProps = () => ({ label: 'Colour', visibility: true, listType: 'associated', datasource: options });
      pConn.resolveConfigProps = (p: any) => p;
      pConn.getStateProps = () => ({ value: '.Color' });
      pConn.getLocalizationService = () => ({ getLocalizedText: (t: string) => `loc:${t}` });
      const fx = TestBed.createComponent(RadioButtonsComponent);
      fx.componentInstance.pConn$ = pConn;
      fx.componentInstance.formGroup$ = new FormGroup({});
      fx.detectChanges();
      const texts = Array.from(fx.nativeElement.querySelectorAll('mat-radio-button')).map((b: any) => b.textContent.trim());
      expect(texts).toEqual(['loc:Red', 'loc:Green']);
    });
  });
});
