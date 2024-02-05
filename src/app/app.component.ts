import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Screen, ScreensService } from 'src/app/services/screens.service';

export const fadeInOutAnimation = trigger('fadeInOutAnimation', [
  transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 })),]),
  transition(':leave', [animate('300ms', style({ opacity: 0 })),]),
]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [fadeInOutAnimation],
})
export class AppComponent {
  constructor(
    public readonly screens: ScreensService,
  ) {}

  changeState(newScreen: Screen) {
    this.screens.current = newScreen;
  }
}
