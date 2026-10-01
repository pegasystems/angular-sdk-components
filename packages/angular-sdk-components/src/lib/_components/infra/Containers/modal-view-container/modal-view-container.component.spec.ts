import { createMockPConn } from '../../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewContainerComponent } from './modal-view-container.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('ModalViewContainerComponent', () => {
  let component: ModalViewContainerComponent;
  let fixture: ComponentFixture<ModalViewContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalViewContainerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViewContainerComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
