import {Component, OnDestroy, OnInit} from '@angular/core';
import {ObjectsService} from '../../services/objects.service';
import {TableService} from '../../services/table.service';
import {map} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {TableData} from '../../models/table-data';

class WialonObjects {
  id: number;
  name: string;

  constructor(_raw) {
    this.id = _raw.getId();
    this.name = _raw.getName();
  }
}

class DriverObjects {
  id: number;
  name: string;

  constructor(_raw) {
    this.id = _raw.id;
    this.name = _raw.n;
  }
}

@Component({
  selector: 'app-test',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {

  data$: Observable<TableData[]>;
  data: any[];
  // objects$: Observable<WialonObjects[]>;
  objects: WialonObjects[];
  displayedColumns: string[];
  _displayedColumns: string[] = Array.from(new Array(24), (val, index) => String(index));
  checkedDrivers = false;
  checkedHideEmpty = true;
  // driversSubscriber: Observable<DriverObjects[]>;
  drivers: WialonObjects[];
  dataObjects: any[];
  dataDrivers: any[];
  dataDate: any[];
  private driversSubscriber: Subscription;
  private objectsSubscriber: Subscription;
  private DateTo: Date;

  constructor(private tableService: TableService, private objectsService: ObjectsService) {
  }

  parseData(object, indexObj, timeData, index, _objects, source) {
    let driving = (timeData.unit_group_trips.find(item => item.c[source] === object.name) || {c: ['-', '-']}).c[1];
    driving = (driving === '0:00:00') ? '-' : driving;
    let staying = (timeData.unit_group_engine_hours.find(item => item.c[source] === object.name) || {c: ['-', '-']}).c[1];
    staying = (staying === '0:00:00') ? '-' : staying;

    if (!_objects[indexObj]) {
      _objects[indexObj] = {Object: object.name, drivers: object.name, empty: true, Total: 1};
    }

    if (_objects[indexObj]['empty'] && (driving !== '-' || staying !== '-')) {
      _objects[indexObj]['empty'] = false;
    }
    _objects[indexObj] = {
      ..._objects[indexObj], ...{
        [index]: {driving, staying},
      }
    };
  }

  ngOnDestroy(): void {
    this.driversSubscriber.unsubscribe();
    this.objectsSubscriber.unsubscribe();
  }

  ngOnInit() {
    this.data$ = this.tableService.getData().pipe(
      map(list => {
        console.log('%c Update table for data ', 'background: #33a553; color: #fff; font-size:14px;');
        console.log(list);

        this.DateTo = this.objectsService.DateTo;

        this.dataObjects = [];
        this.dataDrivers = [];
        this.dataDate = [];
        const SIZE = 24;
        const listByDate = list.reduce((p, c) => {
          if (p[p.length - 1].length === SIZE) {
            p.push([]);
          }
          p[p.length - 1].push(c);
          return p;
        }, [[]]);
        listByDate.forEach((_list, dateIndex) => {
          const _objects: Object[] = [];
          const _drivers: Object[] = [];
          _list.forEach((timeData, index) => {
            this.objects.forEach((object, indexObj) => this.parseData(object, indexObj, timeData, index, _objects, 0));
            this.drivers.forEach((object, indexObj) => this.parseData(object, indexObj, timeData, index, _drivers, 2));
          });
          this.dataObjects.unshift(_objects);
          this.dataDrivers.unshift(_drivers);
          this.dataDate.push(new Date(this.DateTo.getTime() - (86400000 * dateIndex)));
        });
        this.setDisplayColumns();
        return this.data;
      })
    );

    this.driversSubscriber = this.objectsService.getDriverList().subscribe(
      value => {
        this.drivers = value.map(object => {
          return new DriverObjects(object);
        });
        console.log(this.drivers);
        // this.displayedColumns = [...['Time'], ...this.objects.map(object => object.name)];
        return this.drivers;
      }
    );

    this.objectsSubscriber = this.objectsService.getObjectList().subscribe(
      value => {
        this.objects = value.map(object => {
          return new WialonObjects(object);
        });
        console.log(this.objects);
        // this.displayedColumns = [...['Time'], ...this.objects.map(object => object.name)];
        return this.objects;
      }
    );


    // this.objectsService.getObjectData().then((data) => {
    //   console.log(data);
    // });
  }

  driverFilterToggle() {
    this.checkedDrivers = !this.checkedDrivers;
    this.setDisplayColumns();
  }

  emptyFilterToggle() {
    this.checkedHideEmpty = !this.checkedHideEmpty;
    this.setDisplayColumns();
  }

  setDisplayColumns() {
    let _data;
    if (this.checkedDrivers) {
      _data = this.dataDrivers;
      this.displayedColumns = [...['drivers'], ...this._displayedColumns, ...['Total']];
    } else {
      _data = this.dataObjects;
      this.displayedColumns = [...['Object'], ...this._displayedColumns, ...['Total']];
    }
    this.data = (this.checkedHideEmpty) ? _data.map(dateData => dateData.filter(row => {
      return !row['empty'];
    })) : _data;
  }
}
