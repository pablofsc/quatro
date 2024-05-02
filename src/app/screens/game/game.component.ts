import { Component, Input } from '@angular/core';
import { LocalGameService } from '../../services/game-local.service';
import { randomNumber } from 'src/utils';
import { Card } from 'src/app/services/deck.service';
import { AiService } from 'src/app/services/ai.service';
import { ScreensService } from 'src/app/services/screens.service';
import { OnlineGameService } from 'src/app/services/game-online.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent {
  constructor(
    private readonly localGame: LocalGameService,
    private readonly onlineGame: OnlineGameService,
    private readonly ai: AiService,
    private readonly screens: ScreensService
  ) {
    if (!this.opponentType) {
      this.opponentType = 'AI';
    }

    if (this.opponentType === 'AI') {
      this.game = localGame;
    }
    else {
      this.game = onlineGame;
    }

    this.start();
  }

  @Input({ required: true }) opponentType: 'AI' | 'ONLINE' | undefined;

  private game;

  public gameReady = false;

  public userId = 'player1'; // TODO: Make these dynamic
  public opponentId = 'player2';

  public state: any;
  public playedStackRotation: number[] = [0];
  public playedStackPosition: { x: number, y: number; }[] = [{ x: 0, y: 0 }];
  public wildCardSelected?: Card;
  public wildCardColorPromiseResolver?: (value: string) => void;

  public humanCanSkip = false;
  public playableCards: number[] = [];

  private async start() {
    await this.game.startGame(2);
    await this.next();

    this.state = this.game.state;

    this.gameReady = true;
  }

  public async next() {
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
      this.ai.play(this.opponentId, (pl, ci, wc) => this.play(pl, ci, wc));
      await this.game.state.currentTurn.playedPromise;

      this.next();
    }
    else {
      this.updatePlayableCards();

      // TODO: this is to make sure the cards are updated if the other player played a draw card. not ideal, improve in the future
      setTimeout(() => this.updatePlayableCards(), 500); // for draw +2
      setTimeout(() => this.updatePlayableCards(), 1000); // for draw +4

      console.log('Waiting for input');
      // Await for human player
    }
  }

  public play(player: string, cardIndex: number, wildCardColor?: string) {
    const nextPlayer = this.game.playCard(player, cardIndex, wildCardColor); // TODO: Make this dynamic

    const randomAngle = randomNumber(-45, 45);
    this.playedStackRotation.push(randomAngle);

    const randomOffset = {
      x: randomNumber(-20, 20),
      y: randomNumber(-20, 20)
    };
    this.playedStackPosition.push(randomOffset);

    if (this.playedStackRotation.length != this.game.state.playedStack.length) {
      throw new Error('Rotation and played stack length mismatch');
    }

    return nextPlayer;
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
    let selectedColor: string | undefined;

    if (this.game.isWildCard(this.userId, cardIndex)) {
      this.wildCardSelected = this.game.getPlayerCardReference(this.userId, cardIndex);

      selectedColor = await new Promise<string>((resolve) => {
        this.wildCardColorPromiseResolver = resolve;
      });

      this.wildCardSelected = undefined;

      this.next();
    }

    if (this.game.state.currentTurn.player === this.userId) {
      this.play(this.userId, cardIndex, selectedColor); // TODO: Make this dynamic

      this.next();
    }
  }

  public clickedDraw() {
    if (this.game.state.currentTurn.player !== this.userId || this.wildCardSelected) {
      return;
    }

    this.game.drawCard(this.userId); // TODO: Make this dynamic

    this.humanCanSkip = true;

    this.resetPlayableCards();
    this.updatePlayableCards();
  }

  public clickedSkip() {
    if (this.game.state.currentTurn.player === this.userId) {
      this.game.skipTurn(this.userId); // TODO: Make this dynamic
    }

    this.next();
  }

  public updatePlayableCards() {
    this.playableCards = this.game.getPlayableCards(this.userId); // TODO: Make this dynamic
  }

  public resetPlayableCards() {
    this.playableCards = [];
  }
}
