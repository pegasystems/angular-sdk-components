import { createMockPConn } from '../../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowContainerComponent } from './flow-container.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('FlowContainerComponent', () => {
  let component: FlowContainerComponent;
  let fixture: ComponentFixture<FlowContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowContainerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowContainerComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
