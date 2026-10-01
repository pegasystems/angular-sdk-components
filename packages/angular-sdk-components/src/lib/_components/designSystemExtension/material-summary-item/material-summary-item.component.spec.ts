import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialSummaryItemComponent } from './material-summary-item.component';

describe('MaterialSummaryItemComponent', () => {
  let component: MaterialSummaryItemComponent;
  let fixture: ComponentFixture<MaterialSummaryItemComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [MaterialSummaryItemComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialSummaryItemComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).item$ = { visual: { icon: 'case' }, primary: { type: 'TEXT', name: 'Item' }, secondary: { text: '' }, actions: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
