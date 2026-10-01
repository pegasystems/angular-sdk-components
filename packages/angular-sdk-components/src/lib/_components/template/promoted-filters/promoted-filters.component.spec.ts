import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotedFiltersComponent } from './promoted-filters.component';

describe('PromotedFiltersComponent', () => {
  let component: PromotedFiltersComponent;
  let fixture: ComponentFixture<PromotedFiltersComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [PromotedFiltersComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotedFiltersComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).listViewProps = { title: 'Filters' };
    (component as any).filters = [];
    (component as any).pageClass = 'Work-';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
