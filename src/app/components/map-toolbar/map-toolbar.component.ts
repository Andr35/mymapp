import {ChangeDetectionStrategy, Component, Renderer2} from '@angular/core';
import {HomePage} from '@app/home/home.page';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {PopoverController} from '@ionic/angular';
import {Store} from '@ngxs/store';
import {MapMouseEvent, MapTouchEvent} from 'mapbox-gl';
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
    public renderer: Renderer2,
  ) {}

  addMarkerToolStatus = false;

  private readonly addMarkerCallback: (ev: MapMouseEvent | MapTouchEvent) => void = (ev) => {

    this.store.dispatch(new CommonActions.AddMarker({
      coordinates: ev.lngLat.toArray(),
      props: {
        type: 'mountain',
        title: '',
        journeys: []
      }
    }));

  }


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

  toggleAddMarkerTool() {
    this.addMarkerToolStatus = !this.addMarkerToolStatus;

    if (this.addMarkerToolStatus) {
      this.home.map.on('click', this.addMarkerCallback);
      this.renderer.addClass(this.home.map.getCanvasContainer(), 'app-map-clickable');
    } else {
      this.home.map.off('click', this.addMarkerCallback);
      this.renderer.removeClass(this.home.map.getCanvasContainer(), 'app-map-clickable');
    }
  }

}
