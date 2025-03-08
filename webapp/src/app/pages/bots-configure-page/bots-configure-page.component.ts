import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { RingComponent } from '../../shared/components/ring/ring.component';
import { BarComponent } from '../../shared/components/bar/bar.component';

@Component({
  selector: 'app-bots-configure-page',
  imports: [NavbarComponent],
  templateUrl: './bots-configure-page.component.html',
  styleUrl: './bots-configure-page.component.scss',
})
export class BotsConfigurePageComponent {
  placeholder: string =
    'Write to unleash your idea to the Neobots."Think like a physicial!""Imitate celeblity!" "Imitate x.com/aaa!"';
}
