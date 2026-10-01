import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeColumnPageComponent } from './three-column-page.component';

describe('ThreeColumnPageComponent', () => {
  let component: ThreeColumnPageComponent;
  let fixture: ComponentFixture<ThreeColumnPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreeColumnPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeColumnPageComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
