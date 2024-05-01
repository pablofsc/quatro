import { Injectable } from '@angular/core';

import { DeckService } from './deck.service';
import { GameClass } from 'src/assets/classes/game.class';

export * from 'src/assets/classes/game.class'

@Injectable({
  providedIn: 'root'
})
export class GameService extends GameClass {
  constructor(
    private readonly deckService: DeckService
  ) {
    super(deckService);
  }
}
