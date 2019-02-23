import {Injectable} from '@angular/core';
import {WialonService} from './wialon.service';
import {Observable, Subject, of, throwError} from 'rxjs';
import {MyDateFilter} from '../models/my-date-filter';

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

  reportId: number;
  masterResource;

  constructor(private wialonService: WialonService) {
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
          console.log(this.reportId, this.masterResource);
        });
      }
    });

  }

  getObjectData() {
    return new Promise((resolve, reject) => {

      console.log('getObjectData');
      if (!this.wialonService.isLogin) {
        resolve([]);
      }
      const spec_acc = {
        itemsType: 'avl_unit',
        propName: 'sys_name',
        propValueMask: '*',
        sortType: 'sys_name'
      };
      const flags_acc = this.wialonService.wialon.item.Item.dataFlag.base;
      this.wialonService.wialon.core.Session.getInstance().searchItems(spec_acc, true, flags_acc,
        0, 0, this.wialonService.qx.lang.Function.bind(function (code, data) {
          if (code || !data) {
            console.log(('List of units empty.'));
          } else if (!data.items || data.items.length < 1) {
            console.log(('List of units empty.'));
          } else {
            resolve(data.items);
          }
        }, this));
    });
  }

  updateTable(filter: MyDateFilter) {
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
    console.log(filterArray);

    this.execMyReport(filterArray[11]).then(data => {
      console.log(data);
    });

  }

  execMyReport(time) {
    return new Promise((resolve, reject) => {
      const result = [];
      const report = this.masterResource.getReport(this.reportId);
      result[time[0]] = {};
      const interval = {'from': time[0], 'to': time[1], 'flags': this.wialonService.wialon.item.MReport.intervalFlag.absolute};
      this.masterResource.execReport(report, 18626632, 0, interval, // execute selected report
        (code, data) => { // execReport template
          if (code) {
            return;
          }

          resolve(data.getTables());
        }
      );
    });
  }

}
