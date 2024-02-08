import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularSdkComponentsComponent } from './angular-sdk-components.component';

describe('AngularSdkComponentsComponent', () => {
  let component: AngularSdkComponentsComponent;
  let fixture: ComponentFixture<AngularSdkComponentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AngularSdkComponentsComponent]
    });
    fixture = TestBed.createComponent(AngularSdkComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
