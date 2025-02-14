import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailConversationComponent } from './email-conversation.component';

describe('EmailConversationComponent', () => {
  let component: EmailConversationComponent;
  let fixture: ComponentFixture<EmailConversationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailConversationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
