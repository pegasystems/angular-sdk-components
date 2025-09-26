import { Component, forwardRef, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DataReferenceAdvancedSearchService } from '../data-reference/data-reference-advanced-search.service';
import { getFirstChildConfig } from '../data-reference/utils';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class AdvancedSearchComponent implements OnInit, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() searchSelectCacheKey;

  isInitialized = false;

  configProps$: any;
  showRecords: any;
  searchGroupsProps: any;
  editableFieldComp: any;

  constructor(private advancedSearchService: DataReferenceAdvancedSearchService) {}

  ngOnInit(): void {
    this.isInitialized = true;
    this.updateSelf();
  }

  ngOnChanges() {
    if (this.isInitialized) {
      this.updateSelf();
    }
  }

  // updateSelf
  updateSelf(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    const targetObjectClass = this.configProps$.targetObjectClass;
    const localeReference = this.configProps$.localeReference;
    const data: any = this.advancedSearchService.getConfig();
    const { dataReferenceConfigToChild, isCreateNewReferenceEnabled, disableStartingFieldsForReference, pyID, searchSelectCacheKey } = data;
    const { selectionMode, value: singleSelectFieldValue, readonlyContextList: multiSelectField } = dataReferenceConfigToChild;

    // let isSelectionExist = false;
    const { MULTI } = PCore.getConstants().LIST_SELECTION_MODE;

    if (selectionMode === MULTI) {
      this.showRecords = this.pConn$.getValue(multiSelectField)?.length || false;
    } else {
      this.showRecords = this.pConn$.getValue(singleSelectFieldValue) || false;
    }

    const rawViewMetadata = this.pConn$.getRawMetadata() as any;

    const searchFieldsSet = new Set();
    const searchFields: any = [];
    rawViewMetadata?.config?.searchGroups?.forEach((group: any) => {
      group.children.forEach((child: any) => {
        if (!searchFieldsSet.has(child.config.value) && !child.config.validator) {
          searchFields.push(child);
          searchFieldsSet.add(child.config.value);
        }
      });
    });

    const firstChildPConnect = this.pConn$.getChildren()[0].getPConnect as any;
    const [firstChildMeta] = rawViewMetadata.children;

    const localizedVal = PCore.getLocaleUtils().getLocaleValue;
    // @ts-ignore
    const cache = PCore.getNavigationUtils().getComponentCache(searchSelectCacheKey) ?? {};

    this.editableFieldComp = firstChildPConnect().createComponent({
      type: firstChildMeta.type,
      config: {
        ...getFirstChildConfig({
          firstChildMeta,
          getPConnect: this.pConn$,
          rawViewMetadata,
          contextClass: targetObjectClass,
          dataReferenceConfigToChild,
          isCreateNewReferenceEnabled,
          disableStartingFieldsForReference,
          pyID
        }),
        searchFields,
        showRecords: this.showRecords,
        label: localizedVal('Search results', 'DataReference'),
        searchSelectCacheKey,
        cache
      }
    });

    const { selectionList, dataRelationshipContext } = this.editableFieldComp.getPConnect().getConfigProps();
    const editableField = selectionMode === MULTI ? selectionList.substring(1) : dataRelationshipContext;

    this.searchGroupsProps = {
      getPConnect: this.pConn$,
      editableField,
      localeReference,
      setShowRecords: (value: boolean) => {
        this.showRecords = value;
      },
      searchSelectCacheKey: dataReferenceConfigToChild.searchSelectCacheKey,
      cache
    };
  }
}
