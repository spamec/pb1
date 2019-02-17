import {Injectable} from '@angular/core';
import {WialonService} from './wialon.service';
import {Observable, Subject, of, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ObjectsService {

  constructor(private wialonService: WialonService) {
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

}
