import { CommonModule } from '@angular/common';
import { Component, forwardRef, inject, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { EmailService } from '../email-service/email.service';
// import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-email-shell',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatMenuModule, forwardRef(() => ComponentMapperComponent)],
  templateUrl: './email-shell.component.html',
  styleUrl: './email-shell.component.scss'
})
export class EmailShellComponent implements OnInit {
  public emailService: EmailService = inject(EmailService);

  @Input() conversations: any[];
  @Input() headerProps: any;
  @Input() autoCollapse = false;

  activeIndex = 0;
  singleConversation: boolean;

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
    // private breakpointObserver: BreakpointObserver
  ) {
    this.iconRegistry.addSvgIcon('mail', this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/mail.svg'));
  }

  ngOnInit(): void {
    // this.headerProps = { subject: 'Pause service' };
    this.singleConversation = this.conversations?.length === 1;
  }

  renderConversations(): any[] {
    if (!this.conversations) return [];

    if (this.singleConversation) {
      const conversation = this.conversations[0];
      return [conversation];
    }

    return this.autoCollapse
      ? this.conversations.map((conversation, index) => {
          const collapsed = index !== this.activeIndex;
          return { ...conversation, isCollapsed: collapsed };
        })
      : this.conversations;
  }

  // expand event not present in email conversations
  onExpand(index: number, onExpandCallback: Function): void {
    this.activeIndex = index;
    if (onExpandCallback) onExpandCallback();
  }
}
