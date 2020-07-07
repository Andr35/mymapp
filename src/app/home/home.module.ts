import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {FileManagerComponent} from '../components/file-manager/file-manager.component';
import {MapToolbarComponent} from '../components/map-toolbar/map-toolbar.component';
import {HomePage} from './home.page';
import {HomePageRoutingModule} from './home.routing';



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    HomePageRoutingModule,
  ],
  declarations: [
    HomePage,

    MapToolbarComponent,
    FileManagerComponent,
  ]
})
export class HomePageModule {}
