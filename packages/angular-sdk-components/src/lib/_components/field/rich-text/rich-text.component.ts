import { Component, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RichTextBase } from '../../base/field/rich-text/rich-text.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, forwardRef(() => ComponentMapperComponent)]
})
export class RichTextComponent extends RichTextBase {
  fieldOnChange(editorValue: any) {
    const newVal = editorValue?.editor?.getBody()?.innerHTML ?? '';

    this.onChange(newVal);
  }

  fieldOnBlur(editorValue: any) {
    this.onBlur(editorValue);
  }
}
