import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { logout } from '@pega/auth/lib/sdk-auth-manager';
import { CustomerSupportCaseService } from '../../services/customer-support-case.service';
import { openSettingsDialog } from '../settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-customer-support-dashboard',
  templateUrl: './customer-support-dashboard.component.html',
  styleUrls: ['./customer-support-dashboard.component.scss'],
  imports: [CommonModule]
})
export class CustomerSupportDashboardComponent {
  private caseService = inject(CustomerSupportCaseService);
  private dialog = inject(MatDialog);

  caseTypes: any[] = [];
  isCreatingCase = false;

  constructor(
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    this.caseTypes = PCore.getEnvironmentInfo().environmentInfoObject?.pyCaseTypeList ?? [];
  }

  async openCase(caseType: any) {
    if (this.isCreatingCase) return;

    this.isCreatingCase = true;
    this.cdRef.markForCheck();

    try {
      const caseKey = await this.caseService.createCase(caseType.pyWorkTypeImplementationClassName);
      if (caseKey) {
        await this.router.navigate(['/customer-support', 'case', caseKey]);
      } else {
        console.error('Case was created but its ID could not be found in the store.');
      }
    } catch (error) {
      console.error('Unable to create customer issue case:', error);
    } finally {
      this.isCreatingCase = false;
      this.cdRef.markForCheck();
    }
  }

  openSettings() {
    openSettingsDialog(this.dialog);
  }

  logOut() {
    logout().then(() => window.location.reload());
  }
}
