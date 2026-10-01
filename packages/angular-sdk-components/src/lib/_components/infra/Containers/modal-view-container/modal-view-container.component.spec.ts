import { stubComponentMapper } from '../../../../../test-utils';
import { createMockPConn } from '../../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewContainerComponent } from './modal-view-container.component';

describe('ModalViewContainerComponent', () => {
  let component: ModalViewContainerComponent;
  let fixture: ComponentFixture<ModalViewContainerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ModalViewContainerComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
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
