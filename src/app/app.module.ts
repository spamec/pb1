import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {WialonService} from './services/wialon.service';
import {TableComponent} from './components/table/table.component';
import {HeaderComponent} from './components/header/header.component';
import {MaterialModule} from './material/material.module';
import {DataFilterComponent} from './components/header/data-filter/data-filter.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PipesModule} from './pipes/pipes.module';
import {BlockUIModule} from 'ng-block-ui';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import {registerLocaleData} from '@angular/common';

registerLocaleData(localeEs, 'es-ES', localeEsExtra);

export function init_wialon(wialonService: WialonService) {
  return () => wialonService.initSdk();
}


@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    HeaderComponent,
    DataFilterComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PipesModule,
    BlockUIModule.forRoot()
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: init_wialon, deps: [WialonService], multi: true},
    {provide: LOCALE_ID, useValue: 'es-ES'}

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
