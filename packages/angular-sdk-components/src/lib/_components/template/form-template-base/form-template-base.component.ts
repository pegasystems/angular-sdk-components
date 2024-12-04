import { Directive, OnDestroy } from '@angular/core';

@Directive()
export class FormTemplateBaseComponent implements OnDestroy {
  pConn$: any;

  ngOnDestroy(): void {
    PCore.getContextTreeManager().removeContextTreeNode(this.pConn$.getContextName());
  }
}
