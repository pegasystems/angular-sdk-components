import { Component, Renderer2, OnInit, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { Utils } from '../../../_helpers/utils';

@Component({
  selector: 'app-email-summary-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './email-summary-item.component.html',
  styleUrl: './email-summary-item.component.scss',
  providers: [DatePipe]
})
export class EmailSummaryItemComponent implements OnInit {

  @Input() actions;
  @Input() fields;
  @Input() email;
  showPopover: boolean;
  ToData: any;
  fromData: any;
  sentimentIcons = {
    negative: 'sentiment_dissatisfied',
    positive: 'sentiment_satisfied',
    neutral: 'sentiment_neutral'
  }
  sentiment: any;
  userInitial: string;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    this.renderer.listen('window', 'click', el => {
      const clickedInside = this.el.nativeElement.contains(el.target);

      if (!clickedInside) {
        this.showPopover = false;
      }
    });

    this.showPopover = false;
    this.ToData = this.email?.to;
    this.fromData = this.email.from;
    this.sentiment = this.email.sentiment;
    console.log('this.email', this.email);
    this.userInitial = this.utils.getInitials(this.fromData.fullName ?? '');
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

  showMoreData() {
    this.showPopover = !this.showPopover;
  }
}
