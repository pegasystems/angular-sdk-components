import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectPageComponent } from './object-page.component';

describe('ObjectPageComponent', () => {
  let component: ObjectPageComponent;
  let fixture: ComponentFixture<ObjectPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ObjectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
