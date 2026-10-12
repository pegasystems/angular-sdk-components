import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { logout } from '@pega/auth/lib/sdk-auth-manager';
import { ComponentMapperComponent } from 'packages/angular-sdk-components/src/lib/_bridge/component-mapper/component-mapper.component';
import { CustomerSupportShellComponent } from '../shell/customer-support-shell.component';
import { CustomerSupportCaseService } from '../../services/customer-support-case.service';
import { CustomerSupportLanguageService } from '../../services/customer-support-language.service';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';

@Component({
  selector: 'app-customer-issue-case',
  templateUrl: './customer-issue-case.component.html',
  styleUrls: ['./customer-issue-case.component.scss'],
  imports: [RouterLink, ComponentMapperComponent, LanguageToggleComponent]
})
export class CustomerIssueCaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shell = inject(CustomerSupportShellComponent);
  private caseService = inject(CustomerSupportCaseService);

  caseId = '';
  pConn$ = this.shell.pConn$;
  language = inject(CustomerSupportLanguageService).language;
  isCaseLoaded = signal(false);

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('caseId') ?? '';
    if (!this.caseId) return;

    // Mounting the flow container mid-load leaves it holding a stale container item key
    this.caseService
      .openCase(this.caseId)
      .then(() => this.isCaseLoaded.set(true))
      .catch(error => console.error('Unable to open customer issue case:', error));
  }

  logOut() {
    logout().then(() => window.location.reload());
  }
}
