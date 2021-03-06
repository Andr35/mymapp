import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {JourneyType} from '@app/models/geojson-props';
import {ADD_MARKER_TOOLS} from '@app/models/marker-types';
import {MapService} from '@app/service/map.service';
import {MarkerService} from '@app/service/marker.service';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {PopoverController} from '@ionic/angular';
import {Store} from '@ngxs/store';
import {MapMouseEvent, MapTouchEvent} from 'mapbox-gl';
import {Subscription} from 'rxjs';
import {filter, first} from 'rxjs/operators';
import {MapStylesListComponent} from '../map-styles-list/map-styles-list.component';


@Component({
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapToolbarComponent implements OnInit, OnDestroy {

  readonly ADD_MARKER_TOOLS = ADD_MARKER_TOOLS;

  /**
   * Compass icon is rotated of 45deg
   */
  readonly BEARING_ICON_COMPENSATION = -45;

  /**
   * Map compass position.
   */
  bearing = 0;

  currentAddMarkerToolType: JourneyType | null = null;

  searchbarVisible = false;
  filterbarVisible = false;

  private readonly subscr = new Subscription();

  private readonly addMarkerCallback: (ev: MapMouseEvent | MapTouchEvent) => void = (ev) => {

    const markerType = this.currentAddMarkerToolType;

    // Disable tool
    this.toggleAddMarkerTool(null);

    if (markerType) {
      // Add new marker
      this.store.dispatch(new CommonActions.AddMarker({
        coordinates: ev.lngLat.toArray(),
        props: this.markerService.preparePointProps(markerType)
      }));
    }

  }

  private readonly pitchCallback: (ev: MapMouseEvent | MapTouchEvent) => void = (ev) => {
    this.bearing = this.mapService.map.getBearing();
    this.cd.markForCheck();
  }

  constructor(
    public mapService: MapService,
    private popoverCtrl: PopoverController,
    private store: Store,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef,
    private markerService: MarkerService,
  ) {}


  ngOnInit() {
    this.subscr.add(
      this.mapService.mapReady$.pipe(filter(r => r), first()).subscribe(ready => {
        if (ready) {
          this.mapService.map.on('pitch', this.pitchCallback);
        }
      })
    );
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
      this.mapService.changeMapStyle(data);
    }
  }

  toggleAddMarkerTool(markerType: JourneyType | null) {
    this.currentAddMarkerToolType = markerType;

    if (this.currentAddMarkerToolType) {
      this.mapService.map.on('click', this.addMarkerCallback);
      this.renderer.addClass(this.mapService.map.getCanvasContainer(), 'app-map-clickable');
    } else {
      this.mapService.map.off('click', this.addMarkerCallback);
      this.renderer.removeClass(this.mapService.map.getCanvasContainer(), 'app-map-clickable');
    }

    this.cd.markForCheck();
  }

  onResetBearing() {
    this.mapService.map.setBearing(0);
    this.bearing = 0;
  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
    this.mapService.map.off('pitch', this.pitchCallback);
  }

}
