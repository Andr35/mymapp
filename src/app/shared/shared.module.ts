import {NgModule} from '@angular/core';
import {GetIconPipe} from './pipes/get-icon.pipe';

@NgModule({
  imports: [],
  declarations: [
    GetIconPipe,
  ],
  exports: [
    GetIconPipe,
  ]
})
export class SharedModule {}
