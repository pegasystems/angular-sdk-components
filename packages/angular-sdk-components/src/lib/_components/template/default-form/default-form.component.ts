import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ReferenceComponent } from '../../infra/reference/reference.component';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { TemplateUtils } from '../../../_helpers/template-utils';
import { FormTemplateBase } from '../base/form-template-base';

function areViewsChanged(oldViews: any[], newViews: any[]): boolean {
  if (oldViews?.length !== newViews?.length) {
    return true;
  }

  return !oldViews?.every((oldView, index) => {
    const newView = newViews[index];
    return oldView.getPConnect().viewName === newView.getPConnect().viewName;
  });
}

interface DefaultFormProps {
  // If any, enter additional props that only exist on this component
  NumCols: string;
  instructions: string;
}

@Component({
  selector: 'app-default-form',
  templateUrl: './default-form.component.html',
  styleUrls: ['./default-form.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DefaultFormComponent extends FormTemplateBase implements OnInit, OnDestroy {
  @Input() override pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  override angularPConnectData: AngularPConnectData = {};

  arChildren$: any[];
  divClass$: string;
  instructions: string;

  constructor(
    private angularPConnect: AngularPConnectService,
    private templateUtils: TemplateUtils
  ) {
    super();
  }

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.updateSelf();
  }

  onStateChange() {
    this.updateSelf();
  }

  updateSelf() {
    const configProps = this.pConn$.getConfigProps() as DefaultFormProps;
    const kids = this.pConn$.getChildren();
    this.instructions = this.templateUtils.getInstructions(this.pConn$, configProps?.instructions);

    const numCols = configProps.NumCols ? configProps.NumCols : '1';
    switch (numCols) {
      case '1':
        this.divClass$ = 'psdk-default-form-one-column';
        break;
      case '2':
        this.divClass$ = 'psdk-default-form-two-column';
        break;
      case '3':
        this.divClass$ = 'psdk-default-form-three-column';
        break;
      default:
        this.divClass$ = 'psdk-default-form-one-column';
        break;
    }

    // repoint children before getting templateArray
    // Children may contain 'reference' component, so we need to
    //  normalize them
    const children = ReferenceComponent.normalizePConnArray(kids[0].getPConnect().getChildren());

    const visibleChildren = children?.filter(child => child !== undefined) || [];

    if (areViewsChanged(this.arChildren$, visibleChildren)) {
      this.arChildren$ = visibleChildren;
    }
  }
}
