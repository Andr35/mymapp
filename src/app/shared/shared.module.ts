import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {InputModeComponent} from './components/input-mode/input-mode.component';
import {SimpleTooltipComponent} from './components/simple-tooltip/simple-tooltip.component';
import {TooltipDirective} from './directives/tooltip/tooltip.directive';
import {UploadFilesDirective} from './directives/upload-files/upload-files.directive';
import {GetIconPipe} from './pipes/get-icon.pipe';
import {PhotoPathPipe} from './pipes/photo-path.pipe';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    IonicModule,
  ],
  declarations: [
    SimpleTooltipComponent,

    GetIconPipe,
    PhotoPathPipe,

    UploadFilesDirective,
    TooltipDirective,

    InputModeComponent,
  ],
  exports: [
    GetIconPipe,
    PhotoPathPipe,

    UploadFilesDirective,
    TooltipDirective,

    InputModeComponent,
  ]
})
export class SharedModule {}
