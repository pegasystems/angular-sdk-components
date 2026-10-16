import { Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

// Published by core around refresh DX API calls; not exposed via PCore.getConstants()
const REFRESH_EVENTS = { start: 'onRefreshStart', complete: 'onRefreshComplete', error: 'onRefreshError' };
const SUBSCRIBER_ID = 'pegaRefreshIndicatorService';
const PCORE_READY_EVENT = 'SdkConstellationReady';

/**
 * Tracks in-flight Pega refresh requests. Call connect() once (e.g. from a root component) and read isRefreshing.
 */
@Injectable({ providedIn: 'root' })
export class PegaRefreshIndicatorService {
  // Keyed by context: core cancels a superseded refresh without publishing complete/error
  private readonly refreshingContexts = signal<ReadonlySet<string>>(new Set());
  private consumers = 0;
  private subscribed = false;

  readonly isRefreshing = computed(() => this.refreshingContexts().size > 0);
  readonly isRefreshing$ = toObservable(this.isRefreshing);

  connect(): void {
    this.consumers += 1;
    if (this.consumers > 1) return;

    // PCore is typed as always present, but it only exists after the Constellation bootstrap loads
    if ('PCore' in window && window.PCore) {
      this.subscribe();
    } else {
      document.addEventListener(PCORE_READY_EVENT, this.onPCoreReady, { once: true });
    }
  }

  disconnect(): void {
    if (this.consumers === 0) return;
    this.consumers -= 1;
    if (this.consumers > 0) return;

    document.removeEventListener(PCORE_READY_EVENT, this.onPCoreReady);

    if (this.subscribed) {
      const pubSub = PCore.getPubSubUtils();
      Object.values(REFRESH_EVENTS).forEach(event => pubSub.unsubscribe(event, SUBSCRIBER_ID));
      this.subscribed = false;
    }
    this.refreshingContexts.set(new Set());
  }

  private readonly onPCoreReady = () => {
    if (this.consumers > 0) this.subscribe();
  };

  private subscribe(): void {
    if (this.subscribed) return;
    this.subscribed = true;

    const pubSub = PCore.getPubSubUtils();
    pubSub.subscribe(REFRESH_EVENTS.start, payload => this.track(payload?.context, true), SUBSCRIBER_ID);
    pubSub.subscribe(REFRESH_EVENTS.complete, payload => this.track(payload?.context, false), SUBSCRIBER_ID);
    pubSub.subscribe(REFRESH_EVENTS.error, payload => this.track(payload?.context, false), SUBSCRIBER_ID);
  }

  private track(context: string | undefined, active: boolean): void {
    this.refreshingContexts.update(contexts => {
      const next = new Set(contexts);
      if (active) next.add(context ?? '');
      else next.delete(context ?? '');
      return next;
    });
  }
}
