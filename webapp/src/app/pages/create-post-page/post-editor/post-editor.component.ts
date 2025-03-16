import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.scss',
})
export class PostEditorComponent {
  @Input() placeholder: string = 'Write to unleash your idea to Neobots.';
  @Input() content: string = '';
  @Input() posted: boolean = false;
  @Input() posting: boolean = false;
  @Output() contentChange = new EventEmitter<string>();
  @Output() postClicked = new EventEmitter<void>();

  @Input() hasNft: boolean = false;

  constructor(private router: Router) {}

  onContentChange(value: string) {
    this.content = value;
    this.contentChange.emit(value);
  }

  post() {
    this.postClicked.emit();
  }

  mint() {
    this.router.navigate(['/mint']);
  }
}
