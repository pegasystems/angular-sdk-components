import { stubComponentMapper } from '../../../../../test-utils';
import { createMockPConn } from '../../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewViewContainerComponent } from './preview-view-container.component';

describe('PreviewViewContainerComponent', () => {
  let component: PreviewViewContainerComponent;
  let fixture: ComponentFixture<PreviewViewContainerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [PreviewViewContainerComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
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
