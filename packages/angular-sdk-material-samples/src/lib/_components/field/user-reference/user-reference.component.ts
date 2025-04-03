import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ComponentMapperComponent, UserReferenceBase } from '@pega/angular-sdk-components';

@Component({
  selector: 'app-user-reference',
  templateUrl: './user-reference.component.html',
  styleUrls: ['./user-reference.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatAutocompleteModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class UserReferenceComponent extends UserReferenceBase {}
