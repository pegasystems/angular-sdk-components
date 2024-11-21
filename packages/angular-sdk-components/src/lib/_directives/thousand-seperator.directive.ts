import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appThousandSeparator]',
  standalone: true
})
export class ThousandSeparatorDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event) {
    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value.replace(/,/g, ''); // Remove existing commas
    if (event?.data !== '.') {
      value = Number(value).toLocaleString(); // Add thousands separator
      input.value = value;
    }
  }
}
