import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HasPhotoGuard} from './guards/has-photo.guard';
import {ImgViewerPage} from './img-viewer.page';

const routes: Routes = [
  {
    path: '',
    component: ImgViewerPage,
    canActivate: [HasPhotoGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImgViewerPageRoutingModule {}
