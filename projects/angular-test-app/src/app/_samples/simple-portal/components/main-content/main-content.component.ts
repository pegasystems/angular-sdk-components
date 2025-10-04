import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
  standalone: false
})
export class MainContentComponent implements OnInit {
  @Input() pConn$: typeof PConnect;

  sComponentName$: string | undefined;

  ngOnInit(): void {
    if (this.pConn$) {
      this.sComponentName$ = this.pConn$.getComponentName();
    }
  }
}
