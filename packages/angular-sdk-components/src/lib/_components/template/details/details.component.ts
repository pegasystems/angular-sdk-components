import { Component, forwardRef } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';
import { processDetailFields } from '../../../_helpers/template-utils';

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
      this.arFields$ = processDetailFields(kid);
    }
  }
}
