
import {ErrorAction} from '@app/models/error-action';
import {StoreAction} from '@app/models/store-action';


// tslint:disable-next-line:no-namespace
export namespace CommonActions {

  export class Sample extends StoreAction {
    static readonly type = `[Common] Sample`;

    constructor(public payload: {sample: boolean}) {
      super();
    }
  }

  export class OpenFile extends StoreAction {
    static readonly type = `[Common] Open file`;

    constructor(public payload: {file: File}) {
      super();
    }
  }

  export class SaveFile extends StoreAction {
    static readonly type = `[Common] Save file`;
  }

  export class AppError extends ErrorAction {
    static readonly type = `[Common] Error`;
    readonly error: true = true;

    constructor(public payload: Error) {
      super();
    }
  }


}
