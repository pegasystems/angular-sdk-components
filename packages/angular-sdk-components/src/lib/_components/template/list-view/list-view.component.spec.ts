import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPConn } from '../../../../test-setup';
import { stubComponentMapper } from '../../../../test-utils';
import { ListViewComponent } from './list-view.component';

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;
  let getDataAsync: ReturnType<typeof vi.fn>;
  let getDataViewMetadata: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getDataAsync = vi.fn().mockResolvedValue({ data: [{ pyGUID: '1', Name: 'Ada' }] });
    getDataViewMetadata = vi.fn().mockResolvedValue({ data: { fields: [], classID: 'Data-Item', isQueryable: false, primaryFields: [] } });
    const PCore = (globalThis as any).PCore;
    PCore.getDataPageUtils = () => ({ getDataAsync });
    PCore.getAnalyticsUtils = () => ({
      getDataViewMetadata,
      getFieldsForDataSource: () => Promise.resolve({ data: { data: [] } })
    });
    PCore.getRuntimeParamsAPI = () => ({ getRuntimeParams: () => ({}) });

    TestBed.configureTestingModule({ imports: [ListViewComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(ListViewComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    const resolvedPresets = [{ label: 'Items', children: [{ children: [] }] }];
    pConn.getConfigProps = () => ({ referenceList: 'D_Items', label: 'Items', presets: resolvedPresets });
    pConn.getComponentConfig = () => ({ presets: resolvedPresets });
    pConn.getRawMetadata = () => ({ config: { presets: [{ id: 'p1', label: 'Items', config: {}, children: [{ children: [] }] }] } });
    (component as any).pConn$ = pConn;
  });

  it('uses the configured label as the title', () => {
    fixture.detectChanges();
    expect(component.label).toBe('Items');
  });

  it('builds the list context from the data view metadata and loads the data', async () => {
    fixture.detectChanges();
    await vi.waitFor(() => expect(component.response).toBeDefined());

    expect(getDataViewMetadata).toHaveBeenCalledWith('D_Items', undefined, null);
    expect(getDataAsync).toHaveBeenCalledWith('D_Items', expect.anything(), undefined, undefined, null);
    expect(component.response).toEqual([{ pyGUID: '1', Name: 'Ada' }]);
  });
});
