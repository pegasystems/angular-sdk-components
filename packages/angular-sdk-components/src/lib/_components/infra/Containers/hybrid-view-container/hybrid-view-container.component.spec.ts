import { createMockPConn } from '../../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HybridViewContainerComponent } from './hybrid-view-container.component';

describe('HybridViewContainerComponent', () => {
  let component: HybridViewContainerComponent;
  let fixture: ComponentFixture<HybridViewContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HybridViewContainerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HybridViewContainerComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
