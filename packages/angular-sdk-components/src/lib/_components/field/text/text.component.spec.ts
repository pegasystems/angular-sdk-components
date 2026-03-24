import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { TextComponent } from './text.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

describe('TextComponent', () => {
  setupTestBed({ zoneless: false });

  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: {
    getBooleanValue: Mock;
    generateDate: Mock;
    generateDateTime: Mock;
  };
  let mockPConn: any;

  const mockConfigProps = {
    value: 'Sample text value',
    label: 'Text Field',
    testId: 'test-text',
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
      getBooleanValue: vi.fn().mockImplementation(val => val === true || val === 'true'),
      generateDate: vi.fn().mockReturnValue('Jan 15, 2024'),
      generateDateTime: vi.fn().mockReturnValue('Jan 15, 2024 10:30 AM')
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getStateProps: vi.fn().mockReturnValue({ value: '.TextField' }),
      getContextName: vi.fn().mockReturnValue('app/primary_1')
    };

    await TestBed.configureTestingModule({
      imports: [TextComponent],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextComponent);
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

    it('should set value from config props', () => {
      fixture.detectChanges();
      expect(component.value$).toBe('Sample text value');
    });

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Text Field');
    });
  });

  describe('ngOnDestroy', () => {
    it('should call unsubscribe function', () => {
      fixture.detectChanges();
      const unsubscribeFn = mockAngularPConnectService.registerAndSubscribeComponent().unsubscribeFn;
      component.ngOnDestroy();
      expect(unsubscribeFn).toHaveBeenCalled();
    });
  });

  describe('formatAs modes', () => {
    it('should format as text by default', () => {
      component.formatAs$ = 'text';
      fixture.detectChanges();
      expect(component.formattedValue$).toBe('Sample text value');
    });

    it('should format as date', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: '2024-01-15' });
      component.formatAs$ = 'date';
      fixture.detectChanges();
      expect(mockUtils.generateDate).toHaveBeenCalled();
    });

    it('should format as date-time', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: '2024-01-15T10:30:00' });
      component.formatAs$ = 'date-time';
      fixture.detectChanges();
      expect(mockUtils.generateDateTime).toHaveBeenCalled();
    });

    it('should handle empty time value', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: '' });
      component.formatAs$ = 'time';
      component.value$ = '';
      component.updateSelf();
      expect(component.formattedValue$).toBe('');
    });

    it('should format as url', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: 'example.com' });
      component.formatAs$ = 'url';
      fixture.detectChanges();
      expect(component.formattedUrl$).toBe('http://example.com');
    });

    it('should handle url with http prefix', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: 'http://example.com' });
      component.formatAs$ = 'url';
      fixture.detectChanges();
      expect(component.formattedUrl$).toBe('http://example.com');
    });

    it('should handle url with https prefix', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, value: 'https://example.com' });
      component.formatAs$ = 'url';
      fixture.detectChanges();
      expect(component.formattedUrl$).toBe('https://example.com');
    });
  });

  describe('generateDate', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return empty string for empty value', () => {
      const result = component.generateDate('');
      expect(result).toBe('');
    });

    it('should generate formatted date for valid value', () => {
      component.generateDate('2024-01-15');
      expect(mockUtils.generateDate).toHaveBeenCalledWith('2024-01-15', 'Date-Long-Custom-YYYY');
    });
  });

  describe('generateDateTime', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return empty string for empty value', () => {
      const result = component.generateDateTime('');
      expect(result).toBe('');
    });

    it('should call generateDate for date-only value (10 chars)', () => {
      component.generateDateTime('2024-01-15');
      expect(mockUtils.generateDate).toHaveBeenCalled();
    });

    it('should generate formatted datetime for full datetime value', () => {
      component.generateDateTime('2024-01-15T10:30:00');
      expect(mockUtils.generateDateTime).toHaveBeenCalled();
    });
  });

  describe('onStateChange', () => {
    it('should call checkAndUpdate', () => {
      fixture.detectChanges();
      const spy = vi.spyOn(component, 'checkAndUpdate');
      component.onStateChange();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('visibility', () => {
    it('should set visibility from config props', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, visibility: true });
      fixture.detectChanges();
      expect(component.bVisible$).toBe(true);
    });

    it('should handle visibility as false', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, visibility: false });
      mockUtils.getBooleanValue.mockReturnValue(false);
      fixture.detectChanges();
      expect(component.bVisible$).toBe(false);
    });
  });
});
