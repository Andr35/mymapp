import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {FileManagerComponent} from '../components/file-manager/file-manager.component';
import {MapToolbarComponent} from '../components/map-toolbar/map-toolbar.component';
import {SharedModule} from '../shared/shared.module';
import {HomePage} from './home.page';
import {HomePageRoutingModule} from './home.routing';



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    HomePageRoutingModule,

    SharedModule,
  ],
  declarations: [
    HomePage,

    MapToolbarComponent,
    FileManagerComponent,
  ]
})
export class HomePageModule {}
