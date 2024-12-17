import { Directive, OnDestroy } from '@angular/core';

@Directive()
export class FormTemplateBase implements OnDestroy {
  pConn$: any;

  ngOnDestroy(): void {
    PCore.getContextTreeManager().removeContextTreeNode(this.pConn$.getContextName());
  }
}
