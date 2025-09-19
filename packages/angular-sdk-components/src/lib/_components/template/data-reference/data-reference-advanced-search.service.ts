import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataReferenceAdvancedSearchService {
  private configSubject = new BehaviorSubject(null);
  config$ = this.configSubject.asObservable();

  setConfig(config) {
    this.configSubject.next(config);
  }

  getConfig() {
    return this.configSubject.getValue();
  }
}
