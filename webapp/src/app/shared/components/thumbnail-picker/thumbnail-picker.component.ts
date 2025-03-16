import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-thumbnail-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './thumbnail-picker.component.html',
  styleUrl: './thumbnail-picker.component.scss',
})
export class ThumbnailPickerComponent {
  refreshCw = RefreshCw;
  @Input() imageUrl: string = '';
  @Input() altText: string = 'Thumbnail image';
  @Output() imageSelected = new EventEmitter<File>();

  /**
   * Triggers the file input click event
   */
  openFileSelector(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => this.onFileSelected(event);
    fileInput.click();
  }

  /**
   * Handles the file selection event
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imageSelected.emit(file);
    }
  }
}
