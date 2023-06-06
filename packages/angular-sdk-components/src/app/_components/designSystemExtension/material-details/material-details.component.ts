import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Utils } from '../../../_helpers/utils';
import { ViewComponent } from '../../infra/view/view.component';

@Component({
  selector: 'app-material-details',
  templateUrl: './material-details.component.html',
  styleUrls: ['./material-details.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ViewComponent)]
})
export class MaterialDetailsComponent implements OnInit {
  constructor(private utils: Utils) {}

  @Input() arFields$: Array<any>;
  @Input() arFields2$: Array<any>;
  @Input() arFields3$: Array<any>;

  ngOnInit(): void {}

  _getValue(configValue) {
    if (configValue && configValue != '') {
      return configValue;
    } else {
      return '---';
    }
  }

  _formatDate(dateValue: string, dateFormat: string): string {
    return this.utils.generateDate(dateValue, dateFormat);
  }
}
