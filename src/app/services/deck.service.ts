import { Injectable } from '@angular/core';

import { DeckClass } from 'src/assets/classes/deck.class';

export * from 'src/assets/classes/deck.class'

let deckPath = '../../assets/deck.json';

if (window.location.hostname.includes('github.io')) { // TODO: improve this
  deckPath = '/quatro/assets/deck.json';

  console.log('Running on GitHub Pages');
}
else {
  console.log('Running locally');
}

@Injectable({
  providedIn: 'root'
})
export class DeckService extends DeckClass {
  constructor() {
    super(deckPath);
  }
}
