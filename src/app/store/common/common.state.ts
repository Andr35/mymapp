
import {Injectable} from '@angular/core';
import {PointProps} from '@app/models/geojson-props';
import {CommonActions} from '@app/store/common/common.actions';
import {FilesystemDirectory, FilesystemEncoding, Plugins} from '@capacitor/core';
import {Platform, ToastController} from '@ionic/angular';
import {DEFAULT_GEOJSON_DATA} from '@models/default-geojson-data';
import {MapStyle, MAP_DEFAULT_STYLES} from '@models/map-style';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {getYear} from 'date-fns';
import {saveAs} from 'file-saver';

const {Filesystem} = Plugins;


const PHOTOS_FOLDER_NAME = `catalog`;

export interface CommonStateModel {

  file: File | null;
  geojsonData: GeoJSON.FeatureCollection<GeoJSON.Geometry, PointProps> | null;

  mapStyles: MapStyle[];

  currentGeojsonFeature: GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null;

  error: Error | null;
}


@State<CommonStateModel>({
  name: 'common',
  defaults: {
    file: null,
    geojsonData: null,

    mapStyles: MAP_DEFAULT_STYLES,

    currentGeojsonFeature: null,

    error: null
  }
})
@Injectable()
export class CommonState {

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
  ) {}

  private static toFolderPath(file: File | null): string | null {

    const arr: string[] | undefined = ((file as any)?.path as string)?.split('/');
    return arr?.slice(0, arr.length - 1).join('/') ?? null;
  }

  // Selectors ////////////////////////////////////////////////////////////////////////////////////

  @Selector() static file(state: CommonStateModel) {
    return state.file;
  }

  @Selector() static fileFolderPath(state: CommonStateModel): string | null {
    return this.toFolderPath(state.file);
  }

  @Selector() static geojsonData(state: CommonStateModel) {
    return state.geojsonData;
  }

  @Selector() static geojsonDataFeatures(state: CommonStateModel): GeoJSON.Feature<GeoJSON.Geometry, PointProps>[] {
    return state.geojsonData?.type === 'FeatureCollection' ?
      ((state.geojsonData.features ?? []) as GeoJSON.Feature<GeoJSON.Geometry, PointProps>[]) :
      [];
  }

  @Selector() static mapStyles(state: CommonStateModel) {
    return state.mapStyles;
  }

  @Selector() static currentGeojsonFeature(state: CommonStateModel) {
    return state.currentGeojsonFeature;
  }

  @Selector() static error(state: CommonStateModel) {
    return state.error;
  }


  // Actions //////////////////////////////////////////////////////////////////////////////////////

  @Action(CommonActions.OpenFile)
  async openFile(ctx: StateContext<CommonStateModel>, {payload: {file}}: CommonActions.OpenFile) {

    // TODO handle errors

    const isElectron = this.platform.is('electron');
    const filePath: string | undefined = (file as any).path;

    let contentString: string | null | undefined;

    if (isElectron && filePath) {

      // File contains path field -> use it to read file
      const readRes = await Filesystem.readFile({
        path: filePath,
        directory: 'DRIVE_ROOT' as FilesystemDirectory,
        encoding: FilesystemEncoding.UTF8
      });
      contentString = readRes.data;
    } else {
      // Read file
      contentString = await this.readFile(file);
    }

    if (contentString) {
      const geojsonData = JSON.parse(contentString);
      ctx.patchState({file, geojsonData});
    }

  }

  @Action(CommonActions.SaveFile)
  async saveFile(ctx: StateContext<CommonStateModel>, {}: CommonActions.SaveFile) {

    // TODO handle errors

    const file = ctx.getState().file;
    const geojsonData = ctx.getState().geojsonData;

    const isElectron = this.platform.is('electron');
    const filePath: string | undefined = (file as any)?.path;

    if (geojsonData) {

      const geojsonString = JSON.stringify(geojsonData);

      if (isElectron) {

        if (filePath) { // File already esits

          await Filesystem.writeFile({
            data: geojsonString,
            path: filePath,
            encoding: FilesystemEncoding.UTF8,
            recursive: true,
            directory: 'DRIVE_ROOT' as FilesystemDirectory,
          });

        } else { // File never saved (does not exists) -> first time

          // Save content in blob
          const geojsonBlob = new Blob([geojsonString], {type: 'application/json'});
          // Downlaod file
          saveAs(geojsonBlob, file?.name ?? 'my-mapp.json');

          const toast = await this.toastCtrl.create({
            message: 'Please, after saving, open again the file you just saved...',
            color: 'primary',
            buttons: [{text: 'Ok'}]
          });
          toast.present();

        }

      } else {

        // Save content in blob
        const geojsonBlob = new Blob([geojsonString], {type: 'application/json'});
        // Downlaod file
        saveAs(geojsonBlob, file?.name ?? 'my-mapp.json');

      }

    }
  }

  @Action(CommonActions.CloseFile)
  async closeFile(ctx: StateContext<CommonStateModel>, {}: CommonActions.CloseFile) {

    if (ctx.getState().file || ctx.getState().geojsonData) {

      ctx.patchState({
        file: null,
        geojsonData: null,

        currentGeojsonFeature: null,

        error: null
      });

    }

  }


  @Action(CommonActions.AddMarker)
  async addMarker(ctx: StateContext<CommonStateModel>, {payload: {coordinates, props}}: CommonActions.AddMarker) {

    // If geojson does not exist -> no file loaded -> use default
    const geojson = {...(ctx.getState().geojsonData ?? DEFAULT_GEOJSON_DATA)};

    if (geojson.type === 'FeatureCollection') {

      const geojsonPoint: GeoJSON.Feature<GeoJSON.Point, PointProps> = {
        type: 'Feature',
        id: props.id,
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: await this.syncPhotoFile(ctx, props)
      };

      geojson.features = [geojsonPoint, ...geojson.features];

      ctx.patchState({
        geojsonData: geojson,
        currentGeojsonFeature: geojson.features[0]
      });
    }

  }

  @Action(CommonActions.UpdateMarker)
  async updateMarker(
    ctx: StateContext<CommonStateModel>,
    {payload: {featureId, coordinates, props, markerType}}: CommonActions.UpdateMarker
  ) {

    // If geojson does not exist -> no file loaded -> use default
    const geojson = {...(ctx.getState().geojsonData ?? DEFAULT_GEOJSON_DATA)};

    if (props) {
      props = await this.syncPhotoFile(ctx, props);
    }

    if (geojson.type === 'FeatureCollection') {

      // Search for marker to update
      geojson.features = geojson.features.map(feature => {

        if (feature.id !== featureId) {
          return feature;
        }

        let updatedProps = props ?? feature.properties;

        if (markerType) {
          updatedProps = {...updatedProps, type: markerType};
        }

        // Found marker to update -> update it!
        return {
          ...feature,
          properties: updatedProps,
          geometry: coordinates ? {type: 'Point', coordinates} : feature.geometry,
        };


      });

      let currentGeojsonFeature = ctx.getState().currentGeojsonFeature;

      if (currentGeojsonFeature?.id === featureId) {
        // Update data in store about current selected geojecon feature
        currentGeojsonFeature = geojson.features.find(f => f.id === featureId) ?? null;
      }

      ctx.patchState({
        geojsonData: geojson,
        currentGeojsonFeature
      });
    }

  }

  @Action(CommonActions.RemoveMarker)
  removeMarker(ctx: StateContext<CommonStateModel>, {payload: {featureId}}: CommonActions.RemoveMarker) {

    const geojson = ctx.getState().geojsonData;

    if (geojson?.type === 'FeatureCollection') {

      const updatedGeojson: GeoJSON.FeatureCollection<GeoJSON.Geometry, PointProps> = {
        ...geojson,
        features: geojson.features.filter(f => f.id !== featureId)
      };

      const current = ctx.getState().currentGeojsonFeature;

      ctx.patchState({
        geojsonData: updatedGeojson,
        // Unset current feature if was removed
        currentGeojsonFeature: current?.id === featureId ? null : current
      });
    }

  }

  @Action(CommonActions.SetCurrentGeojsonFeature)
  setCurrentGeojsonFeature(ctx: StateContext<CommonStateModel>, {payload: {geojsonFeature}}: CommonActions.SetCurrentGeojsonFeature) {

    ctx.patchState({
      currentGeojsonFeature: geojsonFeature
    });

  }


  @Action(CommonActions.AppError)
  appError(ctx: StateContext<CommonStateModel>, {payload}: CommonActions.AppError) {
    ctx.patchState({
      error: payload
    });
  }


  readFile(file: File): Promise<string | null | undefined> {
    return new Promise<string | null | undefined>((resolve, reject) => {

      // Check if the file is an image.
      if (file.type !== 'application/json') {
        return reject({msg: `File is not a json (type: ${file.type})`, err: null});
      }

      const reader = new FileReader();
      reader.addEventListener('load', (event) => resolve(event?.target?.result as string));
      reader.addEventListener('error', (event) => reject({msg: `Fail to read file`, err: event}));

      reader.readAsText(file);
    });
  }


  private async syncPhotoFile(ctx: StateContext<CommonStateModel>, props: PointProps): Promise<PointProps> {

    if (!this.platform.is('electron')) {
      return props;
    }

    const geojsonFolderPath = CommonState.toFolderPath(ctx.getState().file);
    if (!geojsonFolderPath) {
      return props;
    }


    if (props.journeys) {
      for (const journey of props.journeys) {

        if (journey.photos) {
          for (let j = 0; j < journey.photos.length; j++) {
            const photo = journey.photos[j];

            if (photo.filePath && !photo.filePath.startsWith(PHOTOS_FOLDER_NAME)) {
              // Photo needs to be copied

              const folderRelativePath = this.calcPhotoFolderRelativePath(journey.date);
              const photoRelativePath = `${folderRelativePath}/${photo.filename}`;
              const absolutePath = `${geojsonFolderPath}/${photoRelativePath}`;

              await this.mkdirFolder(ctx, `${geojsonFolderPath}/${folderRelativePath}`);

              //  Copy
              await Filesystem.copy({
                from: photo.filePath,
                to: absolutePath,
                directory: 'DRIVE_ROOT' as FilesystemDirectory,
              });

              // Update path
              photo.filePath = photoRelativePath;

              journey.photos[j] = photo;
            }

          }
        }

      }
    }

    return props;
  }


  private async mkdirFolder(ctx: StateContext<CommonStateModel>, folderPath: string): Promise<void> {

    let folderExists = false;
    try {
      const stat = await Filesystem.stat({
        path: folderPath,
        directory: 'DRIVE_ROOT' as FilesystemDirectory,
      });
      folderExists = !!stat;
    } catch (e) {
      folderExists = false;
    }

    if (!folderExists) {
      await Filesystem.mkdir({
        path: folderPath,
        directory: 'DRIVE_ROOT' as FilesystemDirectory,
        recursive: true
      });
    }

  }

  private calcPhotoFolderRelativePath(date: string): string | null {
    const year = getYear(new Date(date));
    return `${PHOTOS_FOLDER_NAME}/${year}`;
  }

}
