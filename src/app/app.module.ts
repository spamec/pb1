import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {WialonService} from './services/wialon.service';
import {TableComponent} from './components/table/table.component';
import {HeaderComponent} from './components/header/header.component';
import {MaterialModule} from './material/material.module';
import {DataFilterComponent} from './components/header/data-filter/data-filter.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TimeOfDayPipe } from './pipes/time-of-day.pipe';
import {PipesModule} from './pipes/pipes.module';

export function init_wialon(wialonService: WialonService) {
  return () => wialonService.initSdk();
}


@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    HeaderComponent,
    DataFilterComponent

    // TableFilterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PipesModule
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: init_wialon, deps: [WialonService], multi: true}

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
