import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-btn-create-bot',
  imports: [],
  templateUrl: './btn-create-bot.component.html',
  styleUrl: './btn-create-bot.component.scss',
})
export class BtnCreateBotComponent {
  constructor(private router: Router) {}

  goMint() {
    this.router.navigate(['/mint']);
  }
}
