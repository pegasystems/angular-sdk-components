import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class RichTextEditorComponent implements OnChanges, AfterViewInit, OnDestroy {
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

  @ViewChild('editorEl') editorEl!: ElementRef<HTMLDivElement>;

  richText = new FormControl('');
  editor?: Editor;
  currentBlock: BlockType = 'paragraph';

  private viewInitialized = false;

  constructor(
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.required) {
      this.richText.addValidators(Validators.required);
    }

    if (this.disabled) {
      this.richText.disable();
    } else {
      this.richText.enable();
    }

    if (this.value !== undefined && this.value !== null) {
      this.richText.setValue(this.value, { emitEvent: false });
    }

    if (this.viewInitialized && this.editor) {
      if (changes['value'] && this.value !== undefined && this.value !== this.editor.getHTML()) {
        this.editor.commands.setContent(this.value || '', false);
      }
      if (changes['disabled']) {
        this.editor.setEditable(!this.disabled);
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.readonly) {
      this.viewInitialized = true;
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.editor = new Editor({
        element: this.editorEl.nativeElement,
        extensions: [
          StarterKit,
          Placeholder.configure({ placeholder: this.placeholder || '' }),
          Image.configure({ inline: false, allowBase64: true }),
          Link.configure({ openOnClick: false, autolink: true })
        ],
        content: this.value || '',
        editable: !this.disabled,
        onUpdate: ({ editor }) => {
          const html = editor.getHTML();
          this.zone.run(() => {
            this.richText.setValue(html, { emitEvent: false });
            this.onChange.emit(html);
          });
        },
        onBlur: ({ editor }) => {
          this.zone.run(() => this.onBlur.emit(editor.getHTML()));
        },
        onSelectionUpdate: ({ editor }) => {
          this.zone.run(() => {
            if (editor.isActive('heading', { level: 1 })) this.currentBlock = 'h1';
            else if (editor.isActive('heading', { level: 2 })) this.currentBlock = 'h2';
            else if (editor.isActive('heading', { level: 3 })) this.currentBlock = 'h3';
            else this.currentBlock = 'paragraph';
            this.cdr.markForCheck();
          });
        }
      });
      this.viewInitialized = true;
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  isActive(name: string, attrs?: Record<string, any>): boolean {
    return this.editor ? this.editor.isActive(name, attrs) : false;
  }

  setBlock(value: string) {
    if (!this.editor) return;
    const chain = this.editor.chain().focus();
    switch (value) {
      case 'h1':
        chain.toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        chain.toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        chain.toggleHeading({ level: 3 }).run();
        break;
      default:
        chain.setParagraph().run();
    }
    this.currentBlock = value as BlockType;
  }

  toggleBold() {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic() {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleStrike() {
    this.editor?.chain().focus().toggleStrike().run();
  }

  toggleBulletList() {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList() {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  outdent() {
    if (!this.editor) return;
    if (this.editor.can().liftListItem('listItem')) {
      this.editor.chain().focus().liftListItem('listItem').run();
    } else {
      this.editor.chain().focus().liftEmptyBlock().run();
    }
  }

  indent() {
    this.editor?.chain().focus().sinkListItem('listItem').run();
  }

  addLink() {
    if (!this.editor) return;
    const previous = this.editor.getAttributes('link')?.['href'] ?? '';
    const { from, to, empty } = this.editor.state.selection;
    const url = window.prompt('Enter URL', previous);
    if (url === null) return;
    if (url === '') {
      this.editor.chain().focus().setTextSelection({ from, to }).extendMarkRange('link').unsetLink().run();
      return;
    }
    if (empty) {
      this.editor
        .chain()
        .focus()
        .insertContentAt(from, {
          type: 'text',
          text: url,
          marks: [{ type: 'link', attrs: { href: url } }]
        })
        .run();
      return;
    }
    this.editor.chain().focus().setTextSelection({ from, to }).extendMarkRange('link').setLink({ href: url }).run();
  }

  addImage() {
    if (!this.editor) return;
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.addEventListener('change', (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const src = reader.result as string;
        this.editor?.chain().focus().setImage({ src, alt: file.name, title: file.name }).run();
      });
      reader.readAsDataURL(file);
    });

    input.click();
  }
}
