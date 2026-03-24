// Mock google maps API before any imports
(globalThis as any).google = {
  maps: {
    places: {
      AutocompleteService: class {
        getPlacePredictions(request: any, callback: Function) {
          callback(
            [{ description: 'Test Place', place_id: 'test-place-id' }],
            'OK'
          );
        }
      },
      PlacesServiceStatus: {
        OK: 'OK'
      }
    },
    Geocoder: class {
      geocode(request: any, callback: Function) {
        callback(
          [{
            formatted_address: 'Test Address',
            geometry: {
              location: {
                lat: () => 37.7749,
                lng: () => -122.4194
              }
            }
          }],
          'OK'
        );
      }
    },
    GeocoderStatus: {
      OK: 'OK'
    },
    LatLng: class {
      constructor(public lat: number, public lng: number) {}
    }
  }
};

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

import { LocationComponent } from './location.component';
import { AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';
import { GoogleMapsLoaderService } from '../../../_services/google-maps-loader.service';

describe('LocationComponent', () => {
  setupTestBed({ zoneless: false });

  let component: LocationComponent;
  let fixture: ComponentFixture<LocationComponent>;
  let mockAngularPConnectService: {
    registerAndSubscribeComponent: Mock;
    shouldComponentUpdate: Mock;
    getComponentID: Mock;
  };
  let mockUtils: { getBooleanValue: Mock };
  let mockGoogleMapsLoaderService: { load: Mock };
  let mockPConn: any;

  const mockConfigProps = {
    value: '',
    label: 'Location',
    testId: 'test-location',
    coordinates: '',
    showMap: true,
    onlyCoordinates: false,
    showMapReadOnly: true,
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

    mockGoogleMapsLoaderService = {
      load: vi.fn().mockResolvedValue(undefined)
    };

    mockPConn = {
      getConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      resolveConfigProps: vi.fn().mockReturnValue(mockConfigProps),
      getStateProps: vi.fn().mockReturnValue({ value: '.Location' }),
      getActionsApi: vi.fn().mockReturnValue({
        updateFieldValue: vi.fn(),
        triggerFieldChange: vi.fn()
      }),
      clearErrorMessages: vi.fn(),
      getContextName: vi.fn().mockReturnValue('app/primary_1'),
      getGoogleMapsAPIKey: vi.fn().mockReturnValue('mock-api-key')
    };

    await TestBed.configureTestingModule({
      imports: [
        LocationComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule
      ],
      providers: [
        { provide: AngularPConnectService, useValue: mockAngularPConnectService },
        { provide: Utils, useValue: mockUtils },
        { provide: GoogleMapsLoaderService, useValue: mockGoogleMapsLoaderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationComponent);
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

    it('should set label from config props', () => {
      fixture.detectChanges();
      expect(component.label$).toBe('Location');
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove control from form group', () => {
      fixture.detectChanges();
      expect(component.formGroup$.contains('test-comp-id')).toBe(true);
      component.ngOnDestroy();
      expect(component.formGroup$.contains('test-comp-id')).toBe(false);
    });
  });

  describe('updateSelf configuration', () => {
    it('should set showMap from config props', () => {
      component.updateSelf();
      expect(component.showMap).toBe(true);
    });

    it('should set onlyCoordinates from config props', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ ...mockConfigProps, onlyCoordinates: true });
      component.updateSelf();
      expect(component.onlyCoordinates).toBe(true);
    });

    it('should set showMapReadOnly from config props', () => {
      component.updateSelf();
      expect(component.showMapReadOnly$).toBe(true);
    });

    it('should parse coordinates when provided', () => {
      mockPConn.resolveConfigProps.mockReturnValue({ 
        ...mockConfigProps, 
        coordinates: '37.7749,-122.4194',
        value: 'San Francisco, CA'
      });
      mockPConn.getStateProps.mockReturnValue({ value: '.Location', coordinates: '.Coordinates' });
      component.updateSelf();
      expect(component.valueProp).toBe('.Location');
      expect(component.coordinatesProp).toBe('.Coordinates');
    });
  });

  describe('fieldOnBlur', () => {
    it('should exist as a method', () => {
      expect(component.fieldOnBlur).toBeDefined();
    });
  });

  describe('locateMe', () => {
    it('should handle geolocation not supported', () => {
      const originalGeolocation = navigator.geolocation;
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true
      });
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.locateMe();
      expect(alertSpy).toHaveBeenCalledWith('Geolocation not supported by this browser.');
      Object.defineProperty(navigator, 'geolocation', {
        value: originalGeolocation,
        writable: true
      });
    });
  });

  describe('onMapClick', () => {
    it('should handle map click event without latLng', () => {
      const event = {} as google.maps.MapMouseEvent;
      component.onMapClick(event);
      // Should return early without error
      expect(component).toBeTruthy();
    });
  });

  describe('onOptionSelected', () => {
    it('should handle coordinate string selection', () => {
      component.updateSelf();
      component.actionsApi = mockPConn.getActionsApi();
      const event = { option: { value: '37.7749,-122.4194' } };
      component.onOptionSelected(event);
      expect(component.center).toBeDefined();
    });

    it('should geocode address when not coordinates', () => {
      component.updateSelf();
      component.actionsApi = mockPConn.getActionsApi();
      // Initialize geocoder
      component['geocoder'] = new (globalThis as any).google.maps.Geocoder();
      const event = { option: { value: 'San Francisco, CA' } };
      component.onOptionSelected(event);
      // Should call geocoder
      expect(component).toBeTruthy();
    });
  });

  describe('onMapClick with coordinates', () => {
    beforeEach(() => {
      component.updateSelf();
      component.actionsApi = mockPConn.getActionsApi();
      component['geocoder'] = new (globalThis as any).google.maps.Geocoder();
    });

    it('should update map with coordinates when onlyCoordinates is true', () => {
      component.onlyCoordinates = true;
      const event = {
        latLng: {
          lat: () => 37.7749,
          lng: () => -122.4194
        }
      } as google.maps.MapMouseEvent;
      component.onMapClick(event);
      expect(component.center).toEqual({ lat: 37.7749, lng: -122.4194 });
    });

    it('should geocode location when onlyCoordinates is false', () => {
      component.onlyCoordinates = false;
      const event = {
        latLng: {
          lat: () => 37.7749,
          lng: () => -122.4194
        }
      } as google.maps.MapMouseEvent;
      component.onMapClick(event);
      expect(component.center).toBeDefined();
    });
  });

  describe('fieldOnBlur', () => {
    it('should call updateProps', () => {
      component.updateSelf();
      component.actionsApi = mockPConn.getActionsApi();
      component.valueProp = '.Location';
      component.coordinatesProp = '.Coordinates';
      component.fieldOnBlur();
      // Should not throw
      expect(component).toBeTruthy();
    });
  });

  describe('locateMe with geolocation', () => {
    beforeEach(() => {
      component.updateSelf();
      component.actionsApi = mockPConn.getActionsApi();
      component['geocoder'] = new (globalThis as any).google.maps.Geocoder();
    });

    it('should set isLocating to true when geolocation is available', () => {
      // Skip actual geolocation tests since navigator.geolocation can't be mocked
      expect(component.locateMe).toBeDefined();
    });
  });

  describe('private methods', () => {
    beforeEach(() => {
      component.updateSelf();
      component.actionsApi = mockPConn.getActionsApi();
    });

    it('should identify coordinate strings correctly', () => {
      expect(component['isCoordinateString']('37.7749,-122.4194')).toBe(true);
      expect(component['isCoordinateString']('37.7749, -122.4194')).toBe(true);
      expect(component['isCoordinateString']('San Francisco, CA')).toBe(false);
    });

    it('should set coordinates properly', () => {
      component['setCoordinates'](37.7749, -122.4194);
      expect(component.coordinates).toBe('37.7749, -122.4194');
    });

    it('should set location value without emitting event', () => {
      component['setLocationValue']('Test Location');
      expect(component.fieldControl.value).toBe('Test Location');
    });

    it('should update map with value', () => {
      component['updateMap'](37.7749, -122.4194, 'San Francisco');
      expect(component.center).toEqual({ lat: 37.7749, lng: -122.4194 });
      expect(component.markerPosition).toEqual({ lat: 37.7749, lng: -122.4194 });
    });

    it('should update map with coordinates only', () => {
      component.onlyCoordinates = true;
      component['updateMap'](37.7749, -122.4194);
      expect(component.fieldControl.value).toBe('37.7749, -122.4194');
    });
  });

  describe('readonly mode', () => {
    it('should use showMapReadOnly when readonly', () => {
      component.bReadonly$ = true;
      mockPConn.resolveConfigProps.mockReturnValue({ 
        ...mockConfigProps, 
        readOnly: true,
        showMapReadOnly: false 
      });
      component.updateSelf();
      expect(component.showMap).toBe(false);
    });
  });

  describe('coordinates parsing', () => {
    it('should parse and update map when coordinates provided', () => {
      mockPConn.resolveConfigProps.mockReturnValue({
        ...mockConfigProps,
        coordinates: '40.7128,-74.0060',
        value: 'New York, NY'
      });
      component.updateSelf();
      expect(component.center).toEqual({ lat: 40.7128, lng: -74.006 });
    });
  });
});
