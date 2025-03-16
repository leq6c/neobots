import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  imports: [FooterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  goBots() {
    this.router.navigate(['/bots']);
  }
}
