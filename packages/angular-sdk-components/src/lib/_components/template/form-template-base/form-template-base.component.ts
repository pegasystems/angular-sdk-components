import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'form-template-base',
  template: ''
})
export class FormTemplateBaseComponent implements OnDestroy {
  pConn$: any;

  ngOnDestroy(): void {
    PCore.getContextTreeManager().removeContextTreeNode(this.pConn$.getContextName());
  }
}
