import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextContentComponent } from './text-content.component';

describe('TextContentComponent', () => {
  let component: TextContentComponent;
  let fixture: ComponentFixture<TextContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextContentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextContentComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
