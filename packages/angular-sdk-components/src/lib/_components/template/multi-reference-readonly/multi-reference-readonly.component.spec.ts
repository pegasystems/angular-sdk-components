import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiReferenceReadonlyComponent } from './multi-reference-readonly.component';

describe('MultiReferenceReadonlyComponent', () => {
  let component: MultiReferenceReadonlyComponent;
  let fixture: ComponentFixture<MultiReferenceReadonlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiReferenceReadonlyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiReferenceReadonlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
