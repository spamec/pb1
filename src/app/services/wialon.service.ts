import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

const getInteger = (value: number | string) => {
  if (typeof value === 'string') {
    return parseInt(value, 10);
  } else if (typeof value === 'number') {
    return (value > 0) ? Math.floor(value) : Math.ceil(value);
  }
};

@Injectable({
  providedIn: 'root'
})
export class WialonService {


  constructor() {
    this.wialon = window['wialon'];
    this.wialon.core.Session.getInstance().loadLibrary('resourceReports');
    this.wialon.core.Session.getInstance().loadLibrary('unitReportSettings');
    this.wialon.core.Session.getInstance().loadLibrary('resourceDrivers');
    this.qx = window['qx'];
  }

  wialon: any;
  qx: any;
  _isLogin: boolean;

  set isLogin(value) {
    this._isLogin = !value;
    if (this._isLogin) {
      console.log('%c Wialon: Successful login! ', 'background: #33a553; color: #fff; font-size:14px;');
    } else {
      console.warn('%c Wialon: Login error! ', 'background: #a53238; color: #fff; font-size:14px;');
    }
  }

  get isLogin() {
    return !!this._isLogin;
  }

  private static getHtmlVar(name) {
    if (!name) {
      return null;
    }
    const pairs = decodeURIComponent(document.location.search.substr(1)).split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      if (pair[0] === name) {
        pair.splice(0, 1);
        return pair.join('=');
      }
    }
    return null;
  }


  fillTimezoneInfo() {
    const minutes = getInteger(this.wialon.util.DateTime.getTimezoneOffset() % (3600) / 60);
    const hours = getInteger(this.wialon.util.DateTime.getTimezoneOffset() / 3600);
    let plus = (hours > 0) ? '+' : '-';
    if (hours === 0) {
      plus = (minutes >= 0) ? '+' : '-';
    }
    return `UTC ${plus} ${
      (Math.abs(hours) < 10)
        ? '0' + Math.abs(hours)
        : Math.abs(hours)
      }:${
      (Math.abs(minutes) < 10)
        ? '0' + Math.abs(minutes)
        : Math.abs(minutes)}`;
  }

  initSdk() {
    console.log('initSdk');
    return new Promise((resolve, reject) => {
      const url = WialonService.getHtmlVar('baseUrl') || WialonService.getHtmlVar('hostUrl') || 'https://hst-api.wialon.com';
      const user = WialonService.getHtmlVar('user_name') || '';
      this.wialon.core.Session.getInstance().initSession(url);

      const hash = WialonService.getHtmlVar('access_hash');
      const token = WialonService.getHtmlVar('access_token') || environment.token ? environment.token : '';
      const sid = WialonService.getHtmlVar('sid');

      if (hash) {
        if (!sid) {
          this.wialon.core.Session.getInstance().loginAuthHash(hash, this.qx.lang.Function.bind(this.addSid, this));
        }
      } else if (sid) {
        this.wialon.core.Session.getInstance().duplicate(sid, user, true, this.qx.lang.Function.bind((code) => {
          (this.login(code)) ? resolve(true) : reject('Auth failed');
        }, this));
      } else if (token) {
        this.wialon.core.Session.getInstance().loginToken(token, this.qx.lang.Function.bind(this.addSid, this));
      } else {
        reject('Auth failed');
      }
    });

  }

  private addSid(code) {
    if (code) {
      return;
    }
    const sid = this.wialon.core.Session.getInstance().getId();
    const user = this.wialon.core.Session.getInstance().getCurrUser().getName();

    const pathArray = window.location.href.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const url = protocol + '//' + host;
    window.location.href = window.location.href + '?sid=' + sid + '&user_name=' + user;
  }

  private login(code) {
    this.isLogin = !!code;
    return this.isLogin;
  }
}
