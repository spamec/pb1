import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {TableData} from '../models/table-data';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private _data = new Subject<TableData[]>();

  getData() {
    return this._data;
  }

  setData(value) {
    console.log('setData');
    this._data.next(value);
  }

  constructor() {
  }
}
