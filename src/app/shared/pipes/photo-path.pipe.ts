import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {JourneyPhoto} from '@app/models/geojson-props';
import {CommonState} from '@app/store/common/common.state';
import {FilesystemDirectory, Plugins} from '@capacitor/core';
import {Platform} from '@ionic/angular';
import {Store} from '@ngxs/store';

const {Filesystem} = Plugins;


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

  async transform(value: JourneyPhoto | null | undefined, ...args: [string]): Promise<string | null> {

    if (!value || !value.filePath) {
      const fallbackUrl = args[0];
      return fallbackUrl ?? null;
    }

    if (!this.isElectron) {
      const fallbackUrl = args[0];
      return fallbackUrl ?? null;
    }

    const geojsonFolderPath = this.store.selectSnapshot(CommonState.fileFolderPath);

    const url = `${geojsonFolderPath ?? ''}/${value.filePath}`;

    try {

      const readRes = await Filesystem.readFile({
        path: url,
        directory: 'DRIVE_ROOT' as FilesystemDirectory,
      });

      const photoObjUrl = URL.createObjectURL(new Blob([readRes.data]));

      return photoObjUrl;

    } catch (e) {
      console.error(`Fail to load image at path ${url}. Use fallback. Error: ${e}`);
      const fallbackUrl = args[0];
      return fallbackUrl ?? null;
    }


  }

}
