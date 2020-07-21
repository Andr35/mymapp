import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {InputModeComponent} from './components/input-mode/input-mode.component';
import {SimpleTooltipComponent} from './components/simple-tooltip/simple-tooltip.component';
import {TooltipDirective} from './directives/tooltip/tooltip.directive';
import {UploadFilesDirective} from './directives/upload-files/upload-files.directive';
import {GetIconPipe} from './pipes/get-icon.pipe';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    IonicModule,
  ],
  declarations: [
    SimpleTooltipComponent,

    GetIconPipe,
    UploadFilesDirective,
    InputModeComponent,
    TooltipDirective,
  ],
  exports: [
    GetIconPipe,
    UploadFilesDirective,
    InputModeComponent,
    TooltipDirective,
  ]
})
export class SharedModule {}
