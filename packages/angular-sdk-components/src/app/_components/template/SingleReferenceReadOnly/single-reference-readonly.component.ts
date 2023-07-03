import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SemanticLinkComponent } from '../../field/SemanticLink/semantic-link.component';

@Component({
  selector: 'app-single-reference-readonly',
  templateUrl: './single-reference-readonly.component.html',
  styleUrls: ['./single-reference-readonly.component.scss'],
  standalone: true,
  imports: [SemanticLinkComponent]
})
export class SingleReferenceReadonlyComponent implements OnInit {
  @Input() pConn$: any;
  @Input() formGroup$: FormGroup;

  ngOnInit(): void {}
}
