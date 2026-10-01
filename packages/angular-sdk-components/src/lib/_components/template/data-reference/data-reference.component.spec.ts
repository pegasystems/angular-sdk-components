import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataReferenceComponent } from './data-reference.component';

describe('DataReferenceComponent', () => {
  let component: DataReferenceComponent;
  let fixture: ComponentFixture<DataReferenceComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [DataReferenceComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataReferenceComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getRawMetadata = () => ({ name: 'DataRef', children: [{ type: 'Region', config: {} }], config: { referenceList: '.Items' } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('applies store updates in a microtask, never synchronously inside the store callback (NG0100)', async () => {
    const angularPConnect = (component as any).angularPConnect;
    vi.spyOn(angularPConnect, 'shouldComponentUpdate').mockReturnValue(true);
    const updateSelf = vi.spyOn(component, 'updateSelf').mockImplementation(() => undefined);

    component.onStateChange();
    component.onStateChange();
    expect(updateSelf).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(updateSelf).toHaveBeenCalledTimes(1);
  });

  it('skips a pending store update when the component is destroyed first', async () => {
    const angularPConnect = (component as any).angularPConnect;
    vi.spyOn(angularPConnect, 'shouldComponentUpdate').mockReturnValue(true);
    const updateSelf = vi.spyOn(component, 'updateSelf').mockImplementation(() => undefined);

    component.onStateChange();
    fixture.destroy();
    await Promise.resolve();

    expect(updateSelf).not.toHaveBeenCalled();
  });
});
