import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Card, DeckService } from 'src/app/services/deck.service';

interface CardDisplay {
  symbol: string;
  color: string;
  class: string;
}

@Component({
  selector: 'game-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnChanges {
  constructor(
    private readonly deckService: DeckService
  ) {}

  @Input() public input: Card | undefined;
  @Input() public isFaceUp: boolean = false;
  @Input() public rotation: number = 0;
  @Input() public position: { x: number, y: number; } = { x: 0, y: 0 };

  public display: CardDisplay | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.input && this.input.type) {
      this.display = {
        symbol: this.input.type.text || this.input.type.name, // TODO: Fix type
        color: this.input.color ? this.deckService.deckInfo?.colors[this.input.color] || 'black' : 'black', // TODO: Improve this
        class: this.input?.color ? `card` : 'card wild-card'
      };
    }
    else {
      console.error(this.input);
      throw new Error("Card is undefined");
    }
  }
}
