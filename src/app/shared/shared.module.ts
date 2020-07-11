import {NgModule} from '@angular/core';
import {UploadFilesDirective} from './directives/upload-files/upload-files.directive';
import {GetIconPipe} from './pipes/get-icon.pipe';

@NgModule({
  imports: [],
  declarations: [
    GetIconPipe,
    UploadFilesDirective,
  ],
  exports: [
    GetIconPipe,
    UploadFilesDirective,
  ]
})
export class SharedModule {}
