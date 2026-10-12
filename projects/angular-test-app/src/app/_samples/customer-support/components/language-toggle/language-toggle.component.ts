import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CustomerSupportLanguageService } from '../../services/customer-support-language.service';

@Component({
  selector: 'app-language-toggle',
  templateUrl: './language-toggle.component.html',
  styleUrls: ['./language-toggle.component.scss'],
  imports: [MatFormFieldModule, MatSelectModule]
})
export class LanguageToggleComponent {
  languageService = inject(CustomerSupportLanguageService);

  changeLanguage(event: MatSelectChange) {
    this.languageService.setLanguage(event.value);
  }
}
