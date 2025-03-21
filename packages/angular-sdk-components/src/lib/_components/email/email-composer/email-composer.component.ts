import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, inject, Input, OnInit, Output, SimpleChanges, OnChanges, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RichTextEditorComponent } from '../../../_components/designSystemExtension/rich-text-editor/rich-text-editor.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { EmailService } from '../email-service/email.service';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmailSelectorComponent } from '../email/email-selector/email-selector.component';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-discard-unsaved-changes-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  standalone: true,
  styleUrl: './email-composer.component.scss',
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Discard unsaved changes?</h2>
      <mat-icon style="cursor:pointer" matTooltip="close" [mat-dialog-close]="true">close</mat-icon>
    </div>
    <mat-dialog-content>You have unsaved changes. You can discard them or go back to keep working.</mat-dialog-content>
    <mat-dialog-actions align="end" style="justify-content: space-between; padding:24px">
      <button mat-raised-button color="secondary" [mat-dialog-close]="true">Go back</button>
      <div>
        <button mat-raised-button color="secondary" (click)="saveDraft()" [mat-dialog-close]="true">Save & close</button>
        <button mat-raised-button color="primary" [mat-dialog-close]="true" (click)="closeComposerWindow()">Discard changes</button>
      </div>
    </mat-dialog-actions>
  `
})
class DiscardUnsavedChangesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DiscardUnsavedChangesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  saveDraft() {
    this.data.componentRef.saveDraft();
  }

  closeComposerWindow() {
    this.data.componentRef.emailService.closeEmailComposer();
  }
}

@Component({
  selector: 'lib-email-composer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    RichTextEditorComponent,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    EmailSelectorComponent,
    MatDialogActions,
    MatDialogContent,
    MatTooltipModule,
    MatProgressSpinnerModule,
    forwardRef(() => ComponentMapperComponent)
  ],
  templateUrl: './email-composer.component.html',
  styleUrl: './email-composer.component.scss'
})
export class EmailComposerComponent implements OnInit, OnChanges {
  @Input() IsEmailClient: boolean;
  @Input() Context: string;
  @Input() CaseID: string;
  @Input() TemplateID: string;
  @Input() Replies: any[];
  @Input() ActionType: string;
  @Input() setIsActive: (active: boolean) => void;
  @Input() hasSavedDraft: boolean;
  @Input() GUID: string;
  @Input() body: string;
  @Input() preLoadArticleData: any;
  @Input() isGenAIEnabled: boolean;
  @Input() handle: any;
  @Input() templates: any;
  @Input() data: any;
  @Input() participants: any;
  @Input() selectedItems: any;
  @Input() progress;
  @Input() onChange: any;
  @Input() label;
  @Input() responseType: string;
  @Input() externalValidator: any;
  @Output() onSend: EventEmitter<any> = new EventEmitter();
  @Output() onSave: EventEmitter<any> = new EventEmitter();
  email: any;
  readonly dialog = inject(MatDialog);
  emailForm: FormGroup;
  isProgress = false;

  private emailService: EmailService = inject(EmailService);
  options$: { emailAddress: string; fullName: string; shortName: string }[];
  static getPConnect: any;
  showMinimizeWindow: boolean;
  isMaximized: boolean;
  menuIconOverrideAction$: any;
  initialFormData: any;

  protected _onDestroy = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      to: ['', [Validators.required]],
      cc: [''],
      bcc: [''],
      subject: ['', [Validators.required]],
      emailBody: [''],
      responseTemplates: [[]],
      responseType: ['']
    });
  }

  responseTemplateOptions: any;
  ccVisible = false;
  bccVisible = false;
  menuItems: any[];
  menuItemsText: any[];
  menuSelectedValue: any = 'reply';

  // onChange(p0: string, p1: string) {}

  getMetadata() {
    // Fetch metadata logic here
  }

  ngOnInit() {
    // this.getMetadata();
    /* this.options$ = [
      { key: 'vishal@hmail.com', value: 'vishal@hmail.com' },
      { key: 'ss@h.com', value: 'ss@h.com' }
    ]; */
    this.options$ = [
      { emailAddress: 'vishal@hmail.com', fullName: 'vishal@hmail.com', shortName: 'vishal' },
      { emailAddress: 'rahul@hmail.com', fullName: 'rahul@hmail.com', shortName: 'rahul' }
    ];

    // this.selectedItems = ['vishal@hmail.com'];

    this.email = {
      to: 'vishal@hmail.com',
      cc: [...this.options$],
      bcc: [...this.options$],
      subject: '',
      body: '',
      attachments: []
    };

    this.menuItems = [
      {
        id: 'reply',
        onClick: () => {
          this.onChange('responseType', 'reply');
        },
        text: 'Reply'
      },
      {
        id: 'replyAll',
        onClick: () => {
          this.onChange('responseType', 'replyAll');
        },
        text: 'Reply all'
      },
      {
        id: 'forward',
        onClick: () => {
          this.onChange('responseType', 'forward');
        },
        text: 'Forward'
      }
    ];

    this.menuItemsText = ['reply', 'replyAll', 'forward'];
    this.menuIconOverrideAction$ = { onClick: this.removeFile.bind(this) };
    this.emailForm.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.prepareEmailPayload();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const { data } = changes;
    if (data) {
      const { previousValue, currentValue } = data;
      if (previousValue && previousValue !== currentValue) {
        this.emailForm.setValue({
          to: this.data.to.value || [],
          cc: this.data.cc.value || [],
          bcc: this.data.bcc.value || [],
          subject: this.data.subject.value,
          emailBody: this.data.bodyContent.defaultValue,
          responseType: this.data.responseType,
          responseTemplates: []
        });
        this.initialFormData = this.emailForm.value;
        this.isProgress = this.progress;
      }
    }
  }

  getText(val) {
    console.log(val);
    this.menuItems.forEach(item => {
      if (item.id === val) {
        return item.text;
      }
    });
    return 'Reply';
  }

  saveDraft() {
    this.onSave.emit();
  }

  sendEmail() {
    this.isProgress = true;
    if (this.emailForm.valid) {
      this.prepareEmailPayload();
      this.onSend.emit();
    } else {
      console.log('Form is invalid');
    }
  }

  prepareEmailPayload() {
    this.data.to.value = this.emailForm.value.to;
    this.data.cc.value = this.emailForm.value.cc;
    this.data.bcc.value = this.emailForm.value.bcc;
    this.data.subject.value = this.emailForm.value.subject;
    this.data.bodyContent = { defaultValue: this.emailForm.value.emailBody };
    this.data.responseType = this.emailForm.value.responseType;
  }

  discardChanges() {
    // Logic to discard changes
  }

  handleCC(e) {
    e.preventDefault();
    this.ccVisible = true;
  }

  handleBCC(e) {
    e.preventDefault();
    this.bccVisible = true;
  }

  createUID = (): string => {
    return `_${Math.random().toString(36).slice(2, 11)}`;
  };

  handleAttachment(e) {
    // e.preventDefault();
    console.log('Attachment clicked');
    // name: attachment.pyName,
    //   value: attachment.pyName,
    //   format: attachment.pyName.split('.').pop(),
    if (e.target.files) {
      // const newFiles = Array.from(e.target.files).map((file: any) => ({
      //   File: file,
      //   visual: { icon: 'document-doc' },
      //   primary: { name: file.name },
      //   secondary: { text: '' },
      //   id: '1234', // require unique id generation
      //   name: file.name,
      //   value: file.name,
      //   format: file.name.split('.').pop(),
      //   src: null,
      //   onClick: file.onDownload // remove function to be added
      // }));
      const files = Array.from(e.target.files).map((file: any) => ({
        File: file,
        ID: this.createUID() // require unique id generation
      }));
      const newFiles = this.emailService.prepareInputForAttachment(files);
      // this.data.attachments = this.data.attachments ? [...this.data.attachments, ...newFiles] : newFiles;
      this.onChange('attachments', this.data.attachments ? [...this.data.attachments, ...newFiles] : newFiles);
      // handleOnChange in container
    }
  }

  removeFile(e) {
    console.log('Remove file clicked');
    const newAttachments = this.data.attachments.filter(attachment => attachment.id !== e.id);
    // this.data.attachments = newAttachments;
    this.onChange('attachments', newAttachments);
  }

  closeComposerWindow(e) {
    e.preventDefault();
    const formData = this.emailForm.value;
    const dirtyFields = {};

    Object.keys(this.emailForm.controls).forEach(key => {
      if (this.emailForm.controls[key].dirty) {
        dirtyFields[key] = this.emailForm.controls[key].value;
      }
    });
    const isFormDirty = JSON.stringify(formData) !== JSON.stringify(this.initialFormData);
    if (isFormDirty) {
      this.dialog.open(DiscardUnsavedChangesDialogComponent, {
        position: { top: '10px' },
        data: { componentRef: this }
      });
    } else {
      this.emailService.closeEmailComposer();
    }
  }

  minimize() {
    this.showMinimizeWindow = true;
    this.emailService.minimize();
  }

  maximize() {
    this.isMaximized = true;
    this.showMinimizeWindow = false;
    this.emailService.maximize();
  }

  dock() {
    this.showMinimizeWindow = false;
    this.isMaximized = false;
    this.emailService.dock();
  }

  onMenuChange(e) {
    console.log('Menu clicked');
    // this.responseType = e.value;
    this.menuItems.forEach(item => {
      if (item.id === e.value) {
        item.onClick();
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.email.attachments = Array.from(input.files) as any;
    }
  }

  onSubmit() {
    console.log('Email sent:', this.email);
    // Add your email sending logic here
  }
}
