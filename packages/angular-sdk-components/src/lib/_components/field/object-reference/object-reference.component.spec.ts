import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectReferenceComponent } from './object-reference.component';

describe('ObjectReferenceComponent', () => {
  let component: ObjectReferenceComponent;
  let fixture: ComponentFixture<ObjectReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectReferenceComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ObjectReferenceComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
