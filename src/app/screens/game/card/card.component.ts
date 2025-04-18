import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Card, DeckService } from 'src/app/services/deck.service';

interface CardDisplay {
  symbol: string;
  color: string;
  class: string;
  tooltip: string | null;
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
  @Input() public playable: boolean = false;

  public display: CardDisplay | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.input && this.input.type) {
      if (!this.rotation) {
        this.rotation = 0;
      }

      if (!this.position) {
        this.position = { x: 0, y: 0 };
      }

      this.display = {
        symbol: this.input.type.text || this.input.type.name, // TODO: Fix type
        color: this.input.color ? this.deckService.deckInfo?.colors[this.input.color] || 'black' : 'black', // TODO: Improve this
        class: `${this.input?.color ? `card` : 'card wild-card'} ${this.playable ? 'playable' : ''}`,
        tooltip: this.input.type.description || ''
      };
    }
    else {
      console.error(this.input);
      throw new Error("Card is undefined");
    }
  }
}
