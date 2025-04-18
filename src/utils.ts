import { Card, DeckInfo } from './app/services/deck.service';

export async function readDeck(): Promise<DeckInfo> {
  let deckPath: string;

  if (window.location.hostname.includes('github.io')) { // TODO: improve this
    deckPath = '/quatro/assets/deck.json';
  }
  else {
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

export function deepCopyInto(target: any, source: any) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];

      if (Array.isArray(sourceValue)) {
        // If target already has an array, clear it to update in place.
        if (target.hasOwnProperty(key) && Array.isArray(target[key])) {
          target[key].length = 0; // Clear the array while keeping the pointer.
        }
        else {
          target[key] = [];
        }

        // Copy each item from the source array.
        for (const item of sourceValue) {
          if (item && typeof item === 'object') {
            // Create an empty object or array based on the item type.
            const newItem = Array.isArray(item) ? [] : {};
            deepCopyInto(newItem, item);
            target[key].push(newItem);
          }
          else {
            target[key].push(item);
          }
        }
      }
      else if (sourceValue && typeof sourceValue === 'object') {
        // For objects, if target already has an object, update it recursively.
        if (target.hasOwnProperty(key) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          deepCopyInto(target[key], sourceValue);
        }
        else {
          target[key] = {};
          deepCopyInto(target[key], sourceValue);
        }
      }
      else {
        // For primitives (or functions, null, etc.), assign directly.
        target[key] = sourceValue;
      }
    }
  }

  return target;
}

