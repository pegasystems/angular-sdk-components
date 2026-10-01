import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CaseService } from './case.service';
import { ServerConfigService } from './server-config.service';
import { endpoints } from './endpoints';

describe('CaseService', () => {
  let service: CaseService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.setItem('asdk_AH', 'Bearer token-1');
    TestBed.configureTestingModule({ providers: [CaseService, provideHttpClient(), provideHttpClientTesting()] });
    vi.spyOn(TestBed.inject(ServerConfigService), 'getBaseUrl').mockReturnValue('https://pega.example.com/prweb');
    service = TestBed.inject(CaseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.removeItem('asdk_AH');
  });

  it('requests case types from the configured server with the stored auth header', () => {
    service.getCaseTypes().subscribe();

    const req = http.expectOne(`https://pega.example.com/prweb${endpoints.API}${endpoints.CASETYPES}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-1');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({});
  });
});
