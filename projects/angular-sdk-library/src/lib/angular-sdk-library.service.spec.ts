import { TestBed } from '@angular/core/testing';

import { AngSdkLibService } from './angular-sdk-library.service';

describe('AngSdkLibService', () => {
  let service: AngSdkLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngSdkLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
