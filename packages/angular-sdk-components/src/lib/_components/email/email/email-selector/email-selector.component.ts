/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, AfterViewInit, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
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
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { RichTextEditorComponent } from '../../../designSystemExtension/rich-text-editor/rich-text-editor.component';
import { take, takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

interface EmailParticipant {
  EmailAddress: string;
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
    FormsModule,
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
    NgxMatSelectSearchModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailSelectorComponent),
      multi: true
    }
  ],
  styleUrls: ['./email-selector.component.scss']
})
export class EmailSelectorComponent implements OnChanges, AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input() participants: any = [];

  @Input() selectedItems: any = [];
  @Input() label = '';
  @Input() mode: any;
  @Input() required = false;
  @Input() externalValidator: any;
  @Input() status?: string;
  @Input() info?: string;
  @Input() compose: any;
  @Output() selectedItemsChange = new EventEmitter<string[]>();

  public filteredEmailsMulti: ReplaySubject<any> = new ReplaySubject<any>(1);

  protected _onDestroy = new Subject<void>();

  filterValue = '';
  emailParticipants: any[] = [];
  emailsToRender: any[] = [];
  validEmail = false;

  public emailMultiCtrl: FormControl<any> = new FormControl<any>([]);

  public emailMultiFilterCtrl: FormControl<string | null> = new FormControl<string | null>('');

  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  handleClick() {
    const val = this.emailMultiFilterCtrl.value;
    this.emailMultiCtrl.setValue([...this.emailMultiCtrl.value, val]);
    this.emailParticipants.push({ EmailAddress: val });
    this.filteredEmailsMulti.next(this.emailParticipants.slice());
  }

  private onChange = (value: any) => {};
  private onTouched = () => {};

  // ControlValueAccessor method: Write a new value to the DOM
  writeValue(value: number): void {
    console.log('writeValue');
    this.emailMultiCtrl.setValue(value);
    // if (value !== undefined && value !== null) {
    //   this.selectedItems = value;
    // }
  }

  // ControlValueAccessor method: Registers the onChange function
  registerOnChange(fn: (value: any) => void): void {
    console.log('registerOnChange');
    this.onChange = fn;
  }

  // ControlValueAccessor method: Registers the onTouched function
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  filterEmailsMulti() {
    if (!this.emailParticipants) {
      return;
    }
    // get the search keyword
    let search = this.emailMultiFilterCtrl.value;
    if (!search) {
      this.filteredEmailsMulti.next(this.emailParticipants.slice());
      return;
    }
    search = search.toLowerCase();
    this.filterValue = search;

    if (this.externalValidator?.(this.filterValue)) {
      this.validEmail = true;
    } else {
      this.validEmail = false;
    }

    // filter the emails
    this.filteredEmailsMulti.next(this.emailParticipants.filter(bank => bank.EmailAddress.toLowerCase().indexOf(search) > -1));
  }

  protected setInitialValue() {
    this.filteredEmailsMulti.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
      // setting the compareWith property to a comparison function
      // triggers initializing the selection according to the initial value of
      // the form control
      // this needs to be done after the filteredEmailsMulti are loaded initially
      // and after the mat-option elements are available
      this.multiSelect.compareWith = (a: EmailParticipant, b: EmailParticipant) => {
        return a && b && a === b;
      };
    });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnInit() {
    console.log('ngOnInit in selector');
    console.log(this.participants);
    console.log(this.selectedItems);

    this.emailMultiFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterEmailsMulti();
    });

    this.emailMultiCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(value => {
      console.log('Value changed:', value);
      console.log('emailMultiCtrl:', this.emailMultiCtrl);
      this.onChange(this.emailMultiCtrl.value);
      // this.selectedItemsChange.emit(this.emailMultiCtrl.value);
      // Perform actions based on the new value
    });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges in selector');
    if (changes['participants']?.currentValue?.length !== changes['participants']?.previousValue?.length) {
      this.emailParticipants = [...changes['participants'].currentValue];
    } else {
      let isChanged = false;
      changes['participants']?.currentValue.forEach((participant: any) => {
        if (!changes['participants']?.previousValue.find((email: any) => email.EmailAddress === participant.EmailAddress)) {
          isChanged = true;
        }
      });
      if (isChanged) {
        this.emailParticipants = [...changes['participants'].currentValue];
      }
    }

    if (changes['selectedItems']?.currentValue?.length !== changes['selectedItems']?.previousValue?.length) {
      this.emailMultiCtrl.setValue(changes['selectedItems'].currentValue);
    } else {
      let isChanged = false;
      changes['selectedItems']?.currentValue.forEach((selectedItem: any) => {
        if (!changes['selectedItems']?.previousValue.find((email: any) => email === selectedItem)) {
          isChanged = true;
        }
      });
      if (isChanged) {
        this.emailMultiCtrl.setValue(changes['selectedItems'].currentValue);
      }
    }
    // this.emailParticipants = [...this.participants];

    // this.emailMultiCtrl.setValue(this.selectedItems);

    this.filteredEmailsMulti.next(this.emailParticipants.slice());
    this.updateEmailsToRender();

    if (changes['emailParticipants']) {
      this.updateEmailsToRender();
    }
    // need to re render
  }

  onFilterChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterValue = input.value;
    this.updateEmailsToRender();
  }

  onFilterBlur() {
    this.filterValue = '';
  }

  /* To be implemented later  */
  updateEmailsToRender() {}

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
