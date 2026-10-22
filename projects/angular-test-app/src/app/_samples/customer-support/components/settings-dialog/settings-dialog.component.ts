import { Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CustomerSupportSettings, CustomerSupportSettingsService } from '../../services/customer-support-settings.service';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss'],
  imports: [MatDialogModule, MatSlideToggleModule]
})
export class SettingsDialogComponent {
  private readonly settingsService = inject(CustomerSupportSettingsService);
  private readonly dialogRef = inject(MatDialogRef<SettingsDialogComponent>);

  readonly draft = signal<CustomerSupportSettings>({ ...this.settingsService.settings() });
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  update(key: keyof CustomerSupportSettings, value: boolean): void {
    this.draft.update(settings => ({ ...settings, [key]: value }));
  }

  async save(): Promise<void> {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.dialogRef.disableClose = true;

    try {
      await this.settingsService.save(this.draft());
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Unable to apply customer support settings:', error);
      this.errorMessage.set('Language resources could not be loaded. Try again.');
    } finally {
      this.isSaving.set(false);
      this.dialogRef.disableClose = false;
    }
  }
}

export function openSettingsDialog(dialog: MatDialog): MatDialogRef<SettingsDialogComponent, boolean> {
  return dialog.open(SettingsDialogComponent, {
    width: '32rem',
    maxWidth: 'calc(100vw - 2rem)',
    autoFocus: 'first-tabbable',
    panelClass: ['light', 'customer-support-settings-dialog']
  });
}
