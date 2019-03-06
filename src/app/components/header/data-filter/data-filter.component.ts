import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDatepickerInputEvent} from '@angular/material';
import {log} from 'util';
import {FiltersService} from '../../../services/filters.service';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {WialonService} from '../../../services/wialon.service';
import {ObjectsService} from '../../../services/objects.service';
import {MyDateFilter} from '../../../models/my-date-filter';
import {TableService} from '../../../services/table.service';

@Component({
  selector: 'app-data-filter',
  templateUrl: './data-filter.component.html',
  styleUrls: ['./data-filter.component.scss']
})
export class DataFilterComponent implements OnInit, OnDestroy {

  dateFromField: FormControl = new FormControl(Date());
  dateToField: FormControl = new FormControl(Date());
  dateFrom$: Observable<Date>;
  dateTo$: Observable<Date>;

  constructor(private filtersService: FiltersService, private objectsService: ObjectsService, private tableService: TableService) {
    // this.
  }

  ngOnInit() {
    this.dateFrom$ = this.filtersService.dateFrom.pipe(
      tap(value => {
        console.log(value);
        this.dateFromField.patchValue(value);
      })
    );

    this.dateTo$ = this.filtersService.dateTo.pipe(
      tap(value => {
        console.log(value);
        this.dateToField.patchValue(value);
      })
    );
  }

  ngOnDestroy() {

  }

  changeDateFrom(event: MatDatepickerInputEvent<Date>) {
    this.filtersService.setDateFrom(event.value);
  }

  changeDateTo(event: MatDatepickerInputEvent<Date>) {
    this.filtersService.setDateTo(event.value);
  }

  updateData() {
    const filter: MyDateFilter = {
      DateFrom: this.filtersService.dateFrom.getValue(),
      DateTo: this.filtersService.dateTo.getValue()
    };
    console.log(filter);
    this.objectsService.updateTable(filter).then(tableData => {
      this.tableService.setData(tableData);
    });

  }
}
