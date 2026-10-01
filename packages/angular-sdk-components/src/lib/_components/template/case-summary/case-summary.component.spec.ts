import { stubComponentMapper } from '../../../../test-utils';
import { createMockChild, createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseSummaryComponent } from './case-summary.component';

describe('CaseSummaryComponent', () => {
  let component: CaseSummaryComponent;
  let fixture: ComponentFixture<CaseSummaryComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [CaseSummaryComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseSummaryComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getChildren = () => [createMockChild({ getChildren: () => [] }), createMockChild({ getChildren: () => [] })];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
