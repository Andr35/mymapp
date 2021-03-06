import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {FileManagerComponent} from '@app/components/file-manager/file-manager.component';
import {MapSearchComponent} from '@app/components/map-search/map-search.component';
import {MapFilterComponent} from '@app/components/map-filter/map-filter.component';
import {MapStylesListComponent} from '@app/components/map-styles-list/map-styles-list.component';
import {MapToolbarComponent} from '@app/components/map-toolbar/map-toolbar.component';
import {MarkerDetailsViewComponent} from '@app/components/marker-details-view/marker-details-view.component';
import {SettingsComponent} from '@app/components/settings/settings.component';
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
    MarkerDetailsViewComponent,
    MapStylesListComponent,
    MapSearchComponent,
    SettingsComponent,
    MapFilterComponent,
  ]
})
export class HomePageModule {}
