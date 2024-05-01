
import { Card, DeckClass } from './deck.class';

export interface Hands {
  [key: string]: Hand;
}

export interface Action {
  player: string;
  type: 'card' | 'draw' | 'skip';
  card?: Card; // undefined if type is 'skip'
}

export type Hand = Card[];
export type PlayerCode = string;

export class GameClass {
  constructor(
    private readonly deck: DeckClass
  ) {}

  public state = {
    drawStack: <Card[]>[],
    playedStack: <Card[]>[],
    hands: <Hands>{},
    playerCount: 2,
    playerOrderReversed: <boolean>false,
    currentTurn: {
      player: <string | undefined>undefined,
      playerHasDrawn: false,
      playedPromise: <Promise<void> | null>null,
      playedResolver: <(() => void) | null>null
    },
    history: <Action[]>[],
    winner: <string | null>null
  };

  public getPlayerCardReference(player: string, cardIndex: number): Card {
    return this.state.hands[player][cardIndex];
  }

  public async startGame(playerCount: number): Promise<void> {
    this.resetState();

    const deck = await this.deck.getShuffledDeck();

    if (Array.isArray(deck)) {
      this.state.drawStack = deck;
    }
    else {
      throw new Error("Deck is not an array");
    }

    for (let i = 1; i <= playerCount; i++) {
      this.state.hands[`player${i}`] = [];
    }

    for (let i = 1; i <= this.deck.getHandSize(); i++) {
      for (let player in this.state.hands) {
        this.state.hands[player].push(this.getFromDrawStack());
      }
    }

    this.state.playedStack.push(this.getFromDrawStack(true));

    this.changeCurrentPlayer("player1");
  }

  public playCard(player: string, cardIndex: number, color?: string): string | undefined { // Should ALWAYS throw error if nothing is played
    if (this.state.currentTurn.player !== player) {
      throw new Error(`Not ${player}'s turn`);
    }

    const card = this.state.hands[player][cardIndex];

    if (!card) {
      console.error(player, cardIndex, card);
      throw new Error("Card is undefined");
    }

    if (this.canPlayCard(card)) {
      if (!card.type.nonWild) {
        if (!color) {
          throw new Error("Color for wild card is undefined");
        }

        card.color = color;
      }

      this.state.playedStack.push(card);
      this.state.hands[player].splice(cardIndex, 1);

      const nextPlayer = this.handlePossibleAction(card, player);

      this.changeCurrentPlayer(nextPlayer);
    }
    else {
      throw new Error("You cannot play this card");
    }

    // console.log('next:', this.state.currentTurn.player);

    return this.state.currentTurn.player;
  }

  public isWildCard(player: string, cardIndex: number): boolean {
    const card = this.state.hands[player][cardIndex];

    if (!card) {
      throw new Error("Card is undefined");
    }

    return !card.type.nonWild;
  }

  public drawCard(player: string, override: boolean = false): void { // TODO: refactor override feature
    if (!override && this.state.currentTurn.player !== player) {
      throw new Error(`Not ${player}'s turn`);
    }

    const card = this.getFromDrawStack();

    console.log(player, 'drew', card);

    this.state.currentTurn.playerHasDrawn = true;

    this.state.hands[player].push(card);
  }

  public skipTurn(player: string): void {
    if (this.state.currentTurn.player !== player) {
      throw new Error(`Not ${player}'s turn`);
    }

    if (!this.state.currentTurn.playerHasDrawn) {
      throw new Error("You must draw a card first");
    }

    this.changeCurrentPlayer(this.getNextPlayer());

    console.log(player, 'skipped');
  }

  public getPlayableCards(player: string): number[] {
    const possibilities: number[] = [];
    const hand = this.state.hands[player];

    for (let i = 0; i < hand.length; i++) {
      if (this.canPlayCard(hand[i])) {
        possibilities.push(i);
      }
    }

    return possibilities;
  }

  private canPlayCard(card: Card): boolean {
    const topCard = this.state.playedStack[this.state.playedStack.length - 1];

    if (!topCard) {
      throw new Error("Top card is undefined");
    }

    return (
      topCard.color === card.color ||
      topCard.type.name === card.type.name ||
      !card.type.nonWild
    );
  }

  private getNextPlayer(skipOne: boolean = false): string {
    const currentPlayer = parseInt(this.state.currentTurn.player?.replace("player", "") || "0");

    if (currentPlayer === 0) {
      throw new Error("currentPlayer is 0");
    }

    const delta = skipOne ? 2 : 1;

    if (this.state.playerOrderReversed) {
      var nextPlayer = currentPlayer - delta;
    }
    else {
      var nextPlayer = currentPlayer + delta;
    }

    nextPlayer = this.wrapToInterval(nextPlayer, 1, this.state.playerCount);

    return `player${nextPlayer}`;
  }

  private getFromDrawStack(firstCard: boolean = false): Card {
    if (!firstCard) {
      const card = this.state.drawStack.pop();

      if (!card) {
        throw new Error("Popped card is undefined");
      }

      return card;
    }
    else { // only for the first card
      const index = this.state.drawStack.findIndex(element => element.type.canStartGame === true);

      if (index !== -1) {
        const card = this.state.drawStack.splice(index, 1)[0];

        return card;
      }
      else {
        throw new Error('No element found that fulfills the criteria.');
      }
    }
  }

  private handlePossibleAction(card: Card, player: string, delay: boolean = true): PlayerCode {
    const nextPlayer = this.getNextPlayer();

    switch (card.type.name) {
      case "DRAW2":
        console.log("DRAW2: Drawing two cards for", nextPlayer);
        this.drawCardsForPlayer(nextPlayer, 2, 250);

        return nextPlayer;

      case "REVERSE":
        console.log("REVERSE: Reversing order");
        this.state.playerOrderReversed = !this.state.playerOrderReversed;

        return player; // Same player plays again

      case "SKIP":
        console.log("SKIP: next player does not play:", this.getNextPlayer());

        return this.getNextPlayer(true);

      case "WILD":
        console.log("WILD: Wild card, doing nothing");

        return nextPlayer;

      case "WILD_DRAW4":
        console.log("WILD_DRAW4: Wild draw 4 card, drawing four cards for next player:", nextPlayer);
        this.drawCardsForPlayer(nextPlayer, 4, 250);

        return nextPlayer;

      default:
        return nextPlayer;
    }
  }

  private async drawCardsForPlayer(player: string, amount: number, delay: number | null) { // TODO: not ideal to have delay stuff here
    const delayFunction = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    if (delay != null) {
      for (let i = 0; i < amount; i++) {
        this.drawCard(player, true);

        await delayFunction(delay);
      }
    }
    else {
      for (let i = 0; i < amount; i++) {
        this.drawCard(player, true);
      }
    }
  }

  private changeCurrentPlayer(nextPlayer: string): void {
    if (this.state.currentTurn.playedResolver) {
      this.state.currentTurn.playedResolver();
      // console.warn("Resolver called");
    }
    else {
      if (this.state.playedStack.length != 1)
        console.error("No played resolver for player", this.state.currentTurn.player, "and played stack length", this.state.playedStack.length);
    }

    for (let player in this.state.hands) {
      if (this.state.hands[player].length === 0) { // TODO: lock game
        this.state.winner = player;
        console.log("Winner:", player);
      }
    }

    let resolver = null;
    const promise = new Promise<void>(resolve => { resolver = resolve; });

    this.state.currentTurn = {
      player: nextPlayer,
      playerHasDrawn: false,
      playedPromise: promise,
      playedResolver: resolver
    };
  }

  private resetState() {
    this.state.drawStack = [];
    this.state.playedStack = [];
    this.state.hands = {};
    this.state.playerCount = 2;
    this.state.playerOrderReversed = false;
    this.state.currentTurn = {
      player: undefined,
      playerHasDrawn: false,
      playedPromise: null,
      playedResolver: <(() => void) | null>null
    };
    this.state.history = [];
    this.state.winner = null;
  }

  private wrapToInterval(x: number, a: number, b: number) {
    if (a >= b) {
      throw new Error("a must be less than b");
    }

    const range = b - a + 1;

    return ((x - a) % range + range) % range + a;
  }
}
