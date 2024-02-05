import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { BackgroundModule } from './background/background.module';

@NgModule({
  declarations: [
    MenuComponent,
  ],
  imports: [
    CommonModule,
    BackgroundModule
  ],
  exports: [
    MenuComponent
  ]
})
export class MenuModule {}
