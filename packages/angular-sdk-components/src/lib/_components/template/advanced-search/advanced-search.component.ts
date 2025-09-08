// import { Component, Input, OnInit } from '@angular/core';
// import { AdvancedSearchService } from './advanced-search.service';

// @Component({
//   selector: 'app-advanced-search',
//   templateUrl: './advanced-search.component.html',
//   styleUrls: ['./advanced-search.component.css']
// })
// export class AdvancedSearchComponent implements OnInit {
//   @Input() getPConnect: any;
//   @Input() targetObjectClass: string;
//   @Input() localeReference: string;

//   searchFields: any[] = [];
//   showRecords = false;
//   editableFieldComp: any;
//   searchGroupsProps: any;

//   constructor(private advancedSearchService: AdvancedSearchService) {}

//   ngOnInit(): void {
//     const pConn = this.getPConnect();
//     const rawViewMetadata = pConn.getRawMetadata();

//     // Initialize search fields
//     this.searchFields = this.advancedSearchService.initializeSearchFields(rawViewMetadata);

//     // Determine if records should be shown
//     const dataReferenceConfigToChild = pConn.getContextData().dataReferenceConfigToChild;
//     const selectionMode = dataReferenceConfigToChild.selectionMode;
//     const MULTI = pConn.getConstants().LIST_SELECTION_MODE.MULTI;

//     if (selectionMode === MULTI) {
//       this.showRecords = pConn.getValue(dataReferenceConfigToChild.readonlyContextList)?.length || false;
//     } else {
//       this.showRecords = pConn.getValue(dataReferenceConfigToChild.value) || false;
//     }

//     // Create editable field component
//     const firstChildMeta = rawViewMetadata.children[0];
//     const localizedVal = this.advancedSearchService.getLocalizedValue('Search results', 'DataReference');
//     const cache = pConn.getNavigationUtils().getComponentCache(dataReferenceConfigToChild.searchSelectCacheKey) ?? {};

//     this.editableFieldComp = pConn.createComponent({
//       type: firstChildMeta.type,
//       config: {
//         ...firstChildMeta.config,
//         searchFields: this.searchFields,
//         showRecords: this.showRecords,
//         label: localizedVal,
//         searchSelectCacheKey: dataReferenceConfigToChild.searchSelectCacheKey,
//         cache
//       }
//     });

//     // Set up search groups props
//     const { selectionList, dataRelationshipContext } = this.editableFieldComp.props.getPConnect().getConfigProps();
//     const editableField = selectionMode === MULTI ? selectionList.substring(1) : dataRelationshipContext;

//     this.searchGroupsProps = {
//       getPConnect: this.getPConnect,
//       editableField,
//       localeReference: this.localeReference,
//       setShowRecords: (value: boolean) => {
//         this.showRecords = value;
//       },
//       searchSelectCacheKey: dataReferenceConfigToChild.searchSelectCacheKey,
//       cache
//     };
//   }
// }

import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AngularPConnectService, AngularPConnectData } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DataReferenceAdvancedSearchService } from '../data-reference/data-reference-advanced-search.service';
import { getFirstChildConfig } from '../data-reference/utils';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class AdvancedSearchComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;
  @Input() searchSelectCacheKey;

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: any;
  showRecords: any;
  searchGroupsProps: any;
  editableFieldComp: any;

  constructor(
    private angularPConnect: AngularPConnectService,
    private advancedSearchService: DataReferenceAdvancedSearchService
  ) {}

  ngOnInit(): void {
    // this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    // this.checkAndUpdate();
    this.updateSelf();
  }

  onStateChange() {
    this.checkAndUpdate();
  }

  checkAndUpdate() {
    // Should always check the bridge to see if the component should
    // update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // ONLY call updateSelf when the component should update
    if (bUpdateSelf) {
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

    console.log('DataReference: recreatedFirstChild dataReferenceAdvancedSearchContext data: ', data);

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
