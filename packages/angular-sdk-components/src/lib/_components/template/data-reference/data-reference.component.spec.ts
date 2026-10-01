import { Component, ApplicationRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { stubComponentMapper } from '../../../../test-utils';
import { createMockPConn } from '../../../../test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataReferenceComponent } from './data-reference.component';

describe('DataReferenceComponent', () => {
  let component: DataReferenceComponent;
  let fixture: ComponentFixture<DataReferenceComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [DataReferenceComponent] });
    await stubComponentMapper();
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataReferenceComponent);
    component = fixture.componentInstance;
    const pConn = createMockPConn();
    (component as any).pConn$ = pConn;
    pConn.getRawMetadata = () => ({ name: 'DataRef', children: [{ type: 'Region', config: {} }], config: { referenceList: '.Items' } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  imports: [ComponentMapperComponent],
  template: `<component-mapper name="DataReference" [props]="{ pConn$: pConn, formGroup$: fg }"></component-mapper>`
})
class Host {
  pConn: any;
  fg = new FormGroup({});
}

describe('DataReferenceComponent in a zoneless tick', () => {
  it('refreshes when its datasource arrives after the first render (no NG0100 from the dev-mode check)', async () => {
    const PCore = (globalThis as any).PCore;
    PCore.getFieldDefaultUtils = () => ({ fieldDefaults: {} });
    const getData = vi.fn().mockResolvedValue({ data: { data: [{ k: '1', t: 'One', v: 'One' }] } });
    PCore.getDataApiUtils = () => ({ getData });
    PCore.getConstants = () => ({ LIST_SELECTION_MODE: { MULTI: 'multi' }, CASE_INFO: {}, MESSAGES: {}, PUBLIC_CONSTANTS: {} });

    const childPConn: any = createMockPConn();
    childPConn.getComponentName = () => 'RadioButtons';
    childPConn.getRawMetadata = () => ({ type: 'RadioButtons', config: {} });
    childPConn.getConfigProps = () => ({ label: 'Pick', visibility: true, datasource: [{ key: 'a', value: 'A' }] });
    childPConn.resolveConfigProps = (p: any) => p;
    childPConn.getStateProps = () => ({ value: '.X' });

    const pConn: any = createMockPConn();
    pConn.getConfigProps = () => ({ selectionMode: 'single', displayAs: 'dropdown', parameters: { p: 1 } });
    pConn.getRawMetadata = () => ({
      name: 'DR',
      config: { referenceList: 'D_List', parameters: { p: 1 } },
      children: [
        { type: 'RadioButtons', config: { datasource: { fields: { key: '@P .k', text: '@P .t', value: '@P .v' } } } },
        { name: 'Views', children: [] }
      ]
    });
    pConn.getFieldMetadata = () => ({});
    pConn.getCurrentPageFieldMetadata = () => ({});
    pConn.getPageReference = () => 'caseInfo.content.DR';
    pConn.getInheritedProps = () => ({});
    const firstChild = {
      getPConnect: () =>
        Object.assign(createMockPConn(), {
          createComponent: () => ({ getPConnect: () => childPConn }),
          getSharedDataPageForReferenceList: () => null
        })
    };
    pConn.getChildren = () => [firstChild];

    const fx = TestBed.createComponent(Host);
    fx.componentInstance.pConn = pConn;
    const appRef = TestBed.inject(ApplicationRef);

    appRef.tick();
    // the datasource arrives later, outside Angular's event system, and replaces the children to render
    await vi.waitFor(() => expect(getData).toHaveBeenCalled());
    await new Promise(resolve => setTimeout(resolve));

    expect(() => appRef.tick()).not.toThrow();
    expect(fx.nativeElement.querySelector('app-radio-buttons')).toBeTruthy();
  });
});
