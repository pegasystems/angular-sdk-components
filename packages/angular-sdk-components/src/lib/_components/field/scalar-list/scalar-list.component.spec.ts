import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { getMappedComponents, stubComponentMapper } from '../../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScalarListComponent } from './scalar-list.component';

describe('ScalarListComponent', () => {
  let component: ScalarListComponent;
  let fixture: ComponentFixture<ScalarListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScalarListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ScalarListComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('behaviour', () => {
    let createComponent: ReturnType<typeof vi.fn>;

    const setup = (config: any) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [ScalarListComponent] });
      const pConn = createMockPConn();
      pConn.getConfigProps = () => config;
      pConn.resolveConfigProps = (p: any) => p;
      createComponent = vi.fn((def: any) => ({ getPConnect: () => ({ getComponentName: () => def.type, def }) }));
      pConn.createComponent = createComponent;
      const fx = TestBed.createComponent(ScalarListComponent);
      fx.componentInstance.pConn$ = pConn;
      fx.componentInstance.formGroup$ = new FormGroup({});
      fx.detectChanges();
      return fx;
    };

    beforeEach(async () => {
      await stubComponentMapper();
    });

    it('creates a read-only display component per scalar value', () => {
      const c = setup({
        label: 'Tags',
        displayMode: 'DISPLAY_ONLY',
        componentType: 'TextInput',
        value: ['a', 'b'],
        restProps: { extra: 1 }
      }).componentInstance;
      expect(createComponent).toHaveBeenCalledTimes(2);
      expect(createComponent.mock.calls[0][0]).toEqual({
        type: 'TextInput',
        config: { value: 'a', displayMode: 'DISPLAY_ONLY', label: 'Tags', extra: 1, readOnly: true }
      });
      expect(createComponent.mock.calls[1][0].config.value).toBe('b');
      expect(c.items).toHaveLength(2);
      expect(c.value$).toBe(c.items);
      expect(c.label$).toBe('Tags');
      expect(c.displayMode$).toBe('DISPLAY_ONLY');
      expect(c.isDisplayModeEnabled).toBe(true);
    });

    it('renders one mapped component per item when the display mode is enabled', async () => {
      const fx = setup({ label: 'Tags', displayMode: 'STACKED_LARGE_VAL', componentType: 'TextInput', value: ['a', 'b', 'c'] });
      expect(fx.componentInstance.isDisplayModeEnabled).toBe(true);
      const mapped = await getMappedComponents(fx);
      expect(mapped.map(m => m.name)).toEqual(['TextInput', 'TextInput', 'TextInput']);
      expect(mapped[1].props.pConn$.def.config.value).toBe('b');
    });

    it('falls back to FieldValueList when the display mode is not display-only', async () => {
      const fx = setup({ label: 'Tags', displayMode: 'LABELS_LEFT', componentType: 'TextInput', value: ['a'] });
      expect(fx.componentInstance.isDisplayModeEnabled).toBe(false);
      const mapped = await getMappedComponents(fx);
      expect(mapped.map(m => m.name)).toEqual(['FieldValueList']);
      expect(mapped[0].props).toMatchObject({ label$: 'Tags', displayMode$: 'LABELS_LEFT' });
      expect(mapped[0].props.value$).toHaveLength(1);
    });

    it('defaults displayMode to empty and tolerates a missing value list', async () => {
      const fx = setup({ label: 'Tags', componentType: 'TextInput' });
      expect(fx.componentInstance.displayMode$).toBe('');
      expect(fx.componentInstance.items).toBeUndefined();
      expect(createComponent).not.toHaveBeenCalled();
      expect((await getMappedComponents(fx)).map(m => m.name)).toEqual(['FieldValueList']);
    });
  });
});
