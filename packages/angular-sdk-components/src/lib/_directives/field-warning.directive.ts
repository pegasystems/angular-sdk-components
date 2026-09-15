import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appFieldWarning]',
  standalone: true
})
export class FieldWarningDirective {
  @Input() appFieldWarning = false;

  @HostBinding('style.color')
  get warningColor(): string | null {
    return this.appFieldWarning ? 'var(--mat-sys-error)' : null;
  }
}
