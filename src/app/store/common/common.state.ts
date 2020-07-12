
import {Injectable} from '@angular/core';
import {MarkerProps} from '@app/models/marker-props';
// tslint:disable-next-line:max-line-length
import {CommonActions} from '@app/store/common/common.actions';
import {Plugins} from '@capacitor/core';
import {Platform} from '@ionic/angular';
import {DEFAULT_GEOJSON_DATA} from '@models/default-geojson-data';
import {MapStyle, MAP_DEFAULT_STYLES} from '@models/map-style';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {saveAs} from 'file-saver';

const {} = Plugins;

export interface CommonStateModel {

  file: File | null;
  geojsonData: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry> | null;

  mapStyles: MapStyle[];

  currentGeojsonFeature: GeoJSON.Feature<GeoJSON.Geometry, MarkerProps> | null;

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

  @Selector() static geojsonDataFeatures(state: CommonStateModel): GeoJSON.Feature<GeoJSON.Geometry, MarkerProps>[] {
    return state.geojsonData?.type === 'FeatureCollection' ?
      ((state.geojsonData.features ?? []) as GeoJSON.Feature<GeoJSON.Geometry, MarkerProps>[]) :
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

    if (isElectron) {
      // TODO impl

    } else {

      // Read file
      const contentString = await this.readFile(file);

      if (contentString) {
        const geojsonData = JSON.parse(contentString);
        ctx.patchState({file, geojsonData});
      }

    }

  }

  @Action(CommonActions.SaveFile)
  saveFile(ctx: StateContext<CommonStateModel>, {}: CommonActions.SaveFile) {

    const isElectron = this.platform.is('electron');

    if (isElectron) {
      // TODO impl

    } else {

      const file = ctx.getState().file;
      const geojsonData = ctx.getState().geojsonData;

      if (geojsonData) {
        // Save content in blob
        const geojsonBlob = new Blob([JSON.stringify(geojsonData)], {type: 'application/json'});
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

      const geojsonPoint: GeoJSON.Feature<GeoJSON.Geometry, MarkerProps> = {
        type: 'Feature',
        id: props.id,
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: props
      };

      geojson.features = [...geojson.features, geojsonPoint];

      ctx.patchState({
        geojsonData: geojson,
        currentGeojsonFeature: geojson.features[geojson.features.length - 1] as GeoJSON.Feature<GeoJSON.Geometry, MarkerProps>
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
