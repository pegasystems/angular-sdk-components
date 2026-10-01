import { TestBed } from '@angular/core/testing';

import { DatapageService } from './datapage.service';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('DatapageService', () => {
  let service: DatapageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatapageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
