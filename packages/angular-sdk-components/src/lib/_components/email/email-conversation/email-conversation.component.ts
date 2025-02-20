import { Component, Input, OnInit, ViewChild, ElementRef, forwardRef, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
// import { DomSanitizer } from '@angular/platform-browser';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
  @Input() id: string;
  @Input() emails: any[];
  @Input() from: any;
  @Input() to: any[];
  @Input() unReadEmailCount: number;
  @Input() timeStamp: string;
  @Input() isForwarded = false;
  @Input() isCollapsed = false;
  @Input() undelivered: boolean;
  @Input() drafts: boolean;
  isRtl = true;
  caretDownSvg: string;
  caretRightSvg: string;

  @ViewChild('headerRef') headerRef: ElementRef;
  isSmallOrAbove: boolean;

  constructor(
    private utils: Utils,
    // private sanitizer: DomSanitizer,
    private breakpointObserver: BreakpointObserver
  ) {
    // this.iconRegistry.addSvgIcon('caret-down', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/caret-down.svg'));
    // this.iconRegistry.addSvgIcon('caret-left', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/caret-left.svg'));
    // this.iconRegistry.addSvgIcon('caret-right', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/caret-right.svg'));
  }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset]).subscribe(result => {
      this.isSmallOrAbove = !result.matches;
    });

    this.caretDownSvg = this.utils.getImageSrc('caret-down', this.utils.getSDKStaticContentUrl());
    this.caretRightSvg = this.utils.getImageSrc('caret-right', this.utils.getSDKStaticContentUrl());

    // this.id = this.conversation.id;
    // this.emails = this.conversation.emails;
    // this.from = this.conversation.from;
    // this.to = this.conversation.to;
    // this.unReadEmailCount = this.conversation.unReadEmailCount;
    // this.timeStamp = this.conversation.timeStamp;
    // this.isForwarded = this.conversation.isForwarded;
    // this.isCollapsed = this.conversation.isCollapsed;
    // this.undelivered = this.conversation.undelivered;
    // this.drafts = this.conversation.drafts;
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
    // panel.toggle();
  }
}
