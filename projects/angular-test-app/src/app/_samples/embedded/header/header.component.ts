import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule]
})
export class HeaderComponent {
  isMenuOpen = false;
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
