import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetLoginStatusService {
  private subject = new Subject<void|object>();

  sendMessage(sLoginStatus: string) {
    this.subject.next({ loginStatus: sLoginStatus });
  }

  clearMessage() {
    this.subject.next();
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
