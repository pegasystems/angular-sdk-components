import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appThousandSeparator]',
  standalone: true
})
export class ThousandSeparatorDirective {
  constructor(private _inputEl: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput() {
    if (this._inputEl.nativeElement.value === '-') return;
    const commasRemoved = this._inputEl.nativeElement.value.replace(/,/g, '');
    let toInt: number;
    let toLocale: string;
    if (commasRemoved.split('.').length > 1) {
      // eslint-disable-next-line no-restricted-globals
      const decimal = isNaN(parseInt(commasRemoved.split('.')[1], 10)) ? '' : parseInt(commasRemoved.split('.')[1], 10);
      toInt = parseInt(commasRemoved, 10);
      toLocale = `${toInt.toLocaleString('en-US')}.${decimal}`;
    } else {
      toInt = parseInt(commasRemoved, 10);
      toLocale = toInt.toLocaleString('en-US');
    }
    if (toLocale === 'NaN') {
      this._inputEl.nativeElement.value = '';
    } else {
      this._inputEl.nativeElement.value = toLocale;
    }
  }
}
