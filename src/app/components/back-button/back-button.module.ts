import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtonComponent } from './back-button.component';
import { ScreensService } from 'src/app/services/screens.service';



@NgModule({
  declarations: [
    BackButtonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BackButtonComponent
  ],
  providers: [
    ScreensService
  ]
})
export class BackButtonModule {}
