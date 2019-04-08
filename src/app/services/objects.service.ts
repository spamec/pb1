import {Injectable} from '@angular/core';
import {WialonService} from './wialon.service';
import {MyDateFilter} from '../models/my-date-filter';
import {WialonReportResult} from '../models/wialon-report-result';
import {TableData} from '../models/table-data';
import {Subject} from 'rxjs';
import {BlockUIService} from 'ng-block-ui';
import {BlockNames} from '../block-names.enum';

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
  DateTo: Date;

  blockUIQuence = [];

  reportId: number;
  masterResource;
  private _objectIdListSubject = new Subject<any[]>();
  private _driverListSubject = new Subject<any[]>();

  constructor(private wialonService: WialonService, private blockUIService: BlockUIService) {
    this.getObjectData();
    console.log('constructor');
    this.blockUIService.start(BlockNames.MainBlock, 'Initialise, please wait...');
    this.blockUIQuence.push(true);
    const spec_resource = {
      itemsType: 'avl_resource',
      propName: 'sys_name',
      propValueMask: '*',
      sortType: 'sys_name'
    };
    const flags_resource =
      wialonService.wialon.item.Item.dataFlag.base
      | wialonService.wialon.item.Resource.dataFlag.reports
      | wialonService.wialon.item.Resource.dataFlag.drivers;

    wialonService.wialon.core.Session.getInstance().searchItems(spec_resource, true, flags_resource, 0, 0, (code, data) => {
      if (code === 0 && data && data.items && data.items.length > 0) {
        let reports: IReport[];


        data.items.forEach((item) => {
          if (item && !this.masterResource) {
            reports = Object.values(item.getReports() || {});
            if (!this.reportId) {
              this.reportId = (reports.find(report => report.n === REPORT_NAME) || {id: 0}).id;
            }
            if (!!this.reportId) {
              this.masterResource = (this.reportId) ? item : this.masterResource;
              this.driverList = item.getDrivers() || {};
              this.blockUIQuence.shift();
              if (this.blockUIQuence.length === 0) {
                console.log('by driverList');
                this.blockUIService.stop(BlockNames.MainBlock);
              }
            }
          }

        });

        if (!this.reportId) {
          const reportName = prompt(`Report ${REPORT_NAME} not found.`, REPORT_NAME);
          localStorage.setItem('reportName', reportName);
          window.location.reload();
        }
      }
    });

  }

  private _objectIdList: any[];

  get objectIdList() {
    return this._objectIdList.map(value => value.getId());
  }

  set objectIdList(value) {
    this._objectIdList = (value);
    this._objectIdListSubject.next(value);
  }

  private _driverList: any[];

  get driverList() {
    return this._driverList;
  }

  set driverList(value) {
    const _value = Object.keys(value).map(key => value[key]);
    this._driverList = (_value);
    this._driverListSubject.next(_value);
  }

  getObjectData() {
    console.log('getObjectData');
    this.blockUIQuence.push(true);
    this.blockUIService.start(BlockNames.MainBlock, 'Initialise, please wait...');

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
          this.objectIdList = data.items;
          this.blockUIQuence.shift();
          if (this.blockUIQuence.length === 0) {
            console.log('by objectIdList');
            this.blockUIService.stop(BlockNames.MainBlock);
          }

        }
      });
  }

  updateTable(filter: MyDateFilter) {
    this.DateTo = filter.DateTo;

    return new Promise<TableData[]>((resolve, reject) => {
      this.blockUIService.start(BlockNames.MainBlock, 'Execute Wialon reports...');
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
          this.blockUIService.start(BlockNames.MainBlock, `Execute Wialon reports...${subIndex + 1}/${filterArray.length}`);

          const _tables = data['reportResult']['tables'];
          result[subIndex] = {
            unit_group_engine_hours: [],
            unit_group_trips: []
          };
          _tables.forEach((table, index) => {
            this.wialonService.wialon.core.Remote.getInstance().remoteCall('report/select_result_rows', {
                'tableIndex': index,
                'config': {'type': 'range', 'data': {'from': 0, 'to': table.rows, 'level': 0}}
              },
              // data.getTableRows(index, 0, table.rows, // get Table rows
              (code, rows) => {
                result[subIndex][table.name] = rows;
              });
          });
        }));
      });
      promise.then((data) => {
        this.blockUIService.stop(BlockNames.MainBlock);
        resolve(result);
      });
    });
  }

  execMyReport(time) {
    return new Promise<WialonReportResult>((resolve, reject) => {
      const report = this.masterResource.getReport(this.reportId);
      console.log(report);
      const interval = {'from': time[0], 'to': time[1], 'flags': this.wialonService.wialon.item.MReport.intervalFlag.absolute};
      const params = {
        'reportResourceId': this.masterResource.getId(),
        'reportTemplateId': report.id,
        'reportTemplate': null,
        'reportObjectId': this.objectIdList[0],
        'reportObjectSecId': 0,
        'interval': interval,
        'reportObjectIdList': this.objectIdList
      };

      this.wialonService.wialon.core.Remote.getInstance().remoteCall('report/exec_report', params,
        // this.masterResource.execReport(report, 18626632, 0, interval, // execute selected report
        (code, data: WialonReportResult) => { // execReport template
          if (code) {
            reject();
          }
          resolve(data);
        }
      );
    });
  }

  getObjectList() {
    return this._objectIdListSubject;
  }

  getDriverList() {
    return this._driverListSubject;
  }
}
