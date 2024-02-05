import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const deckPath = '../../assets/deck.json';

export interface Card {
  type: CardType;
  color: string | null; // TODO: improve this type
}

interface DeckInfo {
  colors: Colors;
  types: CardType[];
  playerHandSize: number;
}

interface CardType {
  name: string;
  nonWild: boolean;
  count: number;
  canStartGame: boolean;
  symbol?: string;
  text?: string;
}

export interface Colors {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  constructor(
    private readonly http: HttpClient
  ) {}

  public deckInfo: DeckInfo | null = null;

  private async getDeckInfo(): Promise<void> {
    const deckInfo = await firstValueFrom(this.http.get(deckPath)) as DeckInfo;

    // TODO: Check if the deck is valid

    this.deckInfo = deckInfo;
  }

  private async getDeck(): Promise<Card[] | null> {
    await this.getDeckInfo();
    if (!this.deckInfo) {
      console.error('DeckInfo is falsy:', this.deckInfo);
      return null;
    }

    const deck: Card[] = [];

    const types = this.deckInfo.types;
    const colors = Object.keys(this.deckInfo.colors);

    for (const cardType of types) {
      if (cardType.nonWild) {
        for (const color of colors) {
          for (let i = 0; i < cardType.count; i++) {
            deck.push({
              type: cardType,
              color: color
            });
          }
        }
      }
      else {
        for (let i = 0; i < cardType.count; i++) {
          deck.push({
            type: cardType,
            color: null
          });
        }
      }
    }

    return deck;
  }

  public async getShuffledDeck(): Promise<Card[] | null> {
    const deck = await this.getDeck();

    if (!deck) {
      console.error('Deck is falsy:', deck);
      return null;
    }

    const shuffledDeck = [...deck];

    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }

    return shuffledDeck;
  }

  public getHandSize() {
    return this.deckInfo?.playerHandSize || 0;
  }

  public getColorsArray() {
    return Object.keys(this.deckInfo?.colors || {});
  }
}
