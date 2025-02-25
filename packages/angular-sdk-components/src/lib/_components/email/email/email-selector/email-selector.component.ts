import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RichTextEditorComponent } from '../../../designSystemExtension/rich-text-editor/rich-text-editor.component';

interface EmailParticipant {
  emailAddress: string;
  fullName: string;
  shortName: string;
}

@Component({
  selector: 'app-email-selector',
  templateUrl: './email-selector.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressBarModule,
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
    MatMenuModule
  ],
  styleUrls: ['./email-selector.component.scss']
})
export class EmailSelectorComponent implements OnChanges {
  @Input() participants: any = [];
  @Input() selectedItems: any = [];
  @Input() label = '';
  @Input() mode: any;
  @Input() required = false;
  @Input() externalValidator?: (value: string) => boolean;
  @Input() status?: string;
  @Input() info?: string;
  @Input() compose: any;
  @Output() selectedItemsChange = new EventEmitter<string[]>();

  filterValue = '';
  emailParticipants: any[] = [];
  emailsToRender: any[] = [];

  constructor() {
    console.log(this.participants);
    console.log(this.selectedItems);
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnInit() {
    console.log(this.participants);
    console.log(this.selectedItems);
    this.emailParticipants = this.participants?.map(participant => participant.EmailAddress);
    this.updateEmailsToRender();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.participants);
    console.log(this.selectedItems);
    if (changes['participants']) {
      this.emailParticipants = this.participants;
      this.updateEmailsToRender();
    }
  }

  onFilterChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterValue = input.value;
    this.updateEmailsToRender();
  }

  onFilterBlur() {
    this.filterValue = '';
  }

  updateEmailsToRender() {
    const filterRegex = new RegExp(this.filterValue, 'i');
    const filteredItems = (
      this.filterValue
        ? this.emailParticipants.filter(({ emailAddress, fullName, shortName }) => {
            return filterRegex.test(emailAddress) || filterRegex.test(fullName) || filterRegex.test(shortName);
          })
        : this.emailParticipants
    ).map(({ emailAddress, fullName }) => {
      return {
        id: emailAddress,
        primary: fullName,
        secondary: emailAddress,
        selected: this.selectedItems.includes(emailAddress)
      };
    });

    const isValid = this.externalValidator?.(this.filterValue);

    this.emailsToRender =
      ((this.filterValue && this.externalValidator && isValid) || (this.filterValue && !this.externalValidator)) && !this.compose
        ? [
            {
              id: this.filterValue,
              primary: `Use: ${this.filterValue}`,
              selected: this.selectedItems.includes(this.filterValue)
            },
            ...filteredItems
          ]
        : filteredItems;
  }

  toggleSelectedItems(id: string) {
    let newSelectedItems = this.mode === 'single-select' ? [] : [...this.selectedItems];

    if (this.selectedItems.includes(id)) {
      newSelectedItems = newSelectedItems.filter(value => value !== id);
    } else {
      this.filterValue = '';
      const filteredItem = this.emailsToRender.find(item => item.id === id);

      if (!filteredItem?.secondary) {
        if (!this.externalValidator) {
          this.emailParticipants = [
            ...this.emailParticipants,
            {
              shortName: '',
              fullName: '',
              emailAddress: this.filterValue
            }
          ];
          newSelectedItems = [...newSelectedItems, id];
        } else {
          const isValid = this.externalValidator?.(this.filterValue);
          if (isValid) {
            this.emailParticipants = [
              ...this.emailParticipants,
              {
                shortName: '',
                fullName: '',
                emailAddress: this.filterValue
              }
            ];
            newSelectedItems = [...newSelectedItems, id];
          }
        }
      } else {
        newSelectedItems = [...newSelectedItems, id];
      }
    }

    this.selectedItemsChange.emit(newSelectedItems);
  }
}
