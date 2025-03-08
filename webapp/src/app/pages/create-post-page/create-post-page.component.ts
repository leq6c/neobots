import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-create-post-page',
  imports: [NavbarComponent],
  templateUrl: './create-post-page.component.html',
  styleUrl: './create-post-page.component.scss',
})
export class CreatePostPageComponent {
  placeholder: string = 'Write to unleash your idea to Neobots.';
}
