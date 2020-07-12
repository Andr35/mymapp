
import {ErrorAction} from '@app/models/error-action';
import {StoreAction} from '@app/models/store-action';
import {MarkerProps} from '../../models/marker-props';


// tslint:disable-next-line:no-namespace
export namespace CommonActions {

  export class OpenFile extends StoreAction {
    static readonly type = `[Common] Open file`;

    constructor(public payload: {file: File}) {
      super();
    }
  }

  export class SaveFile extends StoreAction {
    static readonly type = `[Common] Save file`;
  }


  export class AddMarker extends StoreAction {
    static readonly type = `[Common] Add marker`;

    constructor(public payload: {coordinates: GeoJSON.Position, props: MarkerProps}) {
      super();
    }
  }

  export class SetCurrentGeojsonFeature extends StoreAction {
    static readonly type = `[Common] Set current geojson feature`;

    constructor(public payload: {geojsonFeature: GeoJSON.Feature<GeoJSON.Geometry> | null}) {
      super();
    }
  }


  export class AppError extends ErrorAction {
    static readonly type = `[Common] Error`;
    readonly error: true = true;

    constructor(public payload: Error) {
      super();
    }
  }


}
