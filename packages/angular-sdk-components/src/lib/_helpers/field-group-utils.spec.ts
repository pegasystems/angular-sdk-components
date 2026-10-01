import { getReferenceList } from './field-group-utils';

describe('getReferenceList', () => {
  const pConn = (referenceList: string, resolved?: any) => ({
    getComponentConfig: () => ({ referenceList }),
    resolveDatasourceReference: vi.fn().mockReturnValue(resolved)
  });

  it('strips the "@P " annotation from property references', () => {
    expect(getReferenceList(pConn('@P .Items'))).toBe('.Items');
  });

  it('uses pxResults when a data page reference resolves to a page with results', () => {
    expect(getReferenceList(pConn('@P D_Customers', { pxResults: '.pxResults' }))).toBe('.pxResults');
  });

  it('appends .pxResults to a data page name that resolves to a plain name', () => {
    expect(getReferenceList(pConn('@P D_Customers', 'D_Customers'))).toBe('D_Customers.pxResults');
  });

  it('keeps data page names that already end with .pxResults', () => {
    expect(getReferenceList(pConn('@P D_Customers.pxResults', 'D_Customers.pxResults'))).toBe('D_Customers.pxResults');
  });
});
