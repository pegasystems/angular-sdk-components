import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmailService } from '../email-service/email.service';
import { Utils } from '../../../_helpers/utils';
import { format } from '../../../_helpers/formatters';

const SENTIMENT_ICONS = {
  negative: 'sentiment_dissatisfied',
  positive: 'sentiment_satisfied',
  neutral: 'sentiment_neutral'
};

@Component({
  selector: 'app-email-summary-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatMenuModule],
  templateUrl: './email-summary-item.component.html',
  styleUrl: './email-summary-item.component.scss',
  providers: [DatePipe]
})
export class EmailSummaryItemComponent implements OnInit {
  public emailService: EmailService = inject(EmailService);

  @Input() actions;
  @Input() fields;
  @Input() email;

  sentimentIcons = SENTIMENT_ICONS;
  toData: any;
  fromData: any;
  sentiment: any;
  userInitial: string;
  formattedValue$: string;
  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.toData = this.email?.to;
    this.fromData = this.email.from;
    this.sentiment = this.email.sentiment;
    this.userInitial = this.utils.getInitials(this.fromData.fullName ?? '');
    this.formattedValue$ = format(this.email.timeStamp, 'datetime', {
      // format: `${this.theDateFormat.dateFormatString} hh:mm A`
      format: 'ddd, DD MMM YYYY, hh:mm A'
    });
  }

  getToEmailList(toList: any[]): string {
    let result = '';
    toList.slice(0, 2).forEach((to, i) => {
      result += `${to.shortName} `;
      if (toList.length > 1 && i < toList.length - 1) {
        result += '; ';
      }
    });
    result += toList.length > 2 ? `+${toList.length - 2} more...` : '';
    return result;
  }
}
