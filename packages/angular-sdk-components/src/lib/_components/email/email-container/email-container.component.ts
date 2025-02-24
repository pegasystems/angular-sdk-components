import { Component, OnInit, OnDestroy, Input, forwardRef, inject } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { EmailService } from '../email-service/email.service';
import { isCaseInSharedContext } from '../common/EmailContainerContext';

@Component({
  selector: 'app-email-container',
  templateUrl: './email-container.component.html',
  standalone: true,
  imports: [forwardRef(() => ComponentMapperComponent)],
  styleUrls: ['./email-container.component.scss']
})
export class EmailContainerComponent implements OnInit, OnDestroy {
  public emailService: EmailService = inject(EmailService);

  @Input() pConn$: typeof PConnect;

  primaryCase;

  constructor() {
    console.log('EmailContainerComponent: constructor');
  }

  ngOnInit(): void {
    console.log('EmailContainerComponent: ngOnInit');

    const configProps = this.pConn$.getConfigProps();

    this.emailService.emailContainerPConnect = this.pConn$;

    this.emailService.caseInsKey = configProps.CaseInsKey;
    this.emailService.showContainerHeader = configProps.ShowContainerHeader;

    this.initialization();
  }

  ngOnDestroy(): void {
    console.log('EmailContainerComponent: ngOnDestroy');
    this.emailService.clear();
  }

  initialization() {
    console.log('EmailContainerComponent: initialization');

    this.emailService.isEmailClient = isCaseInSharedContext(this.emailService.caseInsKey);

    const primaryContainer = PCore.getContainerUtils().getActiveContainerItemName('app/primary') as string;

    if (this.emailService.emailThreads.length === 0) {
      this.emailService.getMetadata();
      this.primaryCase = PCore.getStoreValue('caseInfo.ID', '', primaryContainer);
    }
  }
}
