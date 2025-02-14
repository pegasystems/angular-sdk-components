import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCaseViewContainerComponent } from './email-case-view-container.component';

describe('EmailCaseViewContainerComponent', () => {
  let component: EmailCaseViewContainerComponent;
  let fixture: ComponentFixture<EmailCaseViewContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailCaseViewContainerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailCaseViewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
