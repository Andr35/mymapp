import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {JourneyPhoto} from '@app/models/geojson-props';
import {CommonState} from '@app/store/common/common.state';
import {Platform} from '@ionic/angular';
import {Store} from '@ngxs/store';

@Pipe({
  name: 'photoPath'
})
@Injectable({
  providedIn: 'root'
})
export class PhotoPathPipe implements PipeTransform {

  private readonly isElectron = this.platform.is('electron');

  constructor(
    private store: Store,
    private platform: Platform,
  ) {}

  transform(value: JourneyPhoto | null | undefined, ...args: unknown[]): string | null {

    if (!value || !value.filePath) {
      return null;
    }

    if (!this.isElectron) {
      return null;
    }

    const geojsonFolderPath = this.store.selectSnapshot(CommonState.fileFolderPath);

    return `file://${geojsonFolderPath}/${value.filePath}`;
  }

}
