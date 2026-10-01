import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialSummaryListComponent } from './material-summary-list.component';

describe('MaterialSummaryListComponent', () => {
  let component: MaterialSummaryListComponent;
  let fixture: ComponentFixture<MaterialSummaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialSummaryListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialSummaryListComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
