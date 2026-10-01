import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
// import { Button } from '@angular/material'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wss-quick-create',
  templateUrl: './wss-quick-create.component.html',
  styleUrls: ['./wss-quick-create.component.scss'],
  imports: []
})
export class WssQuickCreateComponent {
  @Input() actions$: any;
  @Input() heading$: any;
}
