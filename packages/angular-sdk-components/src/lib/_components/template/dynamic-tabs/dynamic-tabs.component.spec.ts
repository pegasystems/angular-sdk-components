import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTabsComponent } from './dynamic-tabs.component';

describe('DynamicTabsComponent', () => {
  let component: DynamicTabsComponent;
  let fixture: ComponentFixture<DynamicTabsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [DynamicTabsComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(DynamicTabsComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getConfigProps = () => ({ label: 'Tabs', showLabel: true, referenceList: '.Tabs' });
    pConn.resolveConfigProps = (p: any) => p;
    pConn.getComponentConfig = () => ({ tablabel: '' });
    pConn.getValue = () => [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
