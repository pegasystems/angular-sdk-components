import { Injectable } from '@angular/core';
import { Theme } from '../_types/Theme.interface';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themes: Theme[] = [
    {
      id: 'light',
      primary: '#8F00FF',
      displayName: 'Light Theme'
    },
    { id: 'dark', primary: '#FF00FF', displayName: 'Dark Theme' },
    { id: 'red', primary: '#FF0000', displayName: 'Red Theme' },
    { id: 'azure', primary: '#007FFF', displayName: 'Azure Theme' },
    { id: 'green', primary: '#008000', displayName: 'Green Theme' }
  ];

  getDefaultTheme(): string {
    return sessionStorage.getItem('activeTheme') ?? this.themes[0].id;
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  setTheme(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (theme) {
      document.body.classList.remove(...this.themes.map(t => t.id));
      document.body.classList.add(theme.id);
      sessionStorage.setItem('activeTheme', theme.id);
    }
  }
}
