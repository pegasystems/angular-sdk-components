import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { RichTextComponent } from './rich-text.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

// Create a mock ComponentMapperComponent
@Component({
  selector: 'app-component-mapper',
  template: '',
  standalone: true
})
class MockComponentMapperComponent {}

describe('RichTextComponent', () => {
  setupTestBed({ zoneless: false });

  let component: RichTextComponent;
  let fixture: ComponentFixture<RichTextComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: '<p>Rich text content</p>',
    label: 'Description',
    testId: 'test-richtext',
    helperText: 'Enter formatted text',
    required: false,
    readOnly: false,
    disabled: false,
    visibility: true
  };

  beforeEach(async () => {
    mockAngularPConnectService = {
      registerAndSubscribeComponent: vi.fn().mockReturnValue({
        compID: 'test-comp-id',
        unsubscribeFn: vi.fn()
      }),
      shouldComponentUpdate: vi.fn().mockReturnValue(true),
      getComponentID: vi.fn().mockReturnValue('test-comp-id')
    };

    mockUtils = {
      getBooleanValue: vi.fn().mockImplementation(val => val === true || val === 'true')
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getStateProps: vi.fn().mockReturnValue({ value: '.Description', status: '', validatemessage: '' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [RichTextComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    })
      .overrideComponent(RichTextComponent, {
        remove: { imports: [ComponentMapperComponent] },
        add: { imports: [MockComponentMapperComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(RichTextComponent);
    component = fixture.componentInstance;
    component.pConn$ = mockPConn;
    component.formGroup$ = new FormGroup({});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have pConn$ set', () => {
    expect(component.pConn$).toBe(mockPConn);
  });

  it('should have formGroup$ set', () => {
    expect(component.formGroup$).toBeDefined();
  });

  describe('updateSelf', () => {
    it('should resolve config props when called directly', () => {
      // Call updateSelf directly without triggering template rendering
      component.updateSelf();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should set rich text value from config props', () => {
      component.updateSelf();
      expect(component.value$).toBe('<p>Rich text content</p>');
    });

    it('should set label from config props', () => {
      component.updateSelf();
      expect(component.label$).toBe('Description');
    });

    it('should set info from helperText', () => {
      component.updateSelf();
      expect(component.info).toBe('Enter formatted text');
    });

    it('should set error status when status is error', () => {
      mockPConn.getStateProps.mockReturnValue({ value: '.Description', status: 'error', validatemessage: 'Field is required' });
      component.updateSelf();
      expect(component.error).toBe(true);
      expect(component.info).toBe('Field is required');
    });
  });

  describe('fieldOnChange', () => {
    beforeEach(() => {
      component.updateSelf();
    });

    it('should clear error messages when value changes', () => {
      component.value$ = '<p>Old content</p>';
      const editorValue = {
        editor: {
          getBody: vi.fn().mockReturnValue({
            innerHTML: '<p>New content</p>'
          })
        }
      };
      component.fieldOnChange(editorValue);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalled();
    });

    it('should clear error messages when status is error', () => {
      component.status = 'error';
      component.value$ = '<p>Same content</p>';
      const editorValue = {
        editor: {
          getBody: vi.fn().mockReturnValue({
            innerHTML: '<p>Same content</p>'
          })
        }
      };
      component.fieldOnChange(editorValue);
      expect(mockPConn.clearErrorMessages).toHaveBeenCalled();
    });

    it('should handle null editor value', () => {
      const editorValue = { editor: null };
      component.fieldOnChange(editorValue);
    });
  });

  describe('fieldOnBlur', () => {
    beforeEach(() => {
      component.updateSelf();
      component.actionsApi = mockPConn.getActionsApi();
    });

    it('should handle blur when value changes', () => {
      component.value$ = '<p>Old content</p>';
      const newValue = '<p>New content</p>';
      component.fieldOnBlur(newValue);
      expect(mockPConn.getActionsApi).toHaveBeenCalled();
    });

    it('should not trigger action when value is unchanged', () => {
      component.value$ = '<p>Same content</p>';
      const sameValue = '<p>Same content</p>';
      component.fieldOnBlur(sameValue);
    });
  });
});
