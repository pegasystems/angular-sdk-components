import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldGroupTemplateComponent } from './field-group-template.component';

// TODO: needs engine-level PConnect/PCore fixtures beyond the shared lenient mocks in test-setup.ts
xdescribe('FieldGroupTemplateComponent', () => {
  let component: FieldGroupTemplateComponent;
  let fixture: ComponentFixture<FieldGroupTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldGroupTemplateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FieldGroupTemplateComponent);
    component = fixture.componentInstance;
    (component as any).pConn$ = createMockPConn();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
