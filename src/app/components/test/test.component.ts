import {Component, OnInit} from '@angular/core';
import {ObjectsService} from '../../services/objects.service';
import {TableService} from '../../services/table.service';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {TableData} from '../../models/table-data';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  data$: Observable<TableData[]>;

  constructor(private tableService: TableService) {
  }

  ngOnInit() {
    this.data$ = this.tableService.getData().pipe(
      tap(value => {
        console.log('%c Update table for data ', 'background: #33a553; color: #fff; font-size:14px;');
        console.log(value);
      })
    );
    // this.objectsService.getObjectData().then((data) => {
    //   console.log(data);
    // });
  }

}
