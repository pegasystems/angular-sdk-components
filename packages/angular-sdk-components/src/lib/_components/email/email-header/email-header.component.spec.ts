import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailHeaderComponent } from './email-header.component';

describe('EmailHeaderComponent', () => {
  let component: EmailHeaderComponent;
  let fixture: ComponentFixture<EmailHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
