import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessagesService {
  private subject = new Subject<void | object>();

  /**
   *
   * @param sAction - show, dismiss
   * @param sActionMessage - text to displayed, will be queued with others until dismiss
   */
  sendMessage(sAction: string, sActionMessage: string) {
    this.subject.next({ action: sAction, actionMessage: sActionMessage });
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<void | object> {
    return this.subject.asObservable();
  }
}
