import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [CommonModule, IconComponent, ButtonComponent],
})
export class HeaderComponent {}
