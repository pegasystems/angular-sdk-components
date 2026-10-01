import { FormGroup } from '@angular/forms';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScalarListComponent } from './scalar-list.component';

describe('ScalarListComponent', () => {
  let component: ScalarListComponent;
  let fixture: ComponentFixture<ScalarListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScalarListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ScalarListComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    (component as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
