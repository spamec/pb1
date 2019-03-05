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

  checked = true;
  // driversSubscriber: Observable<DriverObjects[]>;
  drivers: WialonObjects[];

  dataObjects: any;
  dataDrivers: any;
  private driversSubscriber: Subscription;
  private objectsSubscriber: Subscription;

  constructor(private tableService: TableService, private objectsService: ObjectsService) {
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
        const _objects: Object[] = [];
        const _drivers: Object[] = [];
        list.forEach((timeData, index) => {

          this.objects.forEach((object, indexObj) => {
            let driving = (timeData.unit_group_trips.find(item => item.c[0] === object.name) || {c: ['-', '-']}).c[1];
            driving = (driving === '0:00:00') ? '-' : driving;
            let staying = (timeData.unit_group_engine_hours.find(item => item.c[0] === object.name) || {c: ['-', '-']}).c[1];
            staying = (staying === '0:00:00') ? '-' : staying;

            // const driverDriving = (timeData.unit_group_trips.find(item => item.c[0] === object.name) || {c: ['-', '-', '']}).c[2];
            // const driverStaying = (timeData.unit_group_engine_hours.find(item => item.c[0] === object.name) || {c: ['-', '-', '']}).c[2];
            // const drivers: string = (driverDriving === driverStaying) ? driverDriving : `${driverDriving}, ${driverStaying}`;
            if (!_objects[indexObj]) {
              _objects[indexObj] = {
                Object: object.name
              };
            }
            /*if (!_objects[indexObj].hasOwnProperty('drivers')) {
              _objects[indexObj]['drivers'] = '';
              console.log('init drivers', _objects[indexObj]['drivers']);
            }
            if (!!drivers && _objects[indexObj]['drivers'] !== drivers) {
              console.log('lenght', _objects[indexObj]['drivers'].lenght);
              if (_objects[indexObj]['drivers'].lenght > 0) {
                _objects[indexObj]['drivers'] = `${_objects[indexObj]['drivers']}, ${drivers}`;
              } else {
                _objects[indexObj]['drivers'] = drivers;
              }
            }*/
            _objects[indexObj] = {
              ..._objects[indexObj], ...{
                [index]: {driving, staying},
              }
            };
          });

          this.drivers.forEach((object, indexObj) => {
            let driving = (timeData.unit_group_trips.find(item => item.c[2] === object.name) || {c: ['-', '-']}).c[1];
            driving = (driving === '0:00:00') ? '-' : driving;
            let staying = (timeData.unit_group_engine_hours.find(item => item.c[2] === object.name) || {c: ['-', '-']}).c[1];
            staying = (staying === '0:00:00') ? '-' : staying;

            // const driverDriving = (timeData.unit_group_trips.find(item => item.c[0] === object.name) || {c: ['-', '-', '']}).c[2];
            // const driverStaying = (timeData.unit_group_engine_hours.find(item => item.c[0] === object.name) || {c: ['-', '-', '']}).c[2];
            // const drivers: string = (driverDriving === driverStaying) ? driverDriving : `${driverDriving}, ${driverStaying}`;
            if (!_drivers[indexObj]) {
              _drivers[indexObj] = {
                drivers: object.name
              };
            }
            /* if (!_drivers[indexObj].hasOwnProperty('drivers')) {
               _drivers[indexObj]['drivers'] = '';
               console.log('init drivers', _drivers[indexObj]['drivers']);
             }
             if (!!drivers && _drivers[indexObj]['drivers'] !== drivers) {
               console.log('lenght', _drivers[indexObj]['drivers'].lenght);
               if (_drivers[indexObj]['drivers'].lenght > 0) {
                 _drivers[indexObj]['drivers'] = `${_drivers[indexObj]['drivers']}, ${drivers}`;
               } else {
                 _drivers[indexObj]['drivers'] = drivers;
               }
             }*/
            _drivers[indexObj] = {
              ..._drivers[indexObj], ...{
                [index]: {driving, staying},
              }
            };
          });
        });
        this.dataObjects = _objects;
        this.dataDrivers = _drivers;
        this.setDisplayColumns();
        console.log(this.data);
        console.log(this.displayedColumns);
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
    this.checked = !this.checked;
    this.setDisplayColumns();
  }

  setDisplayColumns() {
    if (this.checked) {
      console.log('Drivers');
      this.data = this.dataDrivers;
      this.displayedColumns = [...['drivers'], ...this._displayedColumns];

    } else {
      console.log('Objects');
      this.data = this.dataObjects;
      this.displayedColumns = [...['Object'], ...this._displayedColumns];
    }
  }
}
