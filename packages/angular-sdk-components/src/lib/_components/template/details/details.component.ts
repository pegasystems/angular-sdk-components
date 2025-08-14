import { Component, forwardRef } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    imports: [forwardRef(() => ComponentMapperComponent)]
})
export class DetailsComponent extends DetailsTemplateBase {
  override pConn$: typeof PConnect;

  highlightedDataArr: any[] = [];
  showHighlightedData: boolean;
  arFields$: any[] = [];

  override updateSelf() {
    const rawMetaData: any = this.pConn$.resolveConfigProps(this.pConn$.getRawMetadata()?.config);
    this.showHighlightedData = rawMetaData?.showHighlightedData;

    if (this.showHighlightedData) {
      const highlightedData = rawMetaData?.highlightedData;
      this.highlightedDataArr = highlightedData.map(field => {
        field.config.displayMode = 'STACKED_LARGE_VAL';

        if (field.config.value === '@P .pyStatusWork') {
          field.type = 'TextInput';
          field.config.displayAsStatus = true;
        }

        return field;
      });
    }

    const kids = this.pConn$.getChildren() as any[];
    for (const kid of kids) {
      this.arFields$ = [];
      const pKid = kid.getPConnect();
      const fields = pKid.getChildren();
      fields?.forEach(field => {
        const thePConn = field.getPConnect();
        const theCompType = thePConn.getComponentName().toLowerCase();
        if (theCompType === 'reference' || theCompType === 'group') {
          const configProps = thePConn.getConfigProps();
          configProps.readOnly = true;
          configProps.displayMode = 'DISPLAY_ONLY';
          const propToUse = { ...thePConn.getInheritedProps() };
          configProps.label = propToUse?.label;
          const options = {
            context: thePConn.getContextName(),
            pageReference: thePConn.getPageReference(),
            referenceList: thePConn.getReferenceList()
          };
          const viewContConfig = {
            meta: {
              ...thePConn.getMetadata(),
              type: theCompType,
              config: configProps
            },
            options
          };
          const theViewCont = PCore.createPConnect(viewContConfig);
          const data = {
            type: theCompType,
            pConn: theViewCont?.getPConnect()
          };
          this.arFields$.push(data);
        } else {
          const data = {
            type: theCompType,
            config: thePConn.getConfigProps()
          };
          this.arFields$.push(data);
        }
      });
    }
  }
}
