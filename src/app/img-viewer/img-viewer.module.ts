import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '@app/shared/shared.module';
import {IonicModule} from '@ionic/angular';
import {ImgViewerPage} from './img-viewer.page';
import {ImgViewerPageRoutingModule} from './img-viewer.routing';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ImgViewerPageRoutingModule,

    SharedModule,
  ],
  declarations: [
    ImgViewerPage,
  ]
})
export class ImgViewerPageModule {}
