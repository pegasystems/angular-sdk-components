import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldGroupTemplateComponent } from './field-group-template.component';

describe('FieldGroupTemplateComponent', () => {
  let component: FieldGroupTemplateComponent;
  let fixture: ComponentFixture<FieldGroupTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FieldGroupTemplateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldGroupTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
