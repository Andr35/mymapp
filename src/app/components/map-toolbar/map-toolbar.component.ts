import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HomePage} from '@app/home/home.page';
import {CommonState} from '@app/store/common/common.state';
import {PopoverController} from '@ionic/angular';
import {Store} from '@ngxs/store';
import {MapStylesListComponent} from '../map-styles-list/map-styles-list.component';

@Component({
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapToolbarComponent {

  constructor(
    public home: HomePage,
    public popoverCtrl: PopoverController,
    public store: Store,
  ) {}


  async toggleMapStylesPopover(event: Event) {

    const popover = await this.popoverCtrl.create({
      component: MapStylesListComponent,
      componentProps: {
        mapStyles$: this.store.select(CommonState.mapStyles)
      },
      event,
      translucent: true
    });
    await popover.present();

    const {data} = await popover.onWillDismiss();
    if (data) {
      this.home.onChangeMapStyle(data);
    }
  }

}
