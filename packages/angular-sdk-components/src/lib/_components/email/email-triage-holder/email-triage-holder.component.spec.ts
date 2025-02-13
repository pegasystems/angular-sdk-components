import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTriageHolderComponent } from './email-triage-holder.component';

describe('EmailTriageHolderComponent', () => {
  let component: EmailTriageHolderComponent;
  let fixture: ComponentFixture<EmailTriageHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTriageHolderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTriageHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
