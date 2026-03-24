import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { ScalarListComponent } from './scalar-list.component';
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

describe('ScalarListComponent', () => {
  setupTestBed({ zoneless: false });

  let component: ScalarListComponent;
  let fixture: ComponentFixture<ScalarListComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: ['Item 1', 'Item 2', 'Item 3'],
    label: 'Items List',
    componentType: 'TextInput',
    displayInModal: false,
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
      getStateProps: vi.fn().mockReturnValue({ value: '.Items' }),
      createComponent: vi.fn().mockReturnValue({ getPConnect: vi.fn() }),
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ScalarListComponent, ReactiveFormsModule],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    })
      .overrideComponent(ScalarListComponent, {
        remove: { imports: [ComponentMapperComponent] },
        add: { imports: [MockComponentMapperComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ScalarListComponent);
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
      component.updateSelf();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should set label from config props', () => {
      component.updateSelf();
      expect(component.label$).toBe('Items List');
    });
  });
});
