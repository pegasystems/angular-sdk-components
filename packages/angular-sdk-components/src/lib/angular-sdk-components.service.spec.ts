import { TestBed } from '@angular/core/testing';

import { AngularSdkComponentsService } from './angular-sdk-components.service';

describe('AngularSdkComponentsService', () => {
  let service: AngularSdkComponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularSdkComponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
