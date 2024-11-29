import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { ReferenceComponent } from '../../infra/reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { TemplateUtils } from '../../../_helpers/template-utils';

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
export class DefaultFormComponent implements OnInit {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: FormGroup;

  arChildren$: any[];
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

  constructor(private templateUtils: TemplateUtils) {}

  ngOnInit(): void {
    const configProps = this.pConn$.getConfigProps() as DefaultFormProps;
    this.template = configProps?.template;
    const propToUse: any = { ...this.pConn$.getInheritedProps() };
    this.showLabel = propToUse?.showLabel;
    this.label = propToUse?.label;
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
    this.arChildren$ = ReferenceComponent.normalizePConnArray(kids[0].getPConnect().getChildren());
  }

  ngOnDestroy(): void {
    // Clean up
    PCore.getContextTreeManager().removeContextTreeNode(this.pConn$.getContextName());
  }
}
