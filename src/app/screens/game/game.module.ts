import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { CardComponent } from './card/card.component';
import { BackButtonModule } from 'src/app/components/back-button/back-button.module';
import { HorizontalScrollDirective } from './directives/horizontal-scroll.directive';
import { WildSelectorComponent } from './wild-selector/wild-selector.component';
import { PlayerStatusComponent } from './player-status/player-status.component';



@NgModule({
  declarations: [
    GameComponent,
    CardComponent,
    HorizontalScrollDirective,
    WildSelectorComponent,
    PlayerStatusComponent
  ],
  imports: [
    CommonModule,
    BackButtonModule
  ],
  exports: [
    GameComponent
  ]
})
export class GameModule {}
