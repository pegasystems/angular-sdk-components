import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DefaultFormComponent } from './default-form.component';

describe('DefaultFormComponent', () => {
  let component: DefaultFormComponent;
  let fixture: ComponentFixture<DefaultFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DefaultFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
