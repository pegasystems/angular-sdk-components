import { Injectable } from '@angular/core';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IdleDetectionService {
  private activityEvents$ = merge(fromEvent(document, 'mousemove'), fromEvent(document, 'keydown'), fromEvent(document, 'click'));

  private idleSubscription!: Subscription;

  startWatching(idleCallback: () => void, idleTimeout: number = 10000) {
    this.idleSubscription = this.activityEvents$.pipe(switchMap(() => timer(idleTimeout).pipe(tap(() => idleCallback())))).subscribe();
  }

  stopWatching() {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }
  }
}
