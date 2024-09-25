import { Component, OnInit, Input, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ReferenceComponent } from '../../infra/reference/reference.component';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { TemplateUtils } from '../../../_helpers/template-utils';

function areViewsChanged(oldViews: any[], newViews: any[]): boolean {
  if (oldViews.length !== newViews.length) {
    return true;
  }

  return !oldViews.every((oldView, index) => {
    const newView = newViews[index];
    return oldView.getPConnect().viewName === newView.getPConnect().viewName;
  });
}

interface DefaultFormProps {
  // If any, enter additional props that only exist on this component
  NumCols: string;
  template: string;
  instructions: string;
}

@Component({
  selector: 'app-default-form',
  templateUrl: './default-form.component.html',
  styleUrls: ['./default-form.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DefaultFormComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  arChildren$: any[] = [];
  divClass$: string;
  template: any;
  showLabel: any;
  label: any;
  instructions: string;

  NO_HEADER_TEMPLATES = [
    'SubTabs',
    'SimpleTable',
    'Details',
    'DetailsTwoColumn',
    'DetailsThreeColumn',
    'NarrowWideDetails',
    'WideNarrowDetails',
    'Confirmation'
  ];

  constructor(
    private angularPConnect: AngularPConnectService,
    private templateUtils: TemplateUtils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.updateSelf();
  }

  ngOnDestroy() {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  onStateChange() {
    this.updateSelf();
  }

  updateSelf() {
    const configProps = this.pConn$.getConfigProps() as DefaultFormProps;
    this.template = configProps?.template;
    const propToUse: any = { ...this.pConn$.getInheritedProps() };
    this.showLabel = propToUse?.showLabel;
    this.label = propToUse?.label;
    const kids = this.pConn$.getChildren() as any[];
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
