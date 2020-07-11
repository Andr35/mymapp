/*!
 * Copyright 2019 Fondazione Bruno Kessler
 * Licensed under the EUPL, Version 1.1 or - as soon they will be approved by the European
 * Commission - subsequent versions of the EUPL (the "Licence"); You may not use this work
 * except in compliance with the Licence.
 *
 * You may obtain a copy of the Licence at:
 * http://ec.europa.eu/idabc/eupl.html
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the Licence is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the Licence for the specific language
 * governing permissions and limitations under the Licence.
 */

import {Directive, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appUploadFiles]'
})
export class UploadFilesDirective {

  @Output()
  filesUpload: EventEmitter<FileList> = new EventEmitter();

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {

    const dataTransfer = this.getDataTransfer(event);

    if (!dataTransfer) {
      return;
    }

    this.preventEventAndStop(event);
    this.filesUpload.emit(dataTransfer.files);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    this.preventEventAndStop(event);
  }

  private getDataTransfer(event: DragEvent): DataTransfer {
    return event.dataTransfer ? event.dataTransfer : (event as any).originalEvent.dataTransfer;
  }

  private preventEventAndStop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

}
