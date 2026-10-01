import { stubComponentMapper } from '../../../../test-utils';
import { createMockChild, createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineDashboardPageComponent } from './inline-dashboard-page.component';

describe('InlineDashboardPageComponent', () => {
  let component: InlineDashboardPageComponent;
  let fixture: ComponentFixture<InlineDashboardPageComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [InlineDashboardPageComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineDashboardPageComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getRawMetadata = () => ({ type: 'InlineDashboardPage', children: [{}, { children: [] }] });
    pConn.getChildren = () => [createMockChild()];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
