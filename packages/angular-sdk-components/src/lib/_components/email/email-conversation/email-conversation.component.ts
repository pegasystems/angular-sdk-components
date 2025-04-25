/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, Input, OnInit, ViewChild, ElementRef, forwardRef, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
// import { DomSanitizer } from '@angular/platform-browser';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { Utils } from '../../../_helpers/utils';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { EmailService } from '../email-service/email.service';
import { DatePipe } from '@angular/common';
// interface EmailConversationProps {
//   id: string;
//   emails: any[];
//   from: any;
//   to: any[];
//   unReadEmailCount: number;
//   timeStamp: string;
//   isForwarded: boolean;
//   isCollapsed: boolean;
//   undelivered: boolean;
//   drafts: boolean;
// }

@Component({
  selector: 'app-email-conversation',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, forwardRef(() => ComponentMapperComponent)],
  templateUrl: './email-conversation.component.html',
  styleUrl: './email-conversation.component.scss',
  providers: [DatePipe]
})
export class EmailConversationComponent implements OnInit {
  public emailService: EmailService = inject(EmailService);
  // @Input() pConn$: typeof PConnect;
  // @Input() conversation: EmailConversationProps;
  @Input() conversation;

  isRtl = true;
  caretDownSvg: string;
  caretRightSvg: string;
  emails: any[];
  isCollapsed = false;
  isSmallOrAbove: boolean;
  to: any;
  unReadEmailCount: any;
  isForwarded: any;
  from: any;
  undelivered: boolean;
  timeStamp: string;
  drafts: boolean;
  @ViewChild('headerRef') headerRef: ElementRef;
  constructor(private utils: Utils) {}

  ngOnInit(): void {
    const { id, emails, from, to, unReadEmailCount, timeStamp, isForwarded, isCollapsed, undelivered, drafts } = this.conversation;
    this.emails = emails;
    this.from = from;
    this.to = to;
    this.isCollapsed = isCollapsed;
    this.unReadEmailCount = unReadEmailCount;
    this.isForwarded = isForwarded;
    this.undelivered = undelivered;
    this.timeStamp = timeStamp;
  }

  getRecipientList(): string {
    const recipientElements = this.to.slice(0, 2).map((recipient, i) => {
      return `${recipient.shortName}${i < this.to.length - 1 ? ';' : ''} `;
    });
    if (this.to.length > 2) {
      return [...recipientElements, `+${this.to.length - 2} more`].join('');
    }
    return recipientElements.join('');
  }

  onExpandCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
