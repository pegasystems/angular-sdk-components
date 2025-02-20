import { Component, Renderer2, OnInit, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';

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
  showPopover: boolean;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.renderer.listen('window', 'click', el => {
      const clickedInside = this.el.nativeElement.contains(el.target);

      if (!clickedInside) {
        this.showPopover = false;
      }
    });

    this.showPopover = false;
  }

  showMoreData() {
    this.showPopover = true;
  }
}
