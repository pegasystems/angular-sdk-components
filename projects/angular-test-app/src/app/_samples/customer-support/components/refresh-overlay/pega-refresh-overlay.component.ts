import { Component, OnDestroy, OnInit, effect, inject, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PegaRefreshIndicatorService } from '../../services/pega-refresh-indicator.service';

const BLOCKED_EVENTS = ['keydown', 'keypress', 'keyup', 'beforeinput', 'paste', 'cut', 'drop'];

/**
 * Full-page overlay that blocks pointer and keyboard input while a Pega refresh request is in flight.
 * Usage: place <pega-refresh-overlay /> once near the root of the app.
 */
@Component({
  selector: 'pega-refresh-overlay',
  templateUrl: './pega-refresh-overlay.component.html',
  styleUrls: ['./pega-refresh-overlay.component.scss'],
  imports: [MatProgressSpinnerModule]
})
export class PegaRefreshOverlayComponent implements OnInit, OnDestroy {
  private readonly refreshIndicator = inject(PegaRefreshIndicatorService);

  readonly label = input('Updating…');
  readonly isRefreshing = this.refreshIndicator.isRefreshing;

  constructor() {
    // The overlay stops pointer input; keyboard input still reaches a focused field unless swallowed here
    effect(onCleanup => {
      if (!this.isRefreshing()) return;

      const block = (event: Event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      };
      BLOCKED_EVENTS.forEach(type => window.addEventListener(type, block, true));
      onCleanup(() => BLOCKED_EVENTS.forEach(type => window.removeEventListener(type, block, true)));
    });
  }

  ngOnInit(): void {
    this.refreshIndicator.connect();
  }

  ngOnDestroy(): void {
    this.refreshIndicator.disconnect();
  }
}
