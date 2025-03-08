import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BtnCreateBotComponent } from '../bots-page/btn-create-bot/btn-create-bot.component';

@Component({
  selector: 'app-mint-bots-page',
  imports: [NavbarComponent, BtnCreateBotComponent],
  templateUrl: './mint-bots-page.component.html',
  styleUrl: './mint-bots-page.component.scss',
})
export class MintBotsPageComponent {
  mint() {
    alert('mint');
  }
}
