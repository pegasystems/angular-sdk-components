import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldGroupListComponent } from './field-group-list.component';

describe('FieldGroupListComponent', () => {
  let component: FieldGroupListComponent;
  let fixture: ComponentFixture<FieldGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FieldGroupListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
