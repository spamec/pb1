import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimeOfDayPipe} from './time-of-day.pipe';
import { LogPipe } from './log.pipe';

@NgModule({
  declarations: [TimeOfDayPipe, LogPipe],
  imports: [
    CommonModule
  ], exports: [
    TimeOfDayPipe,LogPipe
  ]
})
export class PipesModule {
}
