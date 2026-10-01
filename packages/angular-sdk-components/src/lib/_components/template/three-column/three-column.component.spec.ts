import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeColumnComponent } from './three-column.component';

describe('ThreeColumnComponent', () => {
  let component: ThreeColumnComponent;
  let fixture: ComponentFixture<ThreeColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeColumnComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeColumnComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
