import { Card, DeckInfo } from './app/services/deck.service';

export async function readDeck(): Promise<DeckInfo> {
  let deckPath: string;

  if (window.location.hostname.includes('github.io')) { // TODO: improve this
    console.log('Running on GitHub Pages');

    deckPath = '/quatro/assets/deck.json';
  }
  else {
    console.log('Running locally');

    deckPath = './assets/deck.json';
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', deckPath, true);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText) as DeckInfo;

        resolve(response);
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        reject('Failed to load JSON file');
      }
    };

    xhr.send();
  });
}

export function randomNumber(a: number, b: number): number {
  if (a >= b) {
    throw new Error("a must be less than b");
  }

  const range = b - a;

  return Math.random() * range + a;
}

export function printCard(card: Card | undefined): string {
  if (!card) {
    return 'undefined';
  }

  return `${card.color} ${card.type.name}`;
}
