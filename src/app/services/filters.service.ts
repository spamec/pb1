import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {BlockUIService} from 'ng-block-ui';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  dateFrom: BehaviorSubject<Date> = new BehaviorSubject<Date>(new Date());
  dateTo: BehaviorSubject<Date> = new BehaviorSubject<Date>(new Date());
  constructor() {
    this.init();
  }

  init() {
      const _dateFrom = this.dateFrom.getValue();
      this.setDateFrom(_dateFrom);
      const _dateTo = this.dateTo.getValue();
      this.setDateTo(_dateTo);
  }

  setDateFrom(date: Date) {
    date.setHours(0, 0, 0, 0);
    this.dateFrom.next(date);
  }

  setDateTo(date: Date) {
    date.setHours(23, 59, 59, 0);
    this.dateTo.next(date);
  }



}
