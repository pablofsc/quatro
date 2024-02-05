import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Card, DeckService } from 'src/app/services/deck.service';

@Component({
  selector: 'game-wild-selector',
  templateUrl: './wild-selector.component.html',
  styleUrls: ['./wild-selector.component.scss', '../game.component.scss']
})
export class WildSelectorComponent implements OnChanges {
  constructor(
    private readonly deck: DeckService
  ) {}

  @Input() originalWildCard?: Card;
  @Output() selectedColor = new EventEmitter<string>();

  public potentialWildCards?: Card[];
  public colors = this.deck.getColorsArray();

  ngOnChanges(changes: SimpleChanges): void {
    if (this.originalWildCard) {
      this.potentialWildCards = this.colors.map(color => ({
        type: this.originalWildCard!.type,
        color
      }));
    }
  }

  public cardClicked(index: number) {
    const color = this.potentialWildCards![index].color!;

    this.selectedColor.emit(color);
  }
}
