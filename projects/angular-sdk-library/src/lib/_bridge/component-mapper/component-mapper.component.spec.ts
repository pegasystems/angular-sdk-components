import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentMapperComponent } from './component-mapper.component';

describe('ComponentMapperComponent', () => {
  let component: ComponentMapperComponent;
  let fixture: ComponentFixture<ComponentMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentMapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
