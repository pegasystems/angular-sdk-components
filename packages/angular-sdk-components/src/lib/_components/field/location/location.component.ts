import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GoogleMapsModule } from '@angular/google-maps';

import { debounceTime, from, interval, of, switchMap } from 'rxjs';

import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { GoogleMapsLoaderService } from '../../../_services/google-maps-loader.service';
import { Utils } from '../../../_helpers/utils';
import { handleEvent } from '../../../_helpers/event-util';

import { PConnFieldProps } from '../../../_types/PConnProps.interface';

interface LocationProps extends PConnFieldProps {
  coordinates: string;
  showMap: boolean;
  onlyCoordinates: boolean;
  showMapReadOnly: boolean;
}

@Component({
  selector: 'app-location',
  imports: [
    CommonModule,
    GoogleMapsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  private autocompleteService!: google.maps.places.AutocompleteService;
  private geocoder!: google.maps.Geocoder;

  // Dom variables
  mapReady = false;
  isLocating = false;
  searchControl = new FormControl('');
  showMap = true;
  filteredOptions: string[] = [];
  center: google.maps.LatLngLiteral;
  markerPosition: google.maps.LatLngLiteral | null = null;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: LocationProps;
  label$ = '';
  onlyCoordinates: boolean;
  coordinates: string;
  bRequired$ = false;
  bReadonly$ = false;
  showMapReadOnly$: boolean;
  bDisabled$ = false;
  bVisible$ = true;
  controlName$: string;
  bHasForm$ = true;
  testId = '';
  helperText: string;
  placeholder: string;
  actionsApi: object;
  valueProp: string;
  coordinatesProp: string;

  constructor(
    private loader: GoogleMapsLoaderService,
    private angularPConnect: AngularPConnectService,
    private utils: Utils,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Loading map
    const apiKey = this.pConn$.getGoogleMapsAPIKey();
    await this.loader.load(apiKey);
    this.mapReady = true;
    this.initializeGoogleServices();
    this.getPlacePredictions();

    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.controlName$ = this.angularPConnect.getComponentID(this);
    this.checkAndUpdate();

    if (this.formGroup$) {
      // add control to formGroup
      this.formGroup$.addControl(this.controlName$, this.searchControl);
      this.bHasForm$ = true;
    } else {
      this.bReadonly$ = true;
      this.bHasForm$ = false;
    }
  }

  ngOnDestroy(): void {
    if (this.formGroup$) {
      this.formGroup$.removeControl(this.controlName$);
    }

    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  checkAndUpdate() {
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);
    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  onStateChange() {
    setTimeout(() => {
      this.checkAndUpdate();
    }, 0);
  }

  updateSelf(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as LocationProps;
    if (this.configProps$.visibility != null) {
      this.bVisible$ = this.utils.getBooleanValue(this.configProps$.visibility);
    }
    this.onlyCoordinates = !!this.configProps$.onlyCoordinates;
    this.label$ = this.configProps$.label;
    this.testId = this.configProps$.testId;

    this.helperText = this.configProps$.helperText || '';
    this.placeholder = this.configProps$.placeholder || '';
    this.showMapReadOnly$ = !!this.configProps$.showMapReadOnly;
    if (this.configProps$.readOnly != null) {
      this.bReadonly$ = this.utils.getBooleanValue(this.configProps$.readOnly);
    }
    this.showMap = this.bReadonly$ ? this.showMapReadOnly$ : !!this.configProps$.showMap;
    if (this.configProps$.coordinates) {
      const latAndLong: number[] = this.configProps$.coordinates.split(',').map(Number);
      const latitude = Number(latAndLong[0]);
      const longitude = Number(latAndLong[1]);
      this.updateMap(latitude, longitude, this.configProps$.value);
    }
    // // timeout and detectChanges to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.configProps$.required != null) {
        this.bRequired$ = this.utils.getBooleanValue(this.configProps$.required);
      }
      this.cdRef.detectChanges();
    });
    // // disabled
    if (this.configProps$.disabled != undefined) {
      this.bDisabled$ = this.utils.getBooleanValue(this.configProps$.disabled);
    }

    if (this.bDisabled$ || this.bReadonly$) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }

    this.actionsApi = this.pConn$.getActionsApi();
    this.valueProp = this.pConn$.getStateProps().value;
    this.coordinatesProp = this.pConn$.getStateProps().coordinates;

    // // trigger display of error message with field control
    if (this.angularPConnectData.validateMessage != null && this.angularPConnectData.validateMessage != '') {
      const timer = interval(100).subscribe(() => {
        this.searchControl.setErrors({ message: true });
        this.searchControl.markAsTouched();

        timer.unsubscribe();
      });
    }
  }

  onOptionSelected(event: any) {
    const value = event.option.value;
    if (this.isCoordinateString(value)) {
      const [lat, lng] = value.split(',').map(Number);
      this.updateMap(lat, lng, value);
      this.updateProps();
    } else {
      this.geocoder.geocode({ address: value }, (res, status) => {
        if (status === google.maps.GeocoderStatus.OK && res && res[0]) {
          const loc = res[0].geometry.location;
          this.updateMap(loc.lat(), loc.lng(), value);
          this.updateProps();
        }
      });
    }
  }

  fieldOnBlur() {
    this.updateProps();
  }

  locateMe() {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by this browser.');
      return;
    }

    this.isLocating = true;
    this.tryGetLocation(0);
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    if (this.onlyCoordinates) {
      this.updateMap(lat, lng);
      this.updateProps();
    } else {
      this.geocoder.geocode({ location: { lat, lng } }, (res, status) => {
        if (status === google.maps.GeocoderStatus.OK && res && res[0]) {
          this.updateMap(lat, lng, res[0].formatted_address);
        } else {
          this.updateMap(lat, lng);
        }
        this.updateProps();
      });
    }
  }

  getErrorMessage() {
    let errMessage = '';

    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.searchControl.hasError('message')) {
      errMessage = this.angularPConnectData.validateMessage ?? '';
      return errMessage;
    }
    if (this.searchControl.hasError('required')) {
      errMessage = 'You must enter a value';
    } else if (this.searchControl.errors) {
      errMessage = this.searchControl.errors.toString();
    }

    return errMessage;
  }

  private tryGetLocation(retryCount: number) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (this.onlyCoordinates) {
          this.updateMap(lat, lng);
          this.updateProps();
          this.isLocating = false;
        } else {
          this.geocoder.geocode({ location: { lat, lng } }, (res, status) => {
            this.isLocating = false;
            if (status === google.maps.GeocoderStatus.OK && res && res[0]) {
              this.updateMap(lat, lng, res[0].formatted_address);
            } else {
              this.updateMap(lat, lng);
            }
            this.updateProps();
          });
        }
      },
      err => {
        console.error('Geolocation error', err);

        if (err.code === err.POSITION_UNAVAILABLE && retryCount < 2) {
          console.warn('Retrying location fetch...');
          setTimeout(() => this.tryGetLocation(retryCount + 1), 2000);
        } else {
          this.isLocating = false;

          switch (err.code) {
            case err.PERMISSION_DENIED:
              alert('Location permission denied. Please allow access in your browser settings.');
              break;
            case err.POSITION_UNAVAILABLE:
              alert('Location unavailable. Please check your internet or GPS.');
              break;
            case err.TIMEOUT:
              alert('Timed out while trying to get your location. Try again.');
              break;
            default:
              alert('Could not get your location. Please try again.');
          }
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  private initializeGoogleServices() {
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
  }

  private getPlacePredictions() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.getSuggestions(value || ''))
      )
      .subscribe(predictions => {
        this.filteredOptions = predictions;
      });
  }

  private isCoordinateString(value: string): boolean {
    const regex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
    return regex.test(value.trim());
  }

  private getSuggestions(input: string) {
    if (!input.trim()) return of([]);

    if (this.isCoordinateString(input)) {
      return of([input]);
    }

    return from(
      new Promise<string[]>(resolve => {
        this.autocompleteService.getPlacePredictions({ input }, (preds, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
            if (this.onlyCoordinates) {
              // only first exact match as coordinates
              this.geocoder.geocode({ placeId: preds[0].place_id }, (response, geocoderStatus) => {
                if (geocoderStatus === google.maps.GeocoderStatus.OK && response && response[0]) {
                  const loc = response[0].geometry.location;
                  resolve([`${loc.lat()}, ${loc.lng()}`]);
                } else {
                  resolve([]);
                }
              });
            } else {
              resolve(preds.map(p => p.description));
            }
          } else {
            resolve([]);
          }
        });
      })
    );
  }

  private updateMap(lat: number, lng: number, value?: string) {
    this.center = { lat, lng };
    this.markerPosition = { lat, lng };
    this.setCoordinates(lat, lng);
    if (this.onlyCoordinates) {
      this.setLocationValue(this.coordinates);
    } else {
      this.setLocationValue(value || '');
    }
  }

  private updateProps() {
    handleEvent(this.actionsApi, 'change', this.valueProp, this.searchControl.value);
    handleEvent(this.actionsApi, 'change', this.coordinatesProp, this.coordinates);
  }

  private setCoordinates(latitude: number, longitude: number) {
    this.coordinates = `${latitude}, ${longitude}`;
  }

  private setLocationValue(value: string) {
    this.searchControl.setValue(value, { emitEvent: false });
  }
}
