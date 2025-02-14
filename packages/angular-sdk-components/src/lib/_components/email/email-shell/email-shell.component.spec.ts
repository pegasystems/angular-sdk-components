import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailShellComponent } from './email-shell.component';

describe('EmailShellComponent', () => {
  let component: EmailShellComponent;
  let fixture: ComponentFixture<EmailShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailShellComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
