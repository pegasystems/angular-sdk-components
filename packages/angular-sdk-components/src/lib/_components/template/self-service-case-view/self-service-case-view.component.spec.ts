import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelfServiceCaseViewComponent } from './self-service-case-view.component';

describe('SelfServiceCaseViewComponent', () => {
  let component: SelfServiceCaseViewComponent;
  let fixture: ComponentFixture<SelfServiceCaseViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelfServiceCaseViewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfServiceCaseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
