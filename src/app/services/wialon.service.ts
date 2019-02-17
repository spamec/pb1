import {Injectable} from '@angular/core';
import {environment} from '../../../../pablo1/src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WialonService {


  constructor() {
    this.wialon = window['wialon'];
    this.qx = window['qx'];
    // this.initSdk().then(() => {
    //   console.log('%c Init WialonSDK Success! ', 'background: #333; color: #bada55');
    // }).catch(e => console.error(e));

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

  private static loginErrConsole() {

  }

  initSdk() {
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
        WialonService.loginErrConsole();
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
