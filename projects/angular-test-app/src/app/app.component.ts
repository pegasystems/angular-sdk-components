import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../../../packages/angular-sdk-components/src/lib/_services/theme.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    const themeClass = this.themeService.getDefaultTheme();
    this.themeService.setTheme(themeClass);
  }
}
