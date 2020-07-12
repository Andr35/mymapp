
import {Injectable} from '@angular/core';
// tslint:disable-next-line:max-line-length
import {CommonActions} from '@app/store/common/common.actions';
import {DEFAULT_GEOJSON_DATA} from '@models/default-geojson-data';
import {MapStyle, MAP_DEFAULT_STYLES} from '@models/map-style';
import {Action, Selector, State, StateContext} from '@ngxs/store';
import {v4 as uuidv4} from 'uuid';

// const {Filesystem} = Plugins;

export interface CommonStateModel {

  file: File | null;
  geojsonData: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry> | null;

  mapStyles: MapStyle[];

  currentGeojsonFeature: GeoJSON.Feature<GeoJSON.Geometry> | null;

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

  // Selectors ////////////////////////////////////////////////////////////////////////////////////

  @Selector() static file(state: CommonStateModel) {
    return state.file;
  }

  @Selector() static geojsonData(state: CommonStateModel) {
    return state.geojsonData;
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

    // Read file
    const contentString = await this.readFile(file);

    if (contentString) {
      const geojsonData = JSON.parse(contentString);
      ctx.patchState({file, geojsonData});
    }

  }

  @Action(CommonActions.SaveFile)
  saveFile(ctx: StateContext<CommonStateModel>, {payload: {}}: CommonActions.SaveFile) {
    // TODO impl
  }


  @Action(CommonActions.AddMarker)
  addMarker(ctx: StateContext<CommonStateModel>, {payload: {coordinates, props}}: CommonActions.AddMarker) {

    // If geojson does not exist -> no file loaded -> use default
    const geojson = {...(ctx.getState().geojsonData ?? DEFAULT_GEOJSON_DATA)};

    if (geojson.type === 'FeatureCollection') {

      const geojsonPoint: GeoJSON.Feature<GeoJSON.Geometry> = {
        type: 'Feature',
        id: uuidv4(),
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: props
      };

      geojson.features = [...geojson.features, geojsonPoint];

      ctx.patchState({
        geojsonData: geojson,
        currentGeojsonFeature: geojson.features[geojson.features.length - 1]
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
