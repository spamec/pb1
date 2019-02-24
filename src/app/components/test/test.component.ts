import {Component, OnInit} from '@angular/core';
import {ObjectsService} from '../../services/objects.service';
import {TableService} from '../../services/table.service';
import {map, tap} from 'rxjs/operators';
import {Observable, of, Subject} from 'rxjs';
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

  constructor(private tableService: TableService, private objectsService: ObjectsService) {
  }

  ngOnInit() {
    this.data$ = this.tableService.getData().pipe(
      map(list => {
        console.log('%c Update table for data ', 'background: #33a553; color: #fff; font-size:14px;');
        this.data = list.map((value, index) => {
          const _temp = {};
          this.displayedColumns.forEach((column) => {
            _temp[column] = {
              driving: (value.unit_group_trips.find(item => item.c[0] === column) || {c: ['-', '-']}).c[1],
              staying: (value.unit_group_engine_hours.find(item => item.c[0] === column) || {c: ['-', '-']}).c[1],
            };
          });
          return {..._temp, ...{Time: index}};
        });
        console.log(this.data);
        return this.data;
      })
    );

    this.objects$ = this.objectsService.getObjectList().pipe(
      map(value => {
        this.objects = value.map(object => {
          return new WialonObjects(object);
        });
        console.log(this.objects);
        this.displayedColumns = [...['Time'], ...this.objects.map(object => object.name)];
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
