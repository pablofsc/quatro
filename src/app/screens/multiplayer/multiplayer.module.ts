import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MultiplayerComponent } from './multiplayer.component';
import { BackgroundModule } from 'src/app/components/background/background.module';
import { BackButtonModule } from 'src/app/components/back-button/back-button.module';

@NgModule({
  declarations: [
    MultiplayerComponent,
  ],
  imports: [
    CommonModule,
    BackgroundModule,
    BackButtonModule,
    FormsModule
  ],
  exports: [
    MultiplayerComponent
  ]
})
export class MultiplayerModule {}
