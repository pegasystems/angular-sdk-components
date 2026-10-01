import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotedFiltersComponent } from './promoted-filters.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('PromotedFiltersComponent', () => {
  let component: PromotedFiltersComponent;
  let fixture: ComponentFixture<PromotedFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromotedFiltersComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotedFiltersComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
