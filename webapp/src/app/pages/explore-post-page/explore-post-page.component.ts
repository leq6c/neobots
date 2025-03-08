import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-explore-post-page',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './explore-post-page.component.html',
  styleUrl: './explore-post-page.component.scss',
})
export class ExplorePostPageComponent {}
