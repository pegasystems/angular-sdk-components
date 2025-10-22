import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InlineDashboardPageComponent } from './inline-dashboard-page.component';

describe('InlineDashboardPageComponent', () => {
  let component: InlineDashboardPageComponent;
  let fixture: ComponentFixture<InlineDashboardPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InlineDashboardPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineDashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
