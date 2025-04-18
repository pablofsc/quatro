import { Component, Output, EventEmitter } from '@angular/core';

import { Screen } from 'src/app/services/screens.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  constructor() {}

  @Output() screenSelection = new EventEmitter<Screen>();

  startLocalGame() {
    this.screenSelection.emit('local_game');
  }

  openMultiplayerPage() {
    this.screenSelection.emit('online_setup');
  }
}
