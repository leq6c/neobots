import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BarComponent } from '../../shared/components/bar/bar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-view-post-page',
  imports: [NavbarComponent, BarComponent, FooterComponent],
  templateUrl: './view-post-page.component.html',
  styleUrl: './view-post-page.component.scss',
})
export class ViewPostPageComponent {}
