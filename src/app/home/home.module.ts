import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FileManagerComponent} from '@app/components/file-manager/file-manager.component';
import {MapStylesListComponent} from '@app/components/map-styles-list/map-styles-list.component';
import {MapToolbarComponent} from '@app/components/map-toolbar/map-toolbar.component';
import {MarkerDetailsCardComponent} from '@app/components/marker-details-card/marker-details-card.component';
import {SharedModule} from '@app/shared/shared.module';
import {IonicModule} from '@ionic/angular';
import {HomePage} from './home.page';
import {HomePageRoutingModule} from './home.routing';



@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    HomePageRoutingModule,

    SharedModule,
  ],
  declarations: [
    HomePage,

    MapToolbarComponent,
    FileManagerComponent,
    MarkerDetailsCardComponent,
    MapStylesListComponent,
  ]
})
export class HomePageModule {}
