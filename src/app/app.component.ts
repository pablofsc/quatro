import { Component } from '@angular/core';
import { Screen, ScreensService } from 'src/app/services/screens.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(
    public readonly screens: ScreensService,
  ) {}

  changeState(newScreen: Screen) {
    this.screens.current = newScreen;
  }
}
