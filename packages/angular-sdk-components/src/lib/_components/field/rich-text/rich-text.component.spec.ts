import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RichTextComponent } from './rich-text.component';

describe('RichTextComponent', () => {
  let component: RichTextComponent;
  let fixture: ComponentFixture<RichTextComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RichTextComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RichTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
