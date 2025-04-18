import { Component } from '@angular/core';
import { Screen, ScreensService } from 'src/app/services/screens.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(
    public readonly screens: ScreensService,
  ) {
    console.log('Backend url is set to', environment.BACKEND_URL);
  }

  changeState(newScreen: Screen) {
    this.screens.current = newScreen;
  }
}
