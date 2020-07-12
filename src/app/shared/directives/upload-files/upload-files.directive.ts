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
