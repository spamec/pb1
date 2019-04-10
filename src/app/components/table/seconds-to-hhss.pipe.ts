import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'secondsToHHss'
})
export class SecondsToHHssPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const sec_num = parseInt(value, 10); // don't forget the second param
    const hours = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);
    let _hour_s = String(hours);
    let _minutes_s = String(minutes);
    let _seconds_s = String(seconds);
    if (hours < 10) {
      _hour_s = '0' + String(hours);
    }
    if (minutes < 10) {
      _minutes_s = '0' + minutes;
    } if (seconds < 10) {
      _seconds_s = '0' + seconds;
    }
    return _hour_s + ':' + _minutes_s + ':' + _seconds_s;
  }

}
