import {
  Component,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
  NgZone,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

// Import the new Gallery Grid Component
import { GalleryGridComponent } from '../gallery-grid/gallery-grid.component';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() data: any[] = [];

  @ViewChildren('cardItem') cardItems!: QueryList<ElementRef>;

  // This finds the specific scroll div in your HTML
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  imagePool = [
    'https://picsum.photos/id/101/800/600',
    'https://picsum.photos/id/102/800/600',
    'https://picsum.photos/id/103/800/600',
    'https://picsum.photos/id/104/800/600',
    'https://picsum.photos/id/106/800/600',
    'https://picsum.photos/id/102/800/600',
    'https://picsum.photos/id/103/800/600',
    'https://picsum.photos/id/104/800/600'
  ];

  originalItems: any[] = [];
  displayItems: any[] = [];

  constructor(private ngZone: NgZone) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.buildCarouselItems();
    }
  }

  buildCarouselItems() {
    this.originalItems = this.data.map((item, index) => {
      return {
        title: item.Carouselheading || item.Description || 'Untitled',
        img: item.ImageURL
        // img: this.imagePool[index % this.imagePool.length],
        // ...item
      };
    });
    // Create 4x copies for the infinite scroll effect
    this.displayItems = [...this.originalItems, ...this.originalItems, ...this.originalItems, ...this.originalItems];
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      const container = this.scrollContainer?.nativeElement;

      // DEBUGGING LOGS
      console.log('--- CAROUSEL DEBUG ---');
      console.log('Container Element:', container);

      if (container) {
        console.log('Container Width:', container.offsetWidth);
        console.log('Container ScrollWidth:', container.scrollWidth);

        container.addEventListener('scroll', this.onScroll.bind(this));

        // Trigger initial animation
        this.onScroll({ target: container } as any);

        setTimeout(() => {
          container.scrollLeft = 600;
        }, 0);
      } else {
        console.error('CRITICAL ERROR: Scroll Container not found! Check #scrollContainer in HTML.');
      }
    });
  }

  ngOnDestroy() {
    const container = this.scrollContainer?.nativeElement;
    if (container) {
      container.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onScroll(event: Event) {
    const container = event.target as HTMLElement;
    if (!container) return;

    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();

      // Safety check: if component is hidden/collapsed
      if (containerRect.width === 0) return;

      const containerCenter = containerRect.width / 2;

      this.cardItems.forEach(item => {
        const el = item.nativeElement;
        const rect = el.getBoundingClientRect();

        // Calculate center relative to the scroll container
        const cardCenter = rect.left - containerRect.left + rect.width / 2;

        const distance = Math.abs(containerCenter - cardCenter);

        const activeZone = 400;
        const minWidth = 200;
        const maxWidth = 500;

        let currentWidth = minWidth;
        let opacity = 0.7;

        if (distance < activeZone) {
          const factor = 1 - distance / activeZone;
          currentWidth = minWidth + (maxWidth - minWidth) * factor;
          opacity = 0.7 + 0.3 * factor;
        }

        el.style.flexBasis = `${currentWidth}px`;
        el.style.minWidth = `${currentWidth}px`;
        el.style.opacity = `${opacity}`;
      });
    });
  }
}
