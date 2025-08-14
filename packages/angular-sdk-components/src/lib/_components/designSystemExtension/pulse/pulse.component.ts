import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

interface PulseProps {
  // If any, enter additional props that only exist on this component
  children?: any[];
}

@Component({
    selector: 'app-pulse',
    templateUrl: './pulse.component.html',
    styleUrls: ['./pulse.component.scss'],
    imports: [forwardRef(() => ComponentMapperComponent)]
})
export class PulseComponent implements OnInit {
  @Input() pConn$: typeof PConnect;

  configProps$: PulseProps;
  currentUser$: string | undefined;
  currentUserInitials$: string | undefined = '--';

  ngOnInit() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    // this.currentUser$ = this.configProps$.currentUser;
    this.currentUser$ = PCore.getEnvironmentInfo().getOperatorName();

    if (this.currentUser$ != '') {
      this.currentUserInitials$ = this.currentUser$?.charAt(0);

      if (this.currentUser$ && this.currentUser$.lastIndexOf(' ') > 0) {
        const lastName = this.currentUser$?.substring(this.currentUser$.lastIndexOf(' ') + 1);
        this.currentUserInitials$ += lastName.charAt(0);
      } else if (this.currentUser$ && this.currentUser$.lastIndexOf('.') > 0) {
        const lastName = this.currentUser$?.substring(this.currentUser$.lastIndexOf('.') + 1);
        this.currentUserInitials$ += lastName.charAt(0);
      }
    }
  }
}
