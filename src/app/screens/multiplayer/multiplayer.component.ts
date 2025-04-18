import { Component, EventEmitter, Output } from '@angular/core';

import { OnlineGameService } from 'src/app/services/game-online.service';
import { Screen, ScreensService } from 'src/app/services/screens.service';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent {
  constructor(
    public readonly onlineGameService: OnlineGameService,
    private readonly screens: ScreensService
  ) {}

  @Output() screenSelection = new EventEmitter<Screen>();

  public inputValue: string = '';
  public outputValue: string = '';

  public joining: boolean = false;
  public creating: boolean = false;

  public waitingForFriend: boolean = false;

  public backToMenu() {
    this.screenSelection.emit('menu');
  }

  public async joinSession() {
    if (this.inputValue.length !== 4) {
      return;
    }

    this.joining = true;

    try {
      await this.onlineGameService.joinSession(this.inputValue);
    }
    catch (reason) {
      if (reason === 'SESSION_NOT_FOUND') {
        alert('Session not found!');
      }
      else if (reason === 'SESSION_BUSY') {
        alert('This session has already started!');
      }
      else if (reason === 'ALREADY_JOINED') {
        alert(`You are already in this session! You're supposed to send this code to someone else.`);
      }
      else {
        alert('Unexpected error! Please try again later.');
      }

      this.joining = false;

      return;
    }

    console.log("Waiting for session start...");

    await this.onlineGameService.waitForStart();

    this.screenSelection.emit("online_game");

    this.joining = false;

    this.onlineGameService.listenToChanges();

    await this.onlineGameService.listenToFinish();

    this.screens.current = 'menu';
  }

  public async createSession() {
    this.creating = true;

    let result;

    try {
      result = await this.onlineGameService.createSession();
    }
    catch (error) {
      alert('Cannot reach backend. Please try again later.');

      this.creating = false;

      return;
    }

    this.outputValue = result.session;

    this.creating = false;
    this.waitingForFriend = true;

    console.log("Waiting for other player to join...");

    await this.onlineGameService.waitForStart();

    this.waitingForFriend = false;

    this.screenSelection.emit("online_game");

    console.log('Player joined!');

    this.onlineGameService.listenToChanges();

    await this.onlineGameService.listenToFinish();

    this.screens.current = 'menu';
  }
}
