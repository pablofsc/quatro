import { Component, Output, EventEmitter } from '@angular/core';
import { Screen } from 'src/app/services/screens.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  constructor() {}

  @Output() userSelection = new EventEmitter<Screen>();

  startGame() {
    this.userSelection.emit('game');
  }
}
