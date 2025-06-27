import { Component, forwardRef } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { DetailsTemplateBase } from '../base/details-template-base';

@Component({
  selector: 'app-details-two-column',
  templateUrl: './details-two-column.component.html',
  styleUrls: ['./details-two-column.component.scss'],
  standalone: true,
  imports: [forwardRef(() => ComponentMapperComponent)]
})
export class DetailsTwoColumnComponent extends DetailsTemplateBase {
  override pConn$: typeof PConnect;

  showHighlightedData: boolean;
  highlightedDataArr: any;

  arFields$: any[] = [];
  arFields2$: any[] = [];
  arFields3$: any[] = [];

  propsToUse: any = {};

  override updateSelf() {
    const rawMetaData: any = this.pConn$.resolveConfigProps(this.pConn$.getRawMetadata()?.config);
    this.showHighlightedData = rawMetaData?.showHighlightedData;

    if (this.showHighlightedData) {
      const highlightedData = rawMetaData?.highlightedData;
      this.highlightedDataArr = highlightedData?.map(field => {
        field.config.displayMode = 'STACKED_LARGE_VAL';

        if (field.config.value === '@P .pyStatusWork') {
          field.type = 'TextInput';
          field.config.displayAsStatus = true;
        }

        return field;
      });
    }

    this.pConn$.setInheritedProp('displayMode', 'DISPLAY_ONLY');
    this.pConn$.setInheritedProp('readOnly', true);

    const kids = this.pConn$.getChildren() as any[];
    for (const kid of kids) {
      const pKid = kid.getPConnect();
      const pKidData = pKid.resolveConfigProps(pKid.getRawMetadata());
      if (kids.indexOf(kid) == 0) {
        this.arFields$ = pKidData.children;
      } else {
        this.arFields2$ = pKidData.children;
      }
    }
  }
}
