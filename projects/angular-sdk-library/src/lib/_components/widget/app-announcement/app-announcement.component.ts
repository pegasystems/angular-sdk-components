import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-app-announcement',
  templateUrl: './app-announcement.component.html',
  styleUrls: ['./app-announcement.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule]
})
export class AppAnnouncementComponent implements OnInit {
  @Input() pConn$: any;

  header$: string;
  description$: string;
  arDetails$: Array<string>;
  label$: string;
  whatsnewlink$: string;

  constructor() {}

  ngOnInit(): void {
    let configProps = this.pConn$.getConfigProps();

    this.header$ = configProps.header;
    this.description$ = configProps.description;
    this.arDetails$ = configProps.details;
    this.label$ = configProps.label;
    this.whatsnewlink$ = configProps.whatsnewlink;
  }
}
