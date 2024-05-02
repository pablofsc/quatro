import { Component, EventEmitter, Output } from '@angular/core';
import { OnlineGameService } from 'src/app/services/game-online.service';
import { Screen } from 'src/app/services/screens.service';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss', '../menu/menu.component.scss']
})
export class MultiplayerComponent {
  constructor(
    private readonly onlineGameService: OnlineGameService
  ) {}

  @Output() userSelection = new EventEmitter<Screen>();

  public selected: 'JOIN' | 'CREATE' = 'JOIN';

  public inputValue: string = '';

  public backToMenu() {
    this.userSelection.emit('menu');
  }

  public joinSession() {
    this.onlineGameService.joinSession('aaaa');
  }

  public createSession() {
    this.onlineGameService.createSession();
  }
}
