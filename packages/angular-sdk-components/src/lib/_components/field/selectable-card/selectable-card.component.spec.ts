import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableCardComponent } from './selectable-card.component';

describe('SelectableCardComponent', () => {
  let component: SelectableCardComponent;
  let fixture: ComponentFixture<SelectableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectableCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectableCardComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
