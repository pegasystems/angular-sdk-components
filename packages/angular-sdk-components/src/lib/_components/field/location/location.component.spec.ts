import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { GoogleMapsLoaderService } from '../../../_services/google-maps-loader.service';

import { LocationComponent } from './location.component';

describe('LocationComponent', () => {
  let component: LocationComponent;
  let fixture: ComponentFixture<LocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('LocationComponent behaviour', () => {
  const g = globalThis as any;
  const originalGeolocation = Object.getOwnPropertyDescriptor(navigator, 'geolocation');

  beforeEach(() => {
    // Never load the real Google Maps script: loading never completes, so the template (map, autocomplete) is not rendered.
    TestBed.configureTestingModule({
      imports: [LocationComponent],
      providers: [{ provide: GoogleMapsLoaderService, useValue: { load: () => new Promise<void>(() => undefined) } }]
    });
    g.google = { maps: { GeocoderStatus: { OK: 'OK' } } };
  });

  afterEach(() => {
    delete g.google;
    if (originalGeolocation) Object.defineProperty(navigator, 'geolocation', originalGeolocation);
    else delete (navigator as any).geolocation;
    vi.restoreAllMocks();
  });

  function setup(configProps: any) {
    const pConn = createMockPConn();
    pConn.getConfigProps = () => configProps;
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getStateProps = () => ({ value: '.Place', coordinates: '.Coords' });
    pConn.getGoogleMapsAPIKey = () => 'key';
    const actions = { updateFieldValue: vi.fn(), triggerFieldChange: vi.fn() };
    pConn.getActionsApi = () => actions;
    const fx = TestBed.createComponent(LocationComponent);
    (fx.componentInstance as any).pConn$ = pConn;
    (fx.componentInstance as any).formGroup$ = new FormGroup({});
    fx.detectChanges();
    return { fx, c: fx.componentInstance as any, actions };
  }

  const cfg = { label: 'Where', required: true, readOnly: false, visibility: true, showMap: true, onlyCoordinates: false };

  it('maps configProps onto component state', () => {
    const { c } = setup({ ...cfg, showMapReadOnly: false });
    expect(c.label$).toBe('Where');
    expect(c.bRequired$).toBe(true);
    expect(c.bReadonly$).toBe(false);
    expect(c.bVisible$).toBe(true);
    expect(c.showMap).toBe(true);
    expect(c.onlyCoordinates).toBe(false);
    expect(c.valueProp).toBe('.Place');
    expect(c.coordinatesProp).toBe('.Coords');
  });

  it('uses showMapReadOnly instead of showMap when read-only', () => {
    expect(setup({ ...cfg, readOnly: true, showMap: true, showMapReadOnly: false }).c.showMap).toBe(false);
    expect(setup({ ...cfg, readOnly: true, showMap: false, showMapReadOnly: true }).c.showMap).toBe(true);
    expect(setup({ ...cfg, readOnly: false, showMap: false, showMapReadOnly: true }).c.showMap).toBe(false);
  });

  it('positions the map and sets the value from configured coordinates', () => {
    const { c } = setup({ ...cfg, coordinates: '12.5, 77.25', value: '10 Main St' });
    expect(c.center).toEqual({ lat: 12.5, lng: 77.25 });
    expect(c.markerPosition).toEqual({ lat: 12.5, lng: 77.25 });
    expect(c.coordinates).toBe('12.5, 77.25');
    expect(c.fieldControl.value).toBe('10 Main St');
  });

  it('uses the coordinates as the value when onlyCoordinates is set', () => {
    const { c } = setup({ ...cfg, onlyCoordinates: true, coordinates: '1, 2', value: 'ignored' });
    expect(c.fieldControl.value).toBe('1, 2');
  });

  it('does not render the map UI until Google Maps has loaded', () => {
    const { fx, c } = setup(cfg);
    expect(c.mapReady).toBe(false);
    expect(fx.nativeElement.querySelector('mat-form-field')).toBeNull();
  });

  it('blur sends the text and coordinates to the engine', () => {
    const { c, actions } = setup({ ...cfg, coordinates: '3, 4', value: 'Somewhere' });
    c.updateSelf();
    c.fieldOnBlur();
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Place', 'Somewhere');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Coords', '3, 4');
  });

  it('selecting a coordinate option updates the map and engine without geocoding', () => {
    const { c, actions } = setup(cfg);
    c.onOptionSelected({ option: { value: '-12.5, 40' } });
    expect(c.center).toEqual({ lat: -12.5, lng: 40 });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Place', '-12.5, 40');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Coords', '-12.5, 40');
  });

  it('selecting an address option geocodes it', () => {
    const { c, actions } = setup(cfg);
    c.geocoder = { geocode: vi.fn((_req: any, cb: any) => cb([{ geometry: { location: { lat: () => 5, lng: () => 6 } } }], 'OK')) };
    c.onOptionSelected({ option: { value: '1 Infinite Loop' } });
    expect(c.geocoder.geocode.mock.calls[0][0]).toEqual({ address: '1 Infinite Loop' });
    expect(c.center).toEqual({ lat: 5, lng: 6 });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Place', '1 Infinite Loop');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Coords', '5, 6');
  });

  it('ignores a failed geocode of an address option', () => {
    const { c, actions } = setup(cfg);
    c.geocoder = { geocode: (_r: any, cb: any) => cb(null, 'ZERO_RESULTS') };
    c.onOptionSelected({ option: { value: 'nowhere' } });
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
  });

  it('map click with onlyCoordinates stores the coordinates as the value', () => {
    const { c, actions } = setup({ ...cfg, onlyCoordinates: true });
    c.onMapClick({ latLng: { lat: () => 7, lng: () => 8 } });
    expect(c.fieldControl.value).toBe('7, 8');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Place', '7, 8');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Coords', '7, 8');
  });

  it('map click reverse geocodes to an address, falling back to an empty value', () => {
    const { c, actions } = setup(cfg);
    c.geocoder = { geocode: vi.fn((_r: any, cb: any) => cb([{ formatted_address: 'Addr 1' }], 'OK')) };
    c.onMapClick({ latLng: { lat: () => 7, lng: () => 8 } });
    expect(c.geocoder.geocode.mock.calls[0][0]).toEqual({ location: { lat: 7, lng: 8 } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Place', 'Addr 1');
    actions.updateFieldValue.mockClear();
    c.geocoder = { geocode: (_r: any, cb: any) => cb(null, 'ZERO_RESULTS') };
    c.onMapClick({ latLng: { lat: () => 9, lng: () => 10 } });
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Place', '');
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Coords', '9, 10');
  });

  it('map click without a position does nothing', () => {
    const { c, actions } = setup(cfg);
    c.onMapClick({ latLng: null });
    expect(actions.updateFieldValue).not.toHaveBeenCalled();
  });

  it('locateMe alerts when geolocation is unsupported', () => {
    const { c } = setup(cfg);
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => undefined);
    c.locateMe();
    expect(alertSpy).toHaveBeenCalledWith('Geolocation not supported by this browser.');
    expect(c.isLocating).toBe(false);
  });

  it('locateMe with onlyCoordinates uses the device position', () => {
    const { c, actions } = setup({ ...cfg, onlyCoordinates: true });
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: (ok: any) => ok({ coords: { latitude: 1.5, longitude: 2.5 } }) },
      configurable: true
    });
    c.locateMe();
    expect(c.isLocating).toBe(false);
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Coords', '1.5, 2.5');
  });

  it('locateMe reverse geocodes the device position', () => {
    const { c, actions } = setup(cfg);
    c.geocoder = { geocode: (_r: any, cb: any) => cb([{ formatted_address: 'Here' }], 'OK') };
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: (ok: any) => ok({ coords: { latitude: 1, longitude: 2 } }) },
      configurable: true
    });
    c.locateMe();
    expect(actions.updateFieldValue).toHaveBeenCalledWith('.Place', 'Here');
    expect(c.isLocating).toBe(false);
  });

  it('locateMe reports a permission error and stops locating', () => {
    const { c } = setup(cfg);
    const err = { code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
    Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: (_ok: any, fail: any) => fail(err) }, configurable: true });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => undefined);
    c.locateMe();
    expect(alertSpy).toHaveBeenCalledWith('Location permission denied. Please allow access in your browser settings.');
    expect(c.isLocating).toBe(false);
  });

  it('locateMe reports a timeout error', () => {
    const { c } = setup(cfg);
    const err = { code: 3, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
    Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition: (_ok: any, fail: any) => fail(err) }, configurable: true });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => undefined);
    c.locateMe();
    expect(alertSpy).toHaveBeenCalledWith('Timed out while trying to get your location. Try again.');
  });
});
