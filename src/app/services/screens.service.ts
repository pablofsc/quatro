import { Injectable } from '@angular/core';

export type Screen = 'menu' | 'game';

@Injectable({
  providedIn: 'root'
})
export class ScreensService {
  public current: Screen;

  constructor() {
    this.current = 'menu';
  }
}
