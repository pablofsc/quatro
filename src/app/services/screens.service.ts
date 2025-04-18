import { Injectable } from '@angular/core';

export type Screen = 'menu' | 'local_game' | 'online_game' | 'online_setup';

@Injectable({
  providedIn: 'root'
})
export class ScreensService {
  public current: Screen;

  constructor() {
    this.current = 'menu';
  }
}
