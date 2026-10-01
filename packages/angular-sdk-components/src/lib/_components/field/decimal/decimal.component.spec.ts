import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimalComponent } from './decimal.component';

describe('DecimalComponent', () => {
  let component: DecimalComponent;
  let fixture: ComponentFixture<DecimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecimalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecimalComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
