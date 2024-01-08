import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { MatFormFieldModule } from '@angular/material/form-field';

declare let tinymce: any;

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  standalone: true,
  imports: [CommonModule, EditorModule, MatFormFieldModule, ReactiveFormsModule],
  providers: [{ provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }]
})
export class RichTextEditorComponent implements OnInit {
  @Input() placeholder;
  @Input() disabled;
  @Input() readonly;
  @Input() value;
  @Input() label;
  @Input() required;
  @Input() info;
  @Input() error;
  @Input() testId;
  
  @Output() onBlur: EventEmitter<any> = new EventEmitter();
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  richText = new FormControl();

  ngOnInit(): void {}

  ngOnChanges() {
    if (this.required) {
      this.richText.addValidators(Validators.required);
    }
  }

  filePickerCallback = (cb) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.addEventListener('change', (e: any) => {
      const file = e.target.files[0];

      const reader: any = new FileReader();
      reader.addEventListener('load', () => {
        /*
            Note: Now we need to register the blob in TinyMCEs image blob
            registry. In the next release this part hopefully won't be
            necessary, as we are looking to handle it internally.
        */
        const blobId = `blobid${new Date().getTime()}`;
        console.log('editorRef', tinymce.activeEditor);
        const blobCache = tinymce.activeEditor.editorUpload.blobCache;
        const base64 = reader.result.split(',')[1];
        const blobInfo = blobCache.create(blobId, file, base64);
        blobCache.add(blobInfo);

        /* call the callback and populate the Title field with the file name */
        cb(blobInfo.blobUri(), { title: file.name });
      });
      reader.readAsDataURL(file);
    });

    input.click();
  };

  blur(event) {
    this.onBlur.emit(event);
  }

  change(event) {
    this.onChange.emit(event);
  }
}
