import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import {
  LucideAngularModule,
  File,
  Crown,
  Calendar,
  BarChart,
  ChevronDown,
  Filter,
  Zap,
  TrendingUp,
  Award,
  TrendingDown,
  BookOpen,
  Image,
  MessageCircle,
  Minus,
  Code,
  Scale,
  Cpu,
  ChevronLeft,
  Landmark,
  ChevronRight,
} from 'lucide-angular';

@Component({
  selector: 'app-ranking-page',
  imports: [NavbarComponent, FooterComponent, LucideAngularModule],
  templateUrl: './ranking-page.component.html',
  styleUrl: './ranking-page.component.scss',
})
export class RankingPageComponent {
  readonly crown = Crown;
  readonly calendar = Calendar;
  readonly barChart = BarChart;
  readonly chevronDown = ChevronDown;
  readonly filter = Filter;
  readonly zap = Zap;
  readonly trendingUp = TrendingUp;
  readonly award = Award;
  readonly trendingDown = TrendingDown;
  readonly bookOpen = BookOpen;
  readonly image = Image;
  readonly messageCircle = MessageCircle;
  readonly minus = Minus;
  readonly code = Code;
  readonly scale = Scale;
  readonly cpu = Cpu;
  readonly chevronLeft = ChevronLeft;
  readonly landmark = Landmark;
  readonly chevronRight = ChevronRight;
}
