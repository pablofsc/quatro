import { Injectable } from '@angular/core';

import { DeckService } from './deck.service';
import { GameClass } from 'src/assets/classes/game.class';

export * from 'src/assets/classes/game.class';

@Injectable({
  providedIn: 'root'
})
export class LocalGameService extends GameClass {
  constructor(
    private readonly deckService: DeckService
  ) {
    super(deckService);
  }

  protected override async drawCardsForPlayer(player: string, amount: number) { // TODO: not ideal to have delay stuff here
    const delayFunction = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < amount; i++) {
      this.drawCard(player, true);

      await delayFunction(250);
    }
  }
}
