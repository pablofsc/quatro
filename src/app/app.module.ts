import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MenuModule } from './screens/menu/menu.module';
import { GameModule } from './screens/game/game.module';
import { MultiplayerModule } from './screens/multiplayer/multiplayer.module';
import { BackgroundModule } from './components/background/background.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MenuModule,
    GameModule,
    HttpClientModule,
    MultiplayerModule,
    BackgroundModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
