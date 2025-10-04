import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit {
  applicationLabel: string | undefined;

  ngOnInit() {
    this.applicationLabel = PCore.getEnvironmentInfo().getApplicationLabel();
  }
}
