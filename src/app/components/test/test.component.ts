import {Component, OnInit} from '@angular/core';
import {ObjectsService} from '../../services/objects.service';
import {TableService} from '../../services/table.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {TableData} from '../../models/table-data';

class WialonObjects {
  id: number;
  name: string;

  constructor(_raw) {
    this.id = _raw.getId();
    this.name = _raw.getName();
  }
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  data$: Observable<TableData[]>;
  data: any[];
  objects$: Observable<WialonObjects[]>;
  objects: WialonObjects[];
  displayedColumns: string[];
  _displayedColumns: string[] = Array.from(new Array(24), (val, index) => String(index));

  constructor(private tableService: TableService, private objectsService: ObjectsService) {
  }

  ngOnInit() {
    this.data$ = this.tableService.getData().pipe(
      map(list => {
        console.log('%c Update table for data ', 'background: #33a553; color: #fff; font-size:14px;');
        console.log(list);
        const _temp = [];
        list.forEach((timeData, index) => {
          this.objects.forEach((object, indexObj) => {
            let driving = (timeData.unit_group_trips.find(item => item.c[0] === object.name) || {c: ['-', '-']}).c[1];
            driving = (driving === '0:00:00') ? '-' : driving;
            let staying = (timeData.unit_group_engine_hours.find(item => item.c[0] === object.name) || {c: ['-', '-']}).c[1];
            staying = (staying === '0:00:00') ? '-' : staying;
            _temp[indexObj] = {
              ...(_temp[indexObj] || {Object: object.name}), ...{
                [index]: {driving, staying}
              }
            };
          });
        });
        this.data = _temp;
        this.displayedColumns = [...['Object'], ...this._displayedColumns];
        console.log(this.data);
        console.log(this.displayedColumns);
        return this.data;
      })
    );

   this.objects$ = this.objectsService.getObjectList().pipe(
      map(value => {
        this.objects = value.map(object => {
          return new WialonObjects(object);
        });
        console.log(this.objects);
        // this.displayedColumns = [...['Time'], ...this.objects.map(object => object.name)];
        return this.objects;
      })
    );

    setTimeout(() => {
      console.log(this.displayedColumns);
    }, 6000);

    // this.objectsService.getObjectData().then((data) => {
    //   console.log(data);
    // });
  }

}
