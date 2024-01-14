import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScalarListComponent } from './scalar-list.component';

describe('ScalarListComponent', () => {
  let component: ScalarListComponent;
  let fixture: ComponentFixture<ScalarListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScalarListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ScalarListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
