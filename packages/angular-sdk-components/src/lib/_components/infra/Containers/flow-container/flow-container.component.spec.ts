import { stubComponentMapper } from '../../../../../test-utils';
import { createMockPConn, createMockChild } from '../../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowContainerComponent } from './flow-container.component';

describe('FlowContainerComponent', () => {
  let component: FlowContainerComponent;
  let fixture: ComponentFixture<FlowContainerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [FlowContainerComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowContainerComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getConfigProps = () => ({ routingInfo: {}, isAssignmentView: false });
    pConn.resolveConfigProps = (p: any) => p;
    (globalThis as any).PCore.getContainerUtils = () => ({
      getActiveContainerItemName: () => 'app/primary_1/workarea_1',
      getContainerItemData: () => ({}),
      CONTAINER_NAMES: {}
    });
    pConn.getValue = () => [];
    pConn.getChildren = () => [createMockChild({ getDataObject: () => ({ caseInfo: {} }) })];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
