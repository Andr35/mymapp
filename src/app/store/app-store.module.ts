import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonState} from '@app/store/common/common.state';
import {environment} from '@env/environment';
import {NgxsActionsExecutingModule} from '@ngxs-labs/actions-executing';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import {NgxsModule, NoopNgxsExecutionStrategy} from '@ngxs/store';

@NgModule({
  imports: [
    // Setup store
    NgxsModule.forRoot(
      [CommonState],
      {
        developmentMode: !environment.production,
        executionStrategy: NoopNgxsExecutionStrategy,
      },
    ),

    NgxsActionsExecutingModule.forRoot(),

    // Setup dev tools only in dev environment
    environment.production ? [] : NgxsReduxDevtoolsPluginModule.forRoot()
  ]
})
export class AppStoreModule {
  static forRoot(): ModuleWithProviders<AppStoreModule> {
    return {
      ngModule: AppStoreModule
    };
  }
}
