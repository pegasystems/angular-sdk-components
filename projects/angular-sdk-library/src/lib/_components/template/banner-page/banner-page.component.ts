import { Component, Input, SimpleChanges, forwardRef } from '@angular/core';

import { ReferenceComponent } from '../../infra/reference/reference.component';
import { CommonModule } from '@angular/common';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface BannerPageProps {
  // If any, enter additional props that only exist on this component
  layout?: string;
  title?: string;
  message?: string;
  backgroundImage?: string;
}

@Component({
  selector: 'app-banner-page',
  templateUrl: './banner-page.component.html',
  styleUrls: ['./banner-page.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class BannerPageComponent {
  @Input() pConn$: typeof PConnect;
  @Input() formGroup$: any;

  configProps$: BannerPageProps;
  arChildren$: Array<any>;
  title?: string;
  message: any;
  backgroundImage?: string;
  layout$?: string;
  divClass$: string;

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
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as BannerPageProps;
    console.log(`url(${this.backgroundImage})`);

    this.layout$ = this.configProps$.layout;
    this.title = this.configProps$.title;
    this.message = this.configProps$.message;
    this.backgroundImage = this.configProps$.backgroundImage;

    // The children may contain 'reference' components, so normalize the children...
    this.arChildren$ = ReferenceComponent.normalizePConnArray(this.pConn$.getChildren());
  }
}
