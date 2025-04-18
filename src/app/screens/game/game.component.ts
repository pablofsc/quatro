import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

import { GameClass, LocalGameService } from '../../services/game-local.service';
import { randomNumber } from 'src/utils';
import { Card } from 'src/app/services/deck.service';
import { AiService } from 'src/app/services/ai.service';
import { ScreensService } from 'src/app/services/screens.service';
import { OnlineGameService } from 'src/app/services/game-online.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.8s ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.8s ease', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class GameComponent implements OnInit, DoCheck {
  constructor(
    private readonly localGame: LocalGameService,
    private readonly onlineGame: OnlineGameService,
    private readonly ai: AiService,
    private readonly screens: ScreensService
  ) {
    this.game = this.localGame; // local game by default. will be overwritten in ngOnInit in case of online game
  }

  ngOnInit(): void {
    if (this.opponentType === 'ONLINE') {
      this.game = this.onlineGame;
    }

    this.start();
  }

  ngDoCheck(): void { // TODO: improve. terrible solution
    this.matchPositionalArrays();
    this.updatePlayableCards();
  }

  @Input({ required: true }) opponentType: 'AI' | 'ONLINE' | undefined;

  public game: GameClass;

  public gameReady = false;

  public userId = 'player1'; // TODO: Make these dynamic
  public opponentId = 'player2';

  public playedStackRotation: number[] = [0];
  public playedStackPosition: { x: number, y: number; }[] = [{ x: 0, y: 0 }];
  public wildCardSelected?: Card;
  public wildCardColorPromiseResolver?: (value: string) => void;

  public humanCanSkip = false;
  public playableCards: number[] = [];

  public lastMessage: string = '';
  public showMessage: boolean = false;
  public hideMessage: any; // timeout handle

  private async start() {
    await this.game.startGame(2);

    this.userId = this.game.getPlayerId();
    this.opponentId = this.game.getOpponentId();

    this.gameReady = true;

    console.log(`Game started. You are ${this.userId}, opponent is ${this.opponentId}`);

    await this.next();
  }

  public async next() {
    console.log('next!');
    this.resetPlayableCards();
    this.humanCanSkip = false;

    if (this.game.state.winner !== null) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.game.state.winner === this.userId) {
        console.log('You win!');
        alert('You win!');
      }
      else {
        console.log('You lose!');
        alert('You lose!');
      }

      this.screens.current = 'menu';

      return;
    }

    if (this.game.state.currentTurn.player === this.opponentId) {
      console.log('Opponent plays now.');

      if (this.opponentType === 'AI') {
        this.ai.play(this.opponentId, (pl, ci, wc) => this.play(pl, ci, wc));
        console.log('AWAITING AI');
        await this.game.state.currentTurn.playedPromise;
        this.matchPositionalArrays();
      }
      else {
        console.log('AWAITING ONLINE PLAYER');
        await this.game.state.currentTurn.playedPromise;
        this.matchPositionalArrays();
        console.log('ONLINE PLAYER PLAYED');
      }

      this.next();
    }
    else {
      console.log(`You play now.`, this.game.state.currentTurn.player, this.userId);

      this.updatePlayableCards();

      // TODO: this is to make sure the cards are updated if the other player played a draw card. not ideal, improve in the future
      setTimeout(() => this.updatePlayableCards(), 500); // for draw +2
      setTimeout(() => this.updatePlayableCards(), 1000); // for draw +4

      console.log('WAITING FOR INPUT');
      // Await for human player


    }
  }

  public async play(player: string, cardIndex: number, wildCardColor?: string) {
    const nextPlayer = await this.game.playCard(player, cardIndex, wildCardColor);

    this.matchPositionalArrays();

    return nextPlayer;
  }

  private matchPositionalArrays() {
    while (this.playedStackRotation?.length < this.game.state.playedStack?.length) {
      const randomAngle = randomNumber(-45, 45);
      this.playedStackRotation.push(randomAngle);

      const randomOffset = {
        x: randomNumber(-20, 20),
        y: randomNumber(-20, 20)
      };
      this.playedStackPosition.push(randomOffset);
    }
  }

  public selectedWildColor(value: string): void {
    if (value === undefined) {
      this.wildCardSelected = undefined;
      this.wildCardColorPromiseResolver = undefined;
    }

    if (!this.wildCardColorPromiseResolver) {
      throw new Error('No wild card color promise resolver');
    }
    else {
      this.wildCardColorPromiseResolver(value);
    }
  }

  public async clickedCard(cardIndex: number) {
    if (this.game.state.currentTurn.player !== this.userId) {
      this.displayMessage('Not your turn!');

      return;
    }

    let selectedColor: string | undefined;

    if (this.game.isWildCard(this.userId, cardIndex)) {
      this.wildCardSelected = this.game.getPlayerCardReference(this.userId, cardIndex);

      selectedColor = await new Promise<string>((resolve) => {
        this.wildCardColorPromiseResolver = resolve;
      });

      this.wildCardSelected = undefined;
    }

    try {
      await this.play(this.userId, cardIndex, selectedColor);
    }
    catch (e) {
      this.displayMessage('You cannot play this card!');

      return;
    }

    this.next();
  }

  public clickedDraw() {
    if (this.game.state.currentTurn.player !== this.userId || this.wildCardSelected) {
      this.displayMessage('You cannot draw a card now!');

      return;
    }

    this.game.drawCard(this.userId);

    this.humanCanSkip = true;

    this.resetPlayableCards();
    this.updatePlayableCards();

    this.displayMessage('You have drawn a card.');
  }

  public clickedSkip() {
    if (this.game.state.currentTurn.player !== this.userId) {
      this.displayMessage('Not your turn!');

      return;
    }

    if (this.wildCardSelected) {
      this.displayMessage('Select a color for the wild card.');

      return;
    }

    try {
      this.game.skipTurn(this.userId);
    }
    catch (e) {
      this.displayMessage('You need to draw before skipping.');
    }

    this.next();
  }

  public updatePlayableCards() {
    this.playableCards = this.game.getPlayableCards(this.userId);
  }

  public resetPlayableCards() {
    this.playableCards = [];
  }

  public quit() {
    this.game.finishGame();
  }

  public displayMessage(message: string) {
    this.lastMessage = message;
    this.showMessage = true;

    if (this.hideMessage) {
      clearTimeout(this.hideMessage);
    }

    this.hideMessage = setTimeout(() => {
      this.showMessage = false;
    }, 3000);
  }
}
