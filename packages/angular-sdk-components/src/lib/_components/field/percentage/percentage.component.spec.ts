import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentageComponent } from './percentage.component';

describe('PercentageComponent', () => {
  let component: PercentageComponent;
  let fixture: ComponentFixture<PercentageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PercentageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentageComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
