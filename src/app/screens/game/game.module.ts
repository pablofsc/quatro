import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GameComponent } from './game.component';
import { CardComponent } from './card/card.component';
import { BackButtonModule } from 'src/app/components/back-button/back-button.module';
import { HorizontalScrollDirective } from './directives/horizontal-scroll.directive';
import { WildSelectorComponent } from './wild-selector/wild-selector.component';



@NgModule({
  declarations: [
    GameComponent,
    CardComponent,
    HorizontalScrollDirective,
    WildSelectorComponent
  ],
  imports: [
    CommonModule,
    BackButtonModule,
    BrowserAnimationsModule
  ],
  exports: [
    GameComponent
  ]
})
export class GameModule {}
