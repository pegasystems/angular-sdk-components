import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngSdkLibComponent } from './angular-sdk-library.component';

describe('AngSdkLibComponent', () => {
  let component: AngSdkLibComponent;
  let fixture: ComponentFixture<AngSdkLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AngSdkLibComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngSdkLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
