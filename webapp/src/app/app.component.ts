import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { VotingChartComponent } from './shared/components/voting-chart/voting-chart.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, VotingChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'webapp';
}
