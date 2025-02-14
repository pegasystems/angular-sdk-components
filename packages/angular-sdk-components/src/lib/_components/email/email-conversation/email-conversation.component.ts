import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-conversation',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule],
  templateUrl: './email-conversation.component.html',
  styleUrl: './email-conversation.component.scss'
})
export class EmailConversationComponent implements OnInit {
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

  @ViewChild('headerRef') headerRef: ElementRef;
  isSmallOrAbove: boolean;

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private breakpointObserver: BreakpointObserver
  ) {
    this.iconRegistry.addSvgIcon('caret-down', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/caret-down.svg'));
    this.iconRegistry.addSvgIcon('caret-left', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/caret-left.svg'));
    this.iconRegistry.addSvgIcon('caret-right', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/caret-right.svg'));
  }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset]).subscribe(result => {
      this.isSmallOrAbove = !result.matches;
    });
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

  onExpandCollapse(panel: MatExpansionPanel): void {
    panel.toggle();
  }
}
