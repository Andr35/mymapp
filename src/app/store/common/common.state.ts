
import {Injectable} from '@angular/core';
import {PointProps} from '@app/models/geojson-props';
import {CommonActions} from '@app/store/common/common.actions';
import {FilesystemDirectory, FilesystemEncoding, Plugins} from '@capacitor/core';
import {Platform} from '@ionic/angular';
import {DEFAULT_GEOJSON_DATA} from '@models/default-geojson-data';
import {MapStyle, MAP_DEFAULT_STYLES} from '@models/map-style';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {saveAs} from 'file-saver';

const {Filesystem} = Plugins;

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

  constructor(private platform: Platform) {}

  // Selectors ////////////////////////////////////////////////////////////////////////////////////

  @Selector() static file(state: CommonStateModel) {
    return state.file;
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

      if (isElectron && filePath) {

        await Filesystem.writeFile({
          data: geojsonString,
          path: filePath,
          encoding: FilesystemEncoding.UTF8,
          recursive: true,
          directory: 'DRIVE_ROOT' as FilesystemDirectory,
        });

      } else {

        // Save content in blob
        const geojsonBlob = new Blob([geojsonString], {type: 'application/json'});

        // Downlaod file
        saveAs(geojsonBlob, file?.name ?? 'journeys.json');
      }

    }
  }


  @Action(CommonActions.AddMarker)
  addMarker(ctx: StateContext<CommonStateModel>, {payload: {coordinates, props}}: CommonActions.AddMarker) {

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
        properties: props
      };

      geojson.features = [geojsonPoint, ...geojson.features];

      ctx.patchState({
        geojsonData: geojson,
        currentGeojsonFeature: geojson.features[geojson.features.length - 1] as GeoJSON.Feature<GeoJSON.Geometry, PointProps>
      });
    }

  }

  @Action(CommonActions.UpdateMarker)
  updateMarker(ctx: StateContext<CommonStateModel>, {payload: {featureId, coordinates, props, markerType}}: CommonActions.UpdateMarker) {

    // If geojson does not exist -> no file loaded -> use default
    const geojson = {...(ctx.getState().geojsonData ?? DEFAULT_GEOJSON_DATA)};

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

}
