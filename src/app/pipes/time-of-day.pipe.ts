import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'timeOfDay'
})
export class TimeOfDayPipe implements PipeTransform {

  transform(value: number, args?: any): string {
    while (value > 23) { value -= 24; }
    if (value < 9) {
      return `0${value}:00 - 0${value + 1}:00`;
    } else if (value > 9) {
      return `${value}:00 - ${value + 1}:00`;
    } else {
      return `0${value}:00 - ${value + 1}:00`;
    }
  }

}
