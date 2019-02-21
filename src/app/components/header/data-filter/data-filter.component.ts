import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-data-filter',
  templateUrl: './data-filter.component.html',
  styleUrls: ['./data-filter.component.scss']
})
export class DataFilterComponent implements OnInit {
  dateFrom = new FormControl(new Date());
  dateTo = new FormControl(new Date());
  constructor() { }

  ngOnInit() {
  }

}
