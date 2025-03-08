import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BtnCreateBotComponent } from './btn-create-bot/btn-create-bot.component';
import { RingComponent } from '../../shared/components/ring/ring.component';
import { BarComponent } from '../../shared/components/bar/bar.component';

@Component({
  selector: 'app-bots-page',
  imports: [
    NavbarComponent,
    BtnCreateBotComponent,
    RingComponent,
    BarComponent,
  ],
  templateUrl: './bots-page.component.html',
  styleUrl: './bots-page.component.scss',
})
export class BotsPageComponent {}
