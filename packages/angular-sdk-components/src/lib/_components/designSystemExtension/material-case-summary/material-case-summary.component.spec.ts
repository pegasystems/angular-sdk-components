import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialCaseSummaryComponent } from './material-case-summary.component';

describe('MaterialCaseSummaryComponent', () => {
  let component: MaterialCaseSummaryComponent;
  let fixture: ComponentFixture<MaterialCaseSummaryComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [MaterialCaseSummaryComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialCaseSummaryComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).primaryFields$ = [];
    (component as any).secondaryFields$ = [];
    (component as any).status$ = 'Open';
    (component as any).bShowStatus$ = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
