import { createMockPConn } from '../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularSdkComponentsComponent } from './angular-sdk-components.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('AngularSdkComponentsComponent', () => {
  let component: AngularSdkComponentsComponent;
  let fixture: ComponentFixture<AngularSdkComponentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AngularSdkComponentsComponent]
    });
    fixture = TestBed.createComponent(AngularSdkComponentsComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
