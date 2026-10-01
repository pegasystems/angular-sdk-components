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
});
