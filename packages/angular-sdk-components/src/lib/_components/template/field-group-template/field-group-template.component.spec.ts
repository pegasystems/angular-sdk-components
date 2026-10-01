import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldGroupTemplateComponent } from './field-group-template.component';

describe('FieldGroupTemplateComponent', () => {
  let component: FieldGroupTemplateComponent;
  let fixture: ComponentFixture<FieldGroupTemplateComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [FieldGroupTemplateComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(FieldGroupTemplateComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    (component as any).configProps$ = { label: 'Group', targetClassLabel: 'Item' };
    pConn.getConfigProps = () => ({ label: 'Group', referenceList: '.Items' });
    pConn.resolveConfigProps = (p: any) => p;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds the add button label from the target class label', () => {
    expect(component.getAddBtnLabel()).toBe('+ Add Item');
    (component as any).configProps$ = { targetClassLabel: '' };
    expect(component.getAddBtnLabel()).toBe('+ Add');
  });
});
