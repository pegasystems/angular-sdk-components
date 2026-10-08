import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomerSupportCaseService } from '../../services/customer-support-case.service';

@Component({
  selector: 'app-customer-support-dashboard',
  templateUrl: './customer-support-dashboard.component.html',
  styleUrls: ['./customer-support-dashboard.component.scss'],
  imports: [CommonModule]
})
export class CustomerSupportDashboardComponent {
  private caseService = inject(CustomerSupportCaseService);

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
}
