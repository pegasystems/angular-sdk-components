import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { DataReferenceAdvancedSearchService } from '../../../_services/data-reference-advanced-search.service';
import { createMockChild, createMockPConn } from '../../../../test-setup';
import { stubComponentMapper } from '../../../../test-utils';
import { AdvancedSearchComponent } from './advanced-search.component';

describe('AdvancedSearchComponent', () => {
  let fixture: ComponentFixture<AdvancedSearchComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [AdvancedSearchComponent] });
    TestBed.overrideProvider(DataReferenceAdvancedSearchService, {
      useValue: { getConfig: () => ({ dataReferenceConfigToChild: { selectionMode: 'single', value: '', readonlyContextList: '' } }) }
    });
    await stubComponentMapper();
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(AdvancedSearchComponent);
    const pConn = createMockPConn();
    const editable = createMockChild({ getConfigProps: () => ({ selectionList: '.Items', dataRelationshipContext: 'Rel' }) });
    pConn.getChildren = () => [createMockChild({ createComponent: () => editable })];
    pConn.getRawMetadata = () => ({ children: [{ config: {} }], config: { searchGroups: [] } });
    (fixture.componentInstance as any).pConn$ = pConn;
    (fixture.componentInstance as any).formGroup$ = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
