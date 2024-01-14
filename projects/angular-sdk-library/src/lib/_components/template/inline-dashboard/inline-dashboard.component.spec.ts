import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InlineDashboardComponent } from './inline-dashboard.component';

describe('InlineDashboardComponent', () => {
  let component: InlineDashboardComponent;
  let fixture: ComponentFixture<InlineDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InlineDashboardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
