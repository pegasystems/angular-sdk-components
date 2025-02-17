import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, MatChipsModule, MatProgressBarModule, MatMenuModule],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailSocialComponent implements OnInit {
  @Input() id: string;
  @Input() from: any;
  @Input() to: any[] = [];
  @Input() cc: any[] = [];
  @Input() bcc: any[] = [];
  @Input() timeStamp: string;
  @Input() sentiment: any;
  @Input() subject: string;
  @Input() trail: any;
  @Input() attachments: any[] = [];
  @Input() suggestions: any[] = [];
  @Input() entityHighlightMapping: any[] = [];
  @Input() onReply: Function;
  @Input() onForward: Function;
  @Input() onReplyAll: Function;
  @Input() onEditDraft: Function;
  @Input() onDeleteDraft: Function;
  @Input() onSuggestionClick: Function;
  @Input() contextMenu: any;
  @Input() status: string;
  @Input() banner: any;
  @Input() body: string;

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

  constructor(private breakpointObserver: BreakpointObserver) {
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
    this.item$.primary = this.from;
    this.item$.visual.icon = this.from.avatarProps.icon;
  }

  getEmailMoreInfoFields(): any[] {
    const fields: any = [];

    if (this.from) {
      fields.push({
        id: 'from',
        name: 'From',
        value: this.from.emailAddress
      });
    }

    if (this.to.length > 0) {
      fields.push({
        id: 'to',
        name: 'To',
        value: this.getEmailDisplayList(this.to, true)
      });
    }

    if (this.cc.length > 0) {
      fields.push({
        id: 'cc',
        name: 'CC',
        value: this.getEmailDisplayList(this.cc, true)
      });
    }

    if (this.bcc.length > 0) {
      fields.push({
        id: 'bcc',
        name: 'BCC',
        value: this.getEmailDisplayList(this.bcc, true)
      });
    }

    if (this.timeStamp) {
      fields.push({
        id: 'date',
        name: 'Date',
        value: new Date(this.timeStamp).toLocaleString()
      });
    }

    return fields;
  }

  getEmailDisplayList(emailUsers: any[], showEmailAddress: boolean): string {
    return emailUsers.map(user => `${user.fullName}${showEmailAddress ? ` <${user.emailAddress}>` : ''}`).join('; ');
  }

  onContextMenu(event: MouseEvent): void {
    if (this.contextMenu) {
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
    this.contextMenu.onItemClick(selectedValue);
  }

  getActions(): any[] {
    const actions: any = [];
    if (this.status !== 'draft') {
      if (this.onReply) {
        actions.push({
          icon: 'reply',
          label: 'Reply',
          onClick: () => this.onReply(this.id)
        });
      }
      if (this.onReplyAll) {
        actions.push({
          icon: 'reply-all',
          label: 'Reply All',
          onClick: () => this.onReplyAll(this.id)
        });
      }
      if (this.onForward) {
        actions.push({
          icon: 'forward',
          label: 'Forward',
          onClick: () => this.onForward(this.id)
        });
      }
    }
    if (this.status === 'draft') {
      if (this.onEditDraft) {
        actions.push({
          icon: 'pencil',
          label: 'Edit',
          onClick: () => this.onEditDraft(this.id)
        });
      }
      if (this.onDeleteDraft) {
        actions.push({
          icon: 'trash',
          label: 'Delete',
          onClick: () => this.onDeleteDraft(this.id)
        });
      }
    }
    return actions;
  }
}
