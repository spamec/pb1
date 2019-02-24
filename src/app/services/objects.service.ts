import {Injectable} from '@angular/core';
import {WialonService} from './wialon.service';
import {Observable, Subject, of, throwError} from 'rxjs';
import {MyDateFilter} from '../models/my-date-filter';
import {WialonReportResult} from '../models/wialon-report-result';
import {TableData} from '../models/table-data';

interface IReport {
  c: number;
  ct: string;
  id: number;
  n: string;
}

const REPORT_NAME = localStorage.getItem('reportName') || 'Avant_C';

@Injectable({
  providedIn: 'root'
})
export class ObjectsService {

  private _objectList = new Subject<any[]>();

  reportId: number;
  masterResource;

  getObjectList() {
    return this._objectList;
  }

  setObjectList(value) {
    this._objectList.next(value);
  }

  constructor(private wialonService: WialonService) {
    this.getObjectData();

    const spec_resource = {
      itemsType: 'avl_resource',
      propName: 'sys_name',
      propValueMask: '*',
      sortType: 'sys_name'
    };
    const flags_resource = wialonService.wialon.item.Item.dataFlag.base | wialonService.wialon.item.Resource.dataFlag.reports;

    wialonService.wialon.core.Session.getInstance().searchItems(spec_resource, true, flags_resource, 0, 0, (code, data) => {
      if (code === 0 && data && data.items && data.items.length > 0) {
        let reports: IReport[];
        data.items.forEach((item) => {
          reports = Object.values(item.getReports());
          this.reportId = (reports.find(report => report.n === REPORT_NAME) || {id: 0}).id;
          if (!this.reportId) {
            const reportName = prompt(`Report ${REPORT_NAME} not found.`, REPORT_NAME);
            localStorage.setItem('reportName', reportName);
            window.location.reload();
          }
          this.masterResource = (this.reportId) ? item : this.masterResource;
        });
      }
    });

  }

  getObjectData() {
    const spec_acc = {
      itemsType: 'avl_unit',
      propName: 'sys_name',
      propValueMask: '*',
      sortType: 'sys_name'
    };
    const flags_acc = this.wialonService.wialon.item.Item.dataFlag.base;
    this.wialonService.wialon.core.Session.getInstance().searchItems(spec_acc, true, flags_acc,
      0, 0, (code, data) => {
        if (code || !data) {
          console.log(('List of units empty.'));
        } else if (!data.items || data.items.length < 1) {
          console.log(('List of units empty.'));
        } else {
          this.setObjectList(data.items);
        }
      });
  }

  updateTable(filter: MyDateFilter) {
    return new Promise<TableData[]>((resolve, reject) => {
      let WialonTimeStampDateFrom = filter.DateFrom.getTime() / 1000 | 0;
      WialonTimeStampDateFrom -= (filter.DateFrom.getTimezoneOffset() * 60 + this.wialonService.wialon.util.DateTime.getTimezoneOffset());
      let WialonTimeStampDateTo = filter.DateTo.getTime() / 1000 | 0;
      WialonTimeStampDateTo -= (filter.DateTo.getTimezoneOffset() * 60 + this.wialonService.wialon.util.DateTime.getTimezoneOffset());
      const filterArray = [];
      let _to = 0;
      let _from = WialonTimeStampDateFrom;
      while (_to < WialonTimeStampDateTo) {
        _to = _from + 3599;
        filterArray.push([_from, _to]);
        _from += 3600;
      }
      let promise = Promise.resolve();
      const result: TableData[] = [];
      filterArray.forEach((subFilter, subIndex) => {
        promise = promise.then(() => this.execMyReport(subFilter).then(data => {
          const _tables = data.getTables();
          const _result = {};
          result[subIndex] = {
            unit_group_engine_hours: [],
            unit_group_trips: []
          };
          _tables.forEach((table, index) => {
            data.getTableRows(index, 0, table.rows, // get Table rows
              (code, rows) => {
                result[subIndex][table.name] = rows;
              });
          });
        }));
      });
      promise.then((data) => {
        resolve(result);
      });
    });
  }

  execMyReport(time) {
    return new Promise<WialonReportResult>((resolve, reject) => {
      const report = this.masterResource.getReport(this.reportId);
      const interval = {'from': time[0], 'to': time[1], 'flags': this.wialonService.wialon.item.MReport.intervalFlag.absolute};
      this.masterResource.execReport(report, 18626632, 0, interval, // execute selected report
        (code, data: WialonReportResult) => { // execReport template
          if (code) {
            reject();
          }
          resolve(data);
        }
      );
    });
  }

}
