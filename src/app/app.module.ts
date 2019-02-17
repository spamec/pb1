import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import { AppComponent } from './app.component';
import {WialonService} from './services/wialon.service';
import { TestComponent } from './components/test/test.component';
import { HeaderComponent } from './components/header/header.component';

export function init_wialon(wialonService: WialonService) {
  return () => wialonService.initSdk();
}


@NgModule({
  declarations: [
    AppComponent,
    TestComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: init_wialon, deps: [WialonService], multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
