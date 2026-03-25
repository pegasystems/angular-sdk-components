import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { GroupComponent } from './group.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';

describe('GroupComponent', () => {
  setupTestBed({ zoneless: false });

  let component: GroupComponent;
  let fixture: ComponentFixture<GroupComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockPConn: any;

  const mockConfigProps = {
    showHeading: true,
    heading: 'Group Section',
    instructions: 'Fill in the fields below',
    collapsible: false,
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

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getChildren: vi.fn().mockReturnValue([]),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [GroupComponent],
      providers: [{ provide: AngularPConnectService, useValue: mockAngularPConnectService }]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupComponent);
    component = fixture.componentInstance;
    component.pConn$ = mockPConn;
    component.formGroup$ = new FormGroup({});
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should register component with AngularPConnectService', () => {
      fixture.detectChanges();
      expect(mockAngularPConnectService.registerAndSubscribeComponent).toHaveBeenCalled();
    });
  });

  describe('updateSelf', () => {
    it('should resolve config props', () => {
      fixture.detectChanges();
      expect(mockPConn.resolveConfigProps).toHaveBeenCalled();
    });

    it('should set heading from config props', () => {
      fixture.detectChanges();
      expect(component.heading$).toBe('Group Section');
    });

    it('should set instructions from config props', () => {
      fixture.detectChanges();
      expect(component.instructions$).toBe('Fill in the fields below');
    });

    it('should set showHeading from config props', () => {
      fixture.detectChanges();
      expect(component.showHeading$).toBe(true);
    });

    it('should set collapsible from config props', () => {
      fixture.detectChanges();
      expect(component.collapsible$).toBe(false);
    });

    it('should set visibility from config props', () => {
      fixture.detectChanges();
      expect(component.visibility$).toBe(true);
    });

    it('should get computed visibility when visibility is undefined', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, visibility: undefined });
      mockPConn.getComputedVisibility = vi.fn().mockReturnValue(true);
      fixture.detectChanges();
      expect(mockPConn.getComputedVisibility).toHaveBeenCalled();
    });
  });

  describe('DISPLAY_ONLY mode', () => {
    it('should set visibility to true for DISPLAY_ONLY mode when undefined', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        displayMode: 'DISPLAY_ONLY',
        visibility: undefined
      });
      mockPConn.getComputedVisibility = vi.fn().mockReturnValue(true);
      // Don't use fixture.detectChanges to avoid template rendering issues
      component.updateSelf();
      expect(component.visibility$).toBe(true);
    });
  });

  describe('onStateChange', () => {
    it('should call checkAndUpdate when state changes', () => {
      fixture.detectChanges();
      const checkAndUpdateSpy = vi.spyOn(component, 'checkAndUpdate');
      component.onStateChange();
      expect(checkAndUpdateSpy).toHaveBeenCalled();
    });
  });
});
