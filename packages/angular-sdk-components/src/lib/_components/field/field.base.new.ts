import { Directive, input, inject, OnInit, computed } from '@angular/core';
import { AngularPConnectService } from '../../_bridge/angular-pconnect.new';

@Directive()
export class FieldBase implements OnInit {
  // Input: The PConnect bridge object
  // Renamed to pConn$ to match what ComponentMapper legacy code passes
  pConn$ = input.required<any>();

  // Legacy support: ComponentMapper tries to pass formGroup$ to all inputs.
  // We accept it to silence errors, even if zoneless doesn't use it.
  formGroup$ = input<any>(undefined);

  protected bridge = inject(AngularPConnectService);

  // The main signal holding all props (label, value, visibility, etc.)
  // We initialize it as a WritableSignal first, or make it reactive to pConn$.
  // Ideally, the Service should accept the Signal<any> and manage the subscription internally,
  // returning a Signal<any> that updates based on store + pConn$.
  props = this.bridge.createPropsSignal(this.pConn$);

  // Computed helper signals for cleaner templates
  // Now props is fully initialized before computed are created.
  label = computed(() => this.props()?.label);
  value = computed(() => this.props()?.value);
  visibility = computed(() => this.props()?.visibility !== false);

  ngOnInit() {
    // Initialization moved to property declaration above.
  }

  // Actions can still be imperative
  onChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.pConn$().getActionsApi().changeHandler(this.pConn$(), { value });
  }
}
