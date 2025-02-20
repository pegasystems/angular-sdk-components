import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EmailSummaryItemComponent } from '../email-summary-item/email-summary-item.component';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { EmailService } from '../email-service/email.service';

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
  }

  getToEmailList(toList: any[]): string {
    let result = '';
    toList.slice(0, 2).forEach((to, i) => {
      if (i !== 0) {
        result += '; ';
      }
      result += `${to.shortName} `;
    });
    result += toList.length > 2 ? `+${toList.length - 2} more` : '';
    return result;
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
      // if (this.onReply) {
      actions.push({
        icon: 'reply',
        iconImg: this.utils.getImageSrc('reply', this.utils.getSDKStaticContentUrl()),
        label: 'Reply',
        onClick: () => this.emailService.onReply(this.email)
      });
      // }
      // if (this.onReplyAll) {
      actions.push({
        icon: 'reply_all',
        iconImg: this.utils.getImageSrc('reply-all', this.utils.getSDKStaticContentUrl()),
        label: 'Reply All'
        // onClick: () => this.onReplyAll(this.id)
      });
      // }
      // if (this.onForward) {
      actions.push({
        icon: 'forward',
        iconImg: this.utils.getImageSrc('forward', this.utils.getSDKStaticContentUrl()),
        label: 'Forward'
        // onClick: () => this.onForward(this.id)
      });
      // }
    }
    if (this.email.status === 'draft') {
      // if (this.onEditDraft) {
      actions.push({
        icon: 'pencil',
        label: 'Edit'
        // onClick: () => this.onEditDraft(this.id)
      });
      // }
      // if (this.onDeleteDraft) {
      actions.push({
        icon: 'trash',
        label: 'Delete'
        // onClick: () => this.onDeleteDraft(this.id)
      });
      // }
    }
    return actions;
  }
}
