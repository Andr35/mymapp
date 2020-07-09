
import {Injectable} from '@angular/core';
// tslint:disable-next-line:max-line-length
import {CommonActions} from '@app/store/common/common.actions';
import {Action, Selector, State, StateContext} from '@ngxs/store';

export interface CommonStateModel {

  file: File | null;

  sample: boolean;

  error: Error | null;
}


@State<CommonStateModel>({
  name: 'common',
  defaults: {
    file: null,
    sample: false,
    error: null
  }
})
@Injectable()
export class CommonState {

  // Selectors ////////////////////////////////////////////////////////////////////////////////////

  @Selector() static file(state: CommonStateModel) {
    return state.file;
  }

  @Selector() static sample(state: CommonStateModel) {
    return state.sample;
  }

  @Selector() static error(state: CommonStateModel) {
    return state.error;
  }


  // Actions //////////////////////////////////////////////////////////////////////////////////////

  @Action(CommonActions.OpenFile)
  openFile(ctx: StateContext<CommonStateModel>, {payload: {file}}: CommonActions.OpenFile) {
    ctx.patchState({file});
    // TODO ...
  }

  @Action(CommonActions.SaveFile)
  saveFile(ctx: StateContext<CommonStateModel>, {payload: {}}: CommonActions.SaveFile) {
    // TODO impl
  }

  @Action(CommonActions.Sample)
  sample(ctx: StateContext<CommonStateModel>, {payload: {sample}}: CommonActions.Sample) {
    ctx.patchState({sample});
  }


  @Action(CommonActions.AppError)
  appError(ctx: StateContext<CommonStateModel>, {payload}: CommonActions.AppError) {
    ctx.patchState({
      error: payload
    });
  }

}
