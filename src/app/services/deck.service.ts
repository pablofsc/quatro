import { Injectable } from '@angular/core';

import { DeckClass } from 'src/assets/classes/deck.class';
import * as utils from '../../utils';

export * from 'src/assets/classes/deck.class'

@Injectable({
  providedIn: 'root'
})
export class DeckService extends DeckClass {
  constructor() {
    super(utils.readDeck);
  }
}
