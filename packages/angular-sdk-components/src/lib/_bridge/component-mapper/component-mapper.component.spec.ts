import { createMockPConn } from '../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentMapperComponent } from './component-mapper.component';

describe('ComponentMapperComponent', () => {
  let component: ComponentMapperComponent;
  let fixture: ComponentFixture<ComponentMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentMapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentMapperComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
