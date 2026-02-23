import { Directive, input, inject, OnInit } from '@angular/core';
import { PConnectStore } from '../../_bridge/pconnect.store';

/**
 * Alternative Base Class using NGRX Signal Store
 * Demonstrates the "Signal Store" architecture pattern.
 */
@Directive({
  standalone: true,
  providers: [PConnectStore] // Provide store at component level
})
export class FieldBaseStore implements OnInit {
  // Input: The PConnect object
  pConn$ = input.required<any>();

  // Legacy support
  formGroup$ = input<any>(undefined);

  // Inject the Store (Local instance for this component)
  // This store encapsulates all Redux logic.
  protected store = inject(PConnectStore);

  // Expose signals from the store for the template
  // No need to manually create computed() here if the store already provides them,
  // but we can re-export them for cleaner template access if desired.
  props = this.store.props;
  label = this.store.label;
  value = this.store.value;
  visibility = this.store.visibility;
  required = this.store.required;
  readOnly = this.store.readOnly;
  disabled = this.store.disabled;
  helperText = this.store.helperText;
  testId = this.store.testId;

  constructor() {
    // Determine if we need additional props (override in subclass if needed)
    const additionalProps = this.getAdditionalProps();

    // Connect the store to the inputs
    // This sets up the Redux subscription and the pConn watcher.
    // Must be called in constructor for injection context (for effect and DestroyRef).
    this.store.connect(this.pConn$, additionalProps);
  }

  ngOnInit() {
    // Initialization handled in constructor via store.connect()
  }

  protected getAdditionalProps(): any {
    return {};
  }
}
