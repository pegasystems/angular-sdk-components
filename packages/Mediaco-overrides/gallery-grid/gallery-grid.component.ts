import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ServiceCardComponent } from './service-card/service-card.component';

@Component({
  selector: 'app-gallery-grid',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, ServiceCardComponent],
  templateUrl: './gallery-grid-component.html',
  styleUrls: ['./gallery-grid-component.scss']
})
export class GalleryGridComponent {
  trackByTitle = (_: number, item: { title: string }) => item.title;

  // Inject the data passed from the parent Carousel component
  constructor(
    public dialogRef: MatDialogRef<GalleryGridComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: any[]; dataPage: string }
  ) {}

  close() {
    this.dialogRef.close();
  }
}
