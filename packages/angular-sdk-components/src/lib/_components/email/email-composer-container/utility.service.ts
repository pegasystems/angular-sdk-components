/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  subscribeToUtilityCount(caseInsKey: string, callback: (widget: any) => void): Subscription {
    // Implement subscription logic here
    return new Subscription();
  }

  getWidgetsDetails(widgets: string[], caseInsKey: string): Promise<any> {
    // Implement API call logic here
    return Promise.resolve({ widgets: [] });
  }

  getUtilities(caseInsKey: string): Observable<any> {
    // Implement API call logic here
    return of({ utilities: [] });
  }

  handleExternalEntry(filterValue): boolean {
    const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const matched = filterValue.match(pattern);
    return !!matched?.input;
  }
}
