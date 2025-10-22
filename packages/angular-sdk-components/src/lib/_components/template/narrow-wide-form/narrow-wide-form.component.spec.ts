import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarrowWideFormComponent } from './narrow-wide-form.component';

describe('NarrowWideFormComponent', () => {
  let component: NarrowWideFormComponent;
  let fixture: ComponentFixture<NarrowWideFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NarrowWideFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NarrowWideFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
