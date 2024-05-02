import { Injectable } from '@angular/core';
import { LocalGameService } from './game-local.service';
import { printCard } from 'src/utils';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  constructor(
    private readonly game: LocalGameService
  ) {}

  private thinkingTime = 1000;

  private getRandomIndex(array: any[]) {
    return Math.floor(Math.random() * array.length);
  }

  public async play(computerId: string, play: (player: string, cardIndex: number, wildCardColor?: string) => string | undefined) { // TODO: Improve AI
    const playableCards = this.game.getPlayableCards(computerId);

    const randomIndex = this.getRandomIndex(playableCards);

    const pickedCardIndex = playableCards[randomIndex];

    if (pickedCardIndex != undefined) {
      console.log("AI wants to play:", pickedCardIndex, printCard(this.game.state.hands[computerId][pickedCardIndex]));

      this.playCard(computerId, pickedCardIndex, play);
    }
    else {
      // console.log("AI has to draw a card", pickedCardIndex);

      setTimeout(() => {
        this.game.drawCard(computerId);

        const playableCards = this.game.getPlayableCards(computerId);

        if (playableCards.length === 1) {
          // console.log("AI has drawn a card and can play it");

          this.playCard(computerId, playableCards[0], play)
        }
        else {
          // console.log("AI has drawn a card but can't play it");

          this.skipTurn(computerId);
        }
      }, this.thinkingTime);
    }
  }

  private playCard(computerId: string, pickedCardIndex: number, play: (player: string, cardIndex: number, wildCardColor?: string) => string | undefined) {
    if (this.game.state.hands[computerId][pickedCardIndex].type.nonWild) {
      // console.log("AI is playing a regular card");

      this.playRegularCard(computerId, pickedCardIndex, play);
    }
    else {
      // console.log("AI is playing a wild card");

      this.playWildCard(computerId, pickedCardIndex, play);
    }
  }

  private async playRegularCard(computerId: string, pickedCardIndex: number, play: (player: string, cardIndex: number, wildCardColor?: string) => string | undefined) {
    setTimeout(() => { play(computerId, pickedCardIndex); }, this.thinkingTime);
  }

  private async playWildCard(computerId: string, pickedCardIndex: number, play: (player: string, cardIndex: number, wildCardColor?: string) => string | undefined) {
    const colors = ['red', 'green', 'blue', 'yellow']; // TODO: get from game service or wherever it's properly defined (deck service?)
    const index = this.getRandomIndex(colors);

    setTimeout(() => { play(computerId, pickedCardIndex, colors[index]); }, this.thinkingTime);
  }

  private async skipTurn(computerId: string) {
    setTimeout(() => { this.game.skipTurn(computerId); }, this.thinkingTime);
  }
}
