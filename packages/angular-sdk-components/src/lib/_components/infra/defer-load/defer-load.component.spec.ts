import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeferLoadComponent } from './defer-load.component';

describe('DeferLoadComponent', () => {
  let component: DeferLoadComponent;
  let fixture: ComponentFixture<DeferLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeferLoadComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeferLoadComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
