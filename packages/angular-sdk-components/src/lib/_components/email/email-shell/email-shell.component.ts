import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
// import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-email-shell',
  standalone: true,
  imports: [CommonModule, MatIconModule, forwardRef(() => ComponentMapperComponent)],
  templateUrl: './email-shell.component.html',
  styleUrl: './email-shell.component.scss'
})
export class EmailShellComponent implements OnInit {
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
    this.headerProps = { subject: 'Pause service' };
    this.conversations = [
      {
        id: 'M-33001_id',
        emails: [
          {
            id: 'M-33001',
            subject: '[EXTERNAL] Fw:Test',
            timeStamp: '2025-02-11T20:39:11.435Z',
            from: {
              fullName: 'admin',
              emailAddress: 'citibak123456@outlook.com',
              shortName: 'admin',
              avatarProps: '{icon: "headset"}'
            },
            to: [
              {
                avatarProps: {
                  icon: ''
                },
                emailAddress: 'vishal@gmail.com',
                fullName: 'Vishal ',
                shortName: 'Vishal '
              }
            ],
            trail: {
              content: '',
              expanded: false,
              loading: false
            }
          }
        ],
        unReadEmailCount: 1,
        timeStamp: '2025-02-12T01:39:11.435Z',
        isForwarded: true,
        from: {
          fullName: 'admin',
          emailAddress: 'citibak123456@outlook.com',
          shortName: 'admin',
          avatarProps: '{icon: "headset"}'
        },
        to: [
          {
            avatarProps: {
              icon: ''
            },
            emailAddress: 'vishal@gmail.com',
            fullName: 'Vishal',
            shortName: 'Vishal'
          }
        ],
        isCollapsed: true
      },
      {
        id: 'M-33001_id',
        emails: [
          {
            id: 'M-33001',
            subject: 'Test',
            timeStamp: '2025-02-11T20:39:11.435Z',
            from: {
              avatarProps: {
                icon: ''
              },
              emailAddress: 'vishal@gmail.com',
              fullName: 'Vishal ',
              shortName: 'Vishal '
            },
            to: [
              {
                avatarProps: {
                  icon: ''
                },
                emailAddress: 'citibak123456@outlook.com',
                fullName: 'citibak123456 ',
                shortName: 'citibak123456 '
              }
            ],
            body: "<div>\n          Hey, what's up? \n      </div>",
            sentiment: {
              variant: 'neutral'
            },
            unRead: false
          }
        ],
        unReadEmailCount: null,
        timeStamp: '2025-02-12T01:39:11.435Z',
        isForwarded: false,
        from: {
          fullName: 'vishal',
          emailAddress: 'vishal@gmail.com',
          shortName: 'vishal',
          avatarProps: '{icon: "headset"}'
        },
        to: [
          {
            avatarProps: {
              icon: ''
            },
            emailAddress: 'citibak123456@outlook.com',
            fullName: 'citibak123456 ',
            shortName: 'citibak123456 '
          }
        ],
        isCollapsed: true
      }
    ];
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
