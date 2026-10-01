import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DatapageService } from './datapage.service';
import { ServerConfigService } from './server-config.service';
import { endpoints } from './endpoints';

describe('DatapageService', () => {
  let service: DatapageService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.setItem('asdk_AH', 'Bearer token-2');
    TestBed.configureTestingModule({ providers: [DatapageService, provideHttpClient(), provideHttpClientTesting()] });
    vi.spyOn(TestBed.inject(ServerConfigService), 'getBaseUrl').mockReturnValue('https://pega.example.com/prweb');
    service = TestBed.inject(DatapageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.removeItem('asdk_AH');
  });

  it('requests a data page by id with query params and auth header', () => {
    service.getDataPage('D_Customers', { Region: 'EU' }).subscribe();

    const req = http.expectOne(r => r.url === `https://pega.example.com/prweb${endpoints.API}${endpoints.DATA}/D_Customers`);
    expect(req.request.params.get('Region')).toBe('EU');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-2');
    req.flush({});
  });

  it('extracts pxResults from a data page response', () => {
    expect(service.getResults({ pxResults: [1, 2] })).toEqual([1, 2]);
  });

  describe('getDataPageData', () => {
    it('resolves with the data array and wraps parameters as dataViewParameters', async () => {
      const getData = vi.fn().mockReturnValue(Promise.resolve({ data: { data: [{ a: 1 }] } }));
      (globalThis as any).PCore.getDataApiUtils = () => ({ getData });

      const result = await service.getDataPageData('D_X', [{ id: 1 }], 'app/primary_1');

      expect(result).toEqual([{ a: 1 }]);
      expect(getData).toHaveBeenCalledWith('D_X', { dataViewParameters: [{ id: 1 }] }, 'app/primary_1');
    });

    it('passes undefined params when none are given and rejects on engine errors', async () => {
      const getData = vi.fn().mockReturnValue(Promise.reject(new Error('boom')));
      (globalThis as any).PCore.getDataApiUtils = () => ({ getData });

      await expect(service.getDataPageData('D_X', undefined, 'ctx')).rejects.toThrow('boom');
      expect(getData).toHaveBeenCalledWith('D_X', undefined, 'ctx');
    });
  });
});
