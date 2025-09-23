import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private loadingPromise?: Promise<void>;

  load(apiKey: string): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return Promise.resolve();
    }
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = error => reject(error);

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }
}
