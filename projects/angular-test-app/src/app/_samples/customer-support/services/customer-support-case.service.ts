import { Injectable } from '@angular/core';

const EMBED_PAGE = 'pyEmbedAssignment';

@Injectable({ providedIn: 'root' })
export class CustomerSupportCaseService {
  async createCase(caseTypeClass: string): Promise<string | undefined> {
    // Without a rendered RootContainer, case data lands under a "null" container instead of app/primary_1
    PCore.getInitialiser().initCoreContainers();

    await PCore.getMashupApi().createCase(caseTypeClass, this.appContext, { pageName: EMBED_PAGE });
    return this.getCaseId();
  }

  async openCase(caseId: string): Promise<void> {
    if (this.getCaseId() === caseId) return;

    PCore.getInitialiser().initCoreContainers();
    await PCore.getMashupApi().openCase(caseId, this.appContext, { pageName: EMBED_PAGE });

    // Let the store settle before reading the case's assignment
    await new Promise(resolve => setTimeout(resolve));

    const assignmentId = this.getLatestAssignmentId();
    if (!assignmentId || this.isCaseResolved()) return;

    await PCore.getMashupApi().openAssignment(assignmentId, this.appContext, { pageName: EMBED_PAGE });
  }

  getCaseId(): string | undefined {
    return PCore.getStoreValue('.ID', 'caseInfo', this.primaryContainer);
  }

  private getLatestAssignmentId(): string | undefined {
    return (
      PCore.getStoreValue('.assignmentID', 'context_data', this.primaryContainer) ||
      PCore.getStoreValue('.ID', 'caseInfo.assignments[0]', this.primaryContainer)
    );
  }

  private isCaseResolved(): boolean {
    const status: string = PCore.getStoreValue('.status', 'caseInfo', this.primaryContainer) ?? '';
    return status.startsWith('Resolved');
  }

  private get appContext(): string {
    return PCore.getConstants().APP.APP;
  }

  private get primaryContainer(): string {
    return PCore.getContainerUtils().getActiveContainerItemName(`${this.appContext}/primary`) || `${this.appContext}/primary_1`;
  }
}
