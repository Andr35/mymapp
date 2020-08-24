import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {JourneyPhoto} from '@app/models/geojson-props';
import {Platform} from '@ionic/angular';

// const {Filesystem} = Plugins;


@Pipe({
  name: 'photoPath'
})
@Injectable({
  providedIn: 'root'
})
export class PhotoPathPipe implements PipeTransform {

  private readonly isElectron = this.platform.is('electron');

  constructor(
    // private store: Store,
    private platform: Platform,
  ) {}

  async transform(value: JourneyPhoto | null | undefined, ...args: [string]): Promise<string | null> {
    const fallbackUrl = args[0];

    if (!value || !value.filePath) {
      return fallbackUrl ?? null;
    }

    if (!this.isElectron) {
      return fallbackUrl ?? null;
    }

    return fallbackUrl ?? null;


    // TODO load image from file system is too expensive

    // const geojsonFolderPath = this.store.selectSnapshot(CommonState.fileFolderPath);

    // const url = `${geojsonFolderPath ?? ''}/${value.filePath}`;

    // try {

    //   const readRes = await Filesystem.readFile({
    //     path: url,
    //     directory: 'DRIVE_ROOT' as FilesystemDirectory,
    //   });

    //   const photoObjUrl = URL.createObjectURL(new Blob([readRes.data]));

    //   return photoObjUrl;

    // } catch (e) {
    //   console.error(`Fail to load image at path ${url}. Use fallback. Error: ${e}`);
    //   return fallbackUrl ?? null;
    // }


  }

}
