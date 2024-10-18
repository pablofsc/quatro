import { Component } from '@angular/core';
import { LocalGameService } from '../../services/game-local.service';
import { randomNumber } from 'src/utils';
import { Card } from 'src/app/services/deck.service';
import { AiService } from 'src/app/services/ai.service';
import { ScreensService } from 'src/app/services/screens.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent {
  constructor(
    private readonly localGame: LocalGameService,
    private readonly ai: AiService,
    private readonly screens: ScreensService
  ) {
    this.start();
  }

  public gameReady = false;

  public humanId = 'player1'; // TODO: Make these dynamic
  public computerId = 'player2';

  public state = this.localGame.state;
  public playedStackRotation: number[] = [0];
  public playedStackPosition: { x: number, y: number; }[] = [{ x: 0, y: 0 }];
  public wildCardSelected?: Card;
  public wildCardColorPromiseResolver?: (value: string) => void;

  public humanCanSkip = false;
  public playableCards: number[] = [];

  private async start() {
    await this.localGame.startGame(2);
    await this.next();

    this.gameReady = true;
  }

  public async next() {
    this.resetPlayableCards();
    this.humanCanSkip = false;

    if (this.localGame.state.winner !== null) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.localGame.state.winner === this.humanId) {
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

    if (this.localGame.state.currentTurn.player === this.computerId) {
      this.ai.play(this.computerId, (pl, ci, wc) => this.play(pl, ci, wc));
      await this.localGame.state.currentTurn.playedPromise;

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
    const nextPlayer = this.localGame.playCard(player, cardIndex, wildCardColor); // TODO: Make this dynamic

    const randomAngle = randomNumber(-45, 45);
    this.playedStackRotation.push(randomAngle);

    const randomOffset = {
      x: randomNumber(-20, 20),
      y: randomNumber(-20, 20)
    };
    this.playedStackPosition.push(randomOffset);

    if (this.playedStackRotation.length != this.localGame.state.playedStack.length) {
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

    if (this.localGame.isWildCard(this.humanId, cardIndex)) {
      this.wildCardSelected = this.localGame.getPlayerCardReference(this.humanId, cardIndex);

      selectedColor = await new Promise<string>((resolve) => {
        this.wildCardColorPromiseResolver = resolve;
      });

      this.wildCardSelected = undefined;

      this.next();
    }

    if (this.localGame.state.currentTurn.player === this.humanId) {
      this.play(this.humanId, cardIndex, selectedColor); // TODO: Make this dynamic

      this.next();
    }
  }

  public clickedDraw() {
    if (this.localGame.state.currentTurn.player !== this.humanId || this.wildCardSelected) {
      return;
    }

    this.localGame.drawCard(this.humanId); // TODO: Make this dynamic

    this.humanCanSkip = true;

    this.resetPlayableCards();
    this.updatePlayableCards();
  }

  public clickedSkip() {
    if (this.localGame.state.currentTurn.player === this.humanId) {
      this.localGame.skipTurn(this.humanId); // TODO: Make this dynamic
    }

    this.next();
  }

  public updatePlayableCards() {
    this.playableCards = this.localGame.getPlayableCards(this.humanId); // TODO: Make this dynamic
  }

  public resetPlayableCards() {
    this.playableCards = [];
  }
}
