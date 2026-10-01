import { stubComponentMapper } from '../../../../../test-utils';
import { createMockPConn } from '../../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewContainerComponent } from './view-container.component';

describe('ViewContainerComponent', () => {
  let component: ViewContainerComponent;
  let fixture: ComponentFixture<ViewContainerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ViewContainerComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewContainerComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getContainerName = () => 'primary';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
