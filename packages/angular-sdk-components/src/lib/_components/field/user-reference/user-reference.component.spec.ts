import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReferenceComponent } from './user-reference.component';

describe('UserReferenceComponent', () => {
  let component: UserReferenceComponent;
  let fixture: ComponentFixture<UserReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserReferenceComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReferenceComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
