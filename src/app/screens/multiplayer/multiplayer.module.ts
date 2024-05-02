import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MultiplayerComponent } from './multiplayer.component';
import { BackgroundModule } from 'src/app/components/background/background.module';

@NgModule({
  declarations: [
    MultiplayerComponent,
  ],
  imports: [
    CommonModule,
    BackgroundModule
  ],
  exports: [
    MultiplayerComponent
  ]
})
export class MultiplayerModule {}
