import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';
import { randomNumber } from 'src/utils';
import { Card } from 'src/app/services/deck.service';
import { AiService } from 'src/app/services/ai.service';
import { ScreensService } from 'src/app/services/screens.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  constructor(
    private readonly game: GameService,
    private readonly ai: AiService,
    private readonly screens: ScreensService
  ) {
    this.start();
  }

  public humanId = 'player1'; // TODO: Make these dynamic
  public computerId = 'player2';

  public state = this.game.state;
  public playedStackRotation: number[] = [0];
  public wildCardSelected?: Card;
  public wildCardColorPromiseResolver?: (value: string) => void;

  public humanCanSkip = false;

  private async start() {
    await this.game.startGame(2);
  }

  public async next() {
    this.humanCanSkip = false;

    if (this.game.state.winner !== null) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.game.state.winner === this.humanId) {
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

    if (this.game.state.currentTurn.player === this.computerId) {
      this.ai.play(this.computerId, (pl, ci, wc) => this.play(pl, ci, wc));
      await this.game.state.currentTurn.playedPromise;

      this.next();
    }
    else {
      // Await for human player
    }
  }

  public play(player: string, cardIndex: number, wildCardColor?: string) {
    const nextPlayer = this.game.playCard(player, cardIndex, wildCardColor); // TODO: Make this dynamic

    const randomAngle = randomNumber(-90, 90);
    this.playedStackRotation.push(randomAngle);

    if (this.playedStackRotation.length != this.game.state.playedStack.length) {
      throw new Error('Rotation and played stack length mismatch');
    }

    return nextPlayer;
  }

  public selectedWildColor(value: string): void {
    if (!this.wildCardColorPromiseResolver) {
      throw new Error('No wild card color promise resolver');
    }
    else {
      this.wildCardColorPromiseResolver(value);
    }
  }

  public async clickedCard(cardIndex: number) {
    let selectedColor: string | undefined;

    if (this.game.isWildCard(this.humanId, cardIndex)) {
      console.log('Wild card selected');
      this.wildCardSelected = this.game.getPlayerCardReference(this.humanId, cardIndex);

      selectedColor = await new Promise<string>((resolve) => {
        this.wildCardColorPromiseResolver = resolve;
      });

      this.wildCardSelected = undefined;
    }

    if (this.game.state.currentTurn.player === this.humanId) {
      this.play(this.humanId, cardIndex, selectedColor); // TODO: Make this dynamic

      this.next();
    }
  }

  public clickedDraw() {
    if (this.game.state.currentTurn.player === this.humanId) {
      this.game.drawCard(this.humanId); // TODO: Make this dynamic

      this.humanCanSkip = true;
    }
  }

  public clickedSkip() {
    if (this.game.state.currentTurn.player === this.humanId) {
      this.game.skipTurn(this.humanId); // TODO: Make this dynamic
    }

    this.next();
  }
}
