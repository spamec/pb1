import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TimeOfDayPipe} from './time-of-day.pipe';

@NgModule({
  declarations: [TimeOfDayPipe],
  imports: [
    CommonModule
  ], exports: [
    TimeOfDayPipe
  ]
})
export class PipesModule {
}
