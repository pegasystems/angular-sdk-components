/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonModule } from '@angular/common';
import { Component, forwardRef, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { MatInputModule } from '@angular/material/input';
import { RichTextEditorComponent } from '../../../_components/designSystemExtension/rich-text-editor/rich-text-editor.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { EmailService } from '../email-service/email.service';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EmailSelectorComponent } from '../email/email-selector/email-selector.component';

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
    forwardRef(() => ComponentMapperComponent)
  ],
  templateUrl: './email-composer.component.html',
  styleUrl: './email-composer.component.scss'
})
export class EmailComposerComponent implements OnInit {
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
  email: any;

  emailForm: FormGroup;
  isProgress = false;

  private emailService: EmailService = inject(EmailService);
  options$: { emailAddress: string; fullName: string; shortName: string }[];
  static getPConnect: any;

  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      to: ['', [Validators.required]],
      cc: [''],
      bcc: [''],
      subject: ['', [Validators.required]],
      body: ['', [Validators.required]]
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

  sendEmail() {
    if (this.emailForm.valid) {
      this.isProgress = true;
      const payload = this.prepareEmailPayload();
      this.emailService.sendEmail(payload).subscribe(
        response => {
          this.isProgress = false;
          if (response.status === 'success') {
            // this.toastr.success('Email sent successfully');
            this.setIsActive(false);
          } else {
            //  this.toastr.error('Error sending email');
          }
        },
        error => {
          this.isProgress = false;
          // this.toastr.error('Error sending email');
        }
      );
    } else {
      // this.toastr.error('Please fill in all required fields');
    }
  }

  prepareEmailPayload() {
    return {
      to: this.emailForm.value.to,
      cc: this.emailForm.value.cc,
      bcc: this.emailForm.value.bcc,
      subject: this.emailForm.value.subject,
      body: this.emailForm.value.body,
      attachments: this.data.attachments,
      templateId: this.data.selectedTemplateId,
      context: this.Context,
      caseId: this.CaseID,
      actionType: this.ActionType,
      guid: this.GUID
    };
  }

  saveDraft() {
    // Logic to save draft
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

  handleAttachment(e) {
    e.preventDefault();
  }

  handleCancel(e) {
    e.preventDefault();
    this.emailService.closeEmailComposer();
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
