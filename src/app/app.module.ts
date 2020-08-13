import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {ServiceWorkerModule} from '@angular/service-worker';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {environment} from '../environments/environment';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routing';
import {AppStoreModule} from './store/app-store.module';


@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'ios',
    }),
    AppRoutingModule,

    AppStoreModule.forRoot(),

    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
  ],
})
export class AppModule {}
