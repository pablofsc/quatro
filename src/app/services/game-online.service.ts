import { Injectable } from '@angular/core';

import { Card, DeckService } from './deck.service';
import { GameClass, GameState, PlayerCode } from 'src/assets/classes/game.class';
import * as utils from '../../utils';
import { BackendService } from './backend.service';

export * from 'src/assets/classes/game.class';

@Injectable({
  providedIn: 'root'
})
export class OnlineGameService extends GameClass {
  constructor(
    protected readonly deckService: DeckService,
    protected readonly backendService: BackendService
  ) {
    super(deckService);
  }

  public playerCode: string | undefined = undefined;
  public sessionCode: string | undefined = undefined;
  public aliases: { [key: string]: 'player1' | 'player2'; } = {};

  public async createSession(): Promise<{ player: string; session: string; }> {
    console.log("Creating session...");

    const data = await this.backendService.createSession();

    this.playerCode = data.player;
    this.sessionCode = data.session;

    console.log(`Created session ${this.sessionCode} as ${this.playerCode}`);

    return data;
  }

  public async joinSession(code: string): Promise<any> {
    console.log(`Joining session ${code}...`);

    const data = await this.backendService.joinSession(code, this.playerCode);

    this.playerCode = data.player;
    this.sessionCode = data.session;

    console.log(`Joined session '${this.sessionCode}' as ${this.playerCode}`);

    return data;
  }

  public async waitForStart(): Promise<string> {
    return new Promise((res, rej) => {
      if (!this.sessionCode) {
        return rej("Session not set");
      }

      this.backendService.socket.emit({ player: this.playerCode, session: this.sessionCode, type: 'READY' });

      this.backendService.socket.listen('message')
        .subscribe({
          next: (data: any) => {
            if (data.type === 'ACK') {
              if (data.cause.type === 'READY' && data.cause.player === this.playerCode) {
                console.log('Server has acknowledged that you are ready to start.');
              }

              return;
            }

            if (data.type === 'START') {
              console.log('Server has started the game.', data);

              this.startGame(2);

              this.state = data.state;

              this.aliases = data.aliases;

              if (this.state.currentTurn.player === this.getOpponentId()) {
                let resolver = null;
                const promise = new Promise<void>(resolve => { resolver = resolve; });

                this.state.currentTurn.playedPromise = promise;
                this.state.currentTurn.playedResolver = resolver;
              }

              res(this.aliases[this.playerCode!]);
            }
          },
          error: (err) => {
            rej(err);
          }
        });
    });
  }

  public async listenToChanges(): Promise<void> {
    return new Promise((res, rej) => {
      if (!this.sessionCode) {
        return rej("Session not set");
      }

      this.backendService.socket.listen('message')
        .subscribe({
          next: (data: any) => {
            if (data.type === 'CYCLE') {
              console.log('Server has cycled the game:', data);

              let lastPlayedResolver: (() => void) | null = null;

              if (this.state.currentTurn.playedResolver) {
                lastPlayedResolver = this.state.currentTurn.playedResolver;
              }

              this.updateLocalState(data.state);

              if (this.state.currentTurn.player === this.getOpponentId()) {
                let resolver = null;
                const promise = new Promise<void>(resolve => { resolver = resolve; });

                this.state.currentTurn.playedPromise = promise;
                this.state.currentTurn.playedResolver = resolver;
              }
              else if (this.state.currentTurn.player === this.getPlayerId()) {
                // ?
              }

              if (lastPlayedResolver) {
                lastPlayedResolver();
              }
              else {
                console.error("No lastPlayedResolver");

                // ESTOU CONSERTANDO ERROS NA VERIFICAÇÃO DE QUAIS CARTAS PODEM SER JOGADAS E ACHO QUE É PROBLEMA DE CONCORRENCIA.
                // TAMBÉM ESTOU CONSERTANDO O PROBLEMA DA POSIÇÃO VISUAL DAS CARTAS
              }

              return;
            }
            else if (data.type === 'UPDATE') {
              console.log('Server has updated the game state:', data);

              this.updateLocalState(data.state);

              return;
            }
          },
          error: (err) => {
            rej(err);
          }
        });
    });
  }

  public listenToFinish() {
    return new Promise((res, rej) => {
      this.backendService.socket.listen('message')
        .subscribe({
          next: (data: any) => {
            if (data.type === 'OTHERS_DISCONNECTED') {
              console.log('Server has disconnected:', data);
              alert("The other player disconnected :(");

              this.backendService.socket.disconnect();

              res(true);
            }

            if (data.type === 'WON') {
              console.log('Server has declared you a winner:', data);
              alert("You won!");

              this.backendService.socket.disconnect();

              res(true);
            }

            if (data.type === 'LOST') {
              console.log('Server has declared you a loser:', data);
              alert("You lost!");

              this.backendService.socket.disconnect();

              res(true);
            }
          },
          error: (err) => {
            rej(err);
          }
        });
    });
  }

  private updateLocalState(newState: GameState) {
    const playedPromise = this.state.currentTurn.playedPromise;
    const playedResolver = this.state.currentTurn.playedResolver;

    utils.deepCopyInto(this.state, newState);

    this.state.currentTurn.playedPromise = playedPromise;
    this.state.currentTurn.playedResolver = playedResolver;
  }

  public override state: GameState = {
    drawStack: [],
    playedStack: [],
    hands: {},
    playerCount: 2,
    playerOrderReversed: false,
    currentTurn: {
      player: undefined,
      playerHasDrawn: false,
      playedPromise: null,
      playedResolver: null
    },
    history: [],
    winner: null
  };

  public override getPlayerId() {
    return this.aliases[this.playerCode!];
  }

  public override getOpponentId() {
    const opponentCode = Object.keys(this.aliases).find(key => key !== this.playerCode);

    return this.aliases[opponentCode!];
  }

  public override getPlayerCardReference(player: string, cardIndex: number): Card {
    return this.state.hands[player][cardIndex];
  }

  public override async startGame(playerCount: number): Promise<void> {
    await this.deck.loadDeckInfo();

    // game state is already set.
  }

  public override async playCard(player: string, cardIndex: number, color?: string): Promise<string | undefined> { // Should ALWAYS throw error if nothing is played
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

      await this.backendService.socket.emitAndWait(
        { player: this.playerCode, session: this.sessionCode, type: 'MOVEMENT', movement: 'PLAY', cardIndex: cardIndex, color: color },
        'CYCLE'
      );
    }
    else {
      throw new Error("You cannot play this card");
    }

    // console.log('next:', this.state.currentTurn.player);

    return this.state.currentTurn.player;
  }

  public override isWildCard(player: string, cardIndex: number): boolean {
    const card = this.state.hands[player][cardIndex];

    if (!card) {
      throw new Error("Card is undefined");
    }

    return !card.type.nonWild;
  }

  public override drawCard(player: string, override: boolean = false): void { // TODO: refactor override feature
    if (!override && this.state.currentTurn.player !== player) {
      throw new Error(`Not ${player}'s turn`);
    }

    this.backendService.socket.emit({ player: this.playerCode, session: this.sessionCode, type: 'MOVEMENT', movement: 'DRAW' });
  }

  public override skipTurn(player: string): void {
    if (this.state.currentTurn.player !== player) {
      throw new Error(`Not ${player}'s turn`);
    }

    if (!this.state.currentTurn.playerHasDrawn) {
      throw new Error("You must draw a card first");
    }

    this.backendService.socket.emit({ player: this.playerCode, session: this.sessionCode, type: 'MOVEMENT', movement: 'SKIP' });
  }

  public override getPlayableCards(player: string): number[] {
    const possibilities: number[] = [];
    const hand = this.state.hands[player];

    for (let i = 0; i < hand?.length; i++) {
      if (this.canPlayCard(hand[i])) {
        possibilities.push(i);
      }
    }

    return possibilities;
  }

  protected override canPlayCard(card: Card): boolean {
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

  protected override getNextPlayer(skipOne: boolean = false): string {
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

  protected override getFromDrawStack(firstCard: boolean = false): Card {
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

  protected override handlePossibleAction(card: Card, player: string, delay: boolean = true): PlayerCode {
    const nextPlayer = this.getNextPlayer();

    switch (card.type.name) {
      case "DRAW2":
        // console.log("DRAW2: Drawing two cards for", nextPlayer);
        this.drawCardsForPlayer(nextPlayer, 2);

        return nextPlayer;

      case "REVERSE":
        // console.log("REVERSE: Reversing order");
        this.state.playerOrderReversed = !this.state.playerOrderReversed;

        return player; // Same player plays again

      case "SKIP":
        // console.log("SKIP: next player does not play:", this.getNextPlayer());

        return this.getNextPlayer(true);

      case "WILD":
        // console.log("WILD: Wild card, doing nothing");

        return nextPlayer;

      case "WILD_DRAW4":
        // console.log("WILD_DRAW4: Wild draw 4 card, drawing four cards for next player:", nextPlayer);
        this.drawCardsForPlayer(nextPlayer, 4);

        return nextPlayer;

      default:
        return nextPlayer;
    }
  }

  protected override async drawCardsForPlayer(player: string, amount: number) { // TODO: not ideal to have delay stuff here
    for (let i = 0; i < amount; i++) {
      this.drawCard(player, true);
    }
  }

  protected override changeCurrentPlayer(nextPlayer: string): void {
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
        // console.log("Winner:", player);
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

  protected override resetState() {
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

  protected override wrapToInterval(x: number, a: number, b: number) {
    if (a >= b) {
      throw new Error("a must be less than b");
    }

    const range = b - a + 1;

    return ((x - a) % range + range) % range + a;
  }

  public override finishGame() {
    this.resetState();
    this.backendService.socket.disconnect();
  }
}
