import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleReferenceReadonlyComponent } from './single-reference-readonly.component';

describe('SingleReferenceReadonlyComponent', () => {
  let component: SingleReferenceReadonlyComponent;
  let fixture: ComponentFixture<SingleReferenceReadonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleReferenceReadonlyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SingleReferenceReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
