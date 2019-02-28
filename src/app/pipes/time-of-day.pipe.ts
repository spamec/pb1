import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'timeOfDay'
})
export class TimeOfDayPipe implements PipeTransform {

  transform(value: number, args?: any): string {
    let _value = Number(value);
    while (_value > 23) { _value -= 24; }
    if (_value < 9) {
      return `0${_value}:00 - 0${_value + 1}:00`;
    } else if (_value > 9) {
      return `${_value}:00 - ${_value + 1}:00`;
    } else {
      return `0${_value}:00 - ${_value + 1}:00`;
    }
  }

}
