import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttachmentComponent } from './attachment.component';

describe('AttachmentComponent', () => {
  let component: AttachmentComponent;
  let fixture: ComponentFixture<AttachmentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AttachmentComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
