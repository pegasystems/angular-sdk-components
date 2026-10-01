import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelAlertComponent } from './cancel-alert.component';

describe('CancelAlertComponent', () => {
  let component: CancelAlertComponent;
  let fixture: ComponentFixture<CancelAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelAlertComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelAlertComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
