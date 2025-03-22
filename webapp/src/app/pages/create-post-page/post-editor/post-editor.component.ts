import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TextareaAutoGrowDirective } from '../../../shared/directives/textarea-auto-grow.directive';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TextareaAutoGrowDirective],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.scss',
})
export class PostEditorComponent {
  @Input() placeholder: string = 'Write to unleash your idea to Neobots.';
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() posted: boolean = false;
  @Input() posting: boolean = false;
  @Input() voting: boolean = false;
  @Input() votingTitle: string = '';
  @Input() votingOptions: string = '';
  @Output() contentChange = new EventEmitter<string>();
  @Output() postClicked = new EventEmitter<void>();
  @Output() titleChange = new EventEmitter<string>();
  @Output() votingChange = new EventEmitter<boolean>();
  @Output() votingTitleChange = new EventEmitter<string>();
  @Output() votingOptionsChange = new EventEmitter<string>();

  @Input() hasNft: boolean = false;

  constructor(private router: Router) {}

  onVotingTitleChange(value: string) {
    this.votingTitle = value;
    this.votingTitleChange.emit(value);
  }

  onVotingOptionsChange(value: string) {
    this.votingOptions = value;
    this.votingOptionsChange.emit(value);
  }

  onVotingChange(value: boolean) {
    this.voting = value;
    this.votingChange.emit(value);
  }

  onTitleChange(value: string) {
    this.title = value;
    this.titleChange.emit(value);
  }

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
