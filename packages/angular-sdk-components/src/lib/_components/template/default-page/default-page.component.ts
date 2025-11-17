import { Component, OnInit, Input, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReferenceComponent } from '../../infra/reference/reference.component';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface DefaultPageProps {
  // If any, enter additional props that only exist on this component
  layout?: string;
  title?: string;
  heading?: string;
  message?: string;
  backgroundImage?: string;
  enableBanner?: boolean;
}

@Component({
  selector: 'app-default-page',
  templateUrl: './default-page.component.html',
  styleUrls: ['./default-page.component.scss'],
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class DefaultPageComponent implements OnInit, OnChanges {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: any;

  configProps$: DefaultPageProps;
  arChildren$: any[];
  title?: string;
  heading: any;
  message?: string;
  backgroundImage?: string;
  layout$?: string;
  enableBanner$?: boolean;

  constructor() {
    this.backgroundImage = this.configProps$?.backgroundImage;
  }

  ngOnInit() {
    // console.log(`ngOnInit (no registerAndSubscribe!): Region`);
    this.backgroundImage = this.configProps$?.backgroundImage;
    this.updateSelf();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { pConn$ } = changes;
    this.backgroundImage = this.configProps$?.backgroundImage;

    if (pConn$.previousValue && pConn$.previousValue !== pConn$.currentValue) {
      this.updateSelf();
    }
  }

  updateSelf() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as DefaultPageProps;

    this.layout$ = this.configProps$.layout;
    this.heading = this.configProps$.heading;
    this.message = this.configProps$.message;
    this.backgroundImage = this.configProps$.backgroundImage;
    this.enableBanner$ = this.configProps$.enableBanner;

    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
  }
}
