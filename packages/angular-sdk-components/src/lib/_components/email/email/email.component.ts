import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmailSummaryItemComponent } from '../email-summary-item/email-summary-item.component';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { EmailService } from '../email-service/email.service';
import { EMAIL_ACTIONS } from '../common/Constants';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    MatTooltipModule,
    EmailSummaryItemComponent,
    forwardRef(() => ComponentMapperComponent)
  ],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailSocialComponent implements OnInit {
  private emailService: EmailService = inject(EmailService);

  @Input() email;

  @ViewChild('emailMoreInfoBtnRef') emailMoreInfoBtnRef: ElementRef;
  @ViewChild('emailMoreInfoPopover') emailMoreInfoPopover: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenuTrigger: MatMenuTrigger;

  showEmailMoreInfo = false;
  contextMenuItems: any[] = [];
  contextMenuLoading = false;
  contextMenuPopoverOpen = false;
  isSmallOrAbove: boolean;
  isMediumOrAbove: boolean;
  currentTarget: any;
  item$: any;
  showMoreSvg: string;
  actions: any[];
  fields: any[];
  attachments: any[] = [];
  menuIconOverrideAction$: any;

  constructor(
    private utils: Utils,
    private breakpointObserver: BreakpointObserver
  ) {
    // this.iconRegistry.addSvgIcon('reply', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/reply.svg'));
    // this.iconRegistry.addSvgIcon('reply-all', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/reply-all.svg'));
    // this.iconRegistry.addSvgIcon('forward', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/forward.svg'));
    // this.iconRegistry.addSvgIcon('pencil', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/pencil.svg'));
    // this.iconRegistry.addSvgIcon('trash', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/trash.svg'));
    // this.iconRegistry.addSvgIcon('arrow-micro-down', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow-micro-down.svg'));
    // this.iconRegistry.addSvgIcon('more-alt', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/more-alt.svg'));
  }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset]).subscribe(result => {
      this.isSmallOrAbove = !result.matches;
    });

    this.breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Tablet]).subscribe(result => {
      this.isMediumOrAbove = !result.matches;
    });
    // this.item$.primary = this.from;
    // this.item$.visual.icon = this.from.avatarProps.icon;
    this.showMoreSvg = this.utils.getImageSrc('arrow-micro-down', this.utils.getSDKStaticContentUrl());
    this.actions = this.getActions();
    this.fields = this.getEmailMoreInfoFields();
    this.menuIconOverrideAction$ = { onClick: this.downloadFile.bind(this) };
    this.attachments = this.email.attachments;
    // this.prepareInputForAttachment(this.email.attachments);
  }

  getEmailMoreInfoFields(): any[] {
    const fields: any = [];

    if (this.email.from) {
      fields.push({
        id: 'from',
        name: 'From',
        value: this.email.from.emailAddress
      });
    }

    if (this.email.to.length > 0) {
      fields.push({
        id: 'to',
        name: 'To',
        value: this.getEmailDisplayList(this.email.to, true)
      });
    }

    if (this.email.cc.length > 0) {
      fields.push({
        id: 'cc',
        name: 'CC',
        value: this.getEmailDisplayList(this.email.cc, true)
      });
    }

    if (this.email.bcc.length > 0) {
      fields.push({
        id: 'bcc',
        name: 'BCC',
        value: this.getEmailDisplayList(this.email.bcc, true)
      });
    }

    if (this.email.timeStamp) {
      fields.push({
        id: 'date',
        name: 'Date',
        value: new Date(this.email.timeStamp).toLocaleString()
      });
    }

    return fields;
  }

  showTrialContent(email) {
    email.trail.expanded = !email.trail.expanded;
  }

  getEmailDisplayList(emailUsers: any[], showEmailAddress: boolean): string {
    return emailUsers.map(user => `${user.fullName}${showEmailAddress ? ` <${user.emailAddress}>` : ''}`).join('; ');
  }

  onContextMenu(event: MouseEvent): void {
    if (this.email.contextMenu) {
      this.currentTarget = {
        targetNode: event.target,
        cursorPosition: {
          x: event.pageX - window.scrollX,
          y: event.pageY - window.scrollY
        }
      };
      this.contextMenuTrigger.openMenu();
    }
  }

  onItemClick(selectedValue: { fieldName: string; fieldValue: string }): void {
    this.contextMenuPopoverOpen = false;
    this.email.contextMenu.onItemClick(selectedValue);
  }

  getActions(): any[] {
    const actions: any = [];
    if (this.email.status !== 'draft') {
      actions.push({
        icon: 'reply',
        iconImg: this.utils.getImageSrc('reply', this.utils.getSDKStaticContentUrl()),
        label: 'Reply',
        name: EMAIL_ACTIONS.REPLY
      });
      if (this.email.to?.length > 1) {
        actions.push({
          icon: 'reply_all',
          iconImg: this.utils.getImageSrc('reply-all', this.utils.getSDKStaticContentUrl()),
          label: 'Reply All',
          name: EMAIL_ACTIONS.REPLY_ALL
        });
      }
      actions.push({
        icon: 'forward',
        iconImg: this.utils.getImageSrc('forward', this.utils.getSDKStaticContentUrl()),
        label: 'Forward',
        name: EMAIL_ACTIONS.FORWARD
      });
    }
    if (this.email.status === 'draft') {
      actions.push({
        icon: 'edit',
        label: 'Edit',
        name: EMAIL_ACTIONS.EDIT
      });
      actions.push({
        icon: 'delete',
        label: 'Delete',
        name: EMAIL_ACTIONS.DELETE
      });
    }
    return actions;
  }

  downloadFile(attachment) {
    console.log(`Download file clicked${attachment}`);
    const attachmentInfo = {
      name: attachment.name,
      ID: attachment.id
    };
    this.emailService.downloadAttachment(attachmentInfo, this.emailService.emailContainerPConnect);
    // attachment.onClick();
  }
}
