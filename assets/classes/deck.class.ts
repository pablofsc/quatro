export interface Card {
  type: CardType;
  color: string | null; // TODO: improve this type
  playable?: boolean;
}

export interface Colors {
  [key: string]: string;
}

export interface DeckInfo {
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
  description?: string;
}

export class DeckClass {
  constructor(
    private readonly readDeck: () => Promise<DeckInfo>,
  ) {}

  public deckInfo: DeckInfo | null = null;

  public async loadDeckInfo(): Promise<void> {
    this.deckInfo = await this.readDeck();
  }

  private async getDeck(): Promise<Card[] | null> {
    await this.loadDeckInfo();

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
