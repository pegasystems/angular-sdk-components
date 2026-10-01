import { createMockPConn } from '../../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewViewContainerComponent } from './preview-view-container.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('PreviewViewContainerComponent', () => {
  let component: PreviewViewContainerComponent;
  let fixture: ComponentFixture<PreviewViewContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewViewContainerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewViewContainerComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
