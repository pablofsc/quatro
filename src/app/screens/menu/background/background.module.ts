import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Import BrowserAnimationsModule
import { BackgroundComponent } from './background.component';

@NgModule({
  declarations: [BackgroundComponent],
  imports: [BrowserModule, BrowserAnimationsModule], // Include BrowserAnimationsModule
  bootstrap: [BackgroundComponent],
  exports: [BackgroundComponent],
})
export class BackgroundModule {}
