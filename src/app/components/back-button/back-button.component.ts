import { Component } from '@angular/core';
import { ScreensService } from 'src/app/services/screens.service';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent {
  constructor(
    private readonly screens: ScreensService
  ) {}

  goBack() {
    this.screens.current = 'menu';
  }
}
