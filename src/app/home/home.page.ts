import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {CommonState} from '@app/store/common/common.state';
import {environment} from '@env/environment';
import {Select, Store} from '@ngxs/store';
import {GeoJSONSource, GeolocateControl, Map} from 'mapbox-gl';
import RulerControl from 'mapbox-gl-controls/lib/ruler';
import StylesControl from 'mapbox-gl-controls/lib/styles';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements AfterViewInit, OnDestroy {

  private readonly GEOJSON_SOURCE = 'geojsonSource';

  @Select(CommonState.geojsonData)
  geojsonData$: Observable<GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>;

  @ViewChild('mapContainer')
  mapContainer: ElementRef<HTMLDivElement>;

  private map: Map;

  private geolocateCtrl: GeolocateControl;
  public rulerCtrl: RulerControl;
  public stylesCtrl: StylesControl;

  private readonly subscr = new Subscription();

  constructor(private store: Store) {}

  ngAfterViewInit() {

    this.initMap();
    this.initControls();

  }

  // Init /////////////////////////////////////////////////////////////////////////////////////////

  private initMap() {

    // Create the map
    this.map = new Map({
      accessToken: environment.mapboxToken,
      container: this.mapContainer.nativeElement,
      style: this.store.selectSnapshot(CommonState.mapStyles)[0].styleUrl,
      center: [11, 46],
      zoom: 8,
    });


    // Init map
    this.map.on('load', () => {
      this.map.resize();

      // Sources
      this.map.addSource(this.GEOJSON_SOURCE, {type: 'geojson', data: {type: 'FeatureCollection', features: []}});

      // TODO add custom layer
      // this.map.addLayer({
      //   id: 'points',
      //   type: 'symbol',
      //   source: this.GEOJSON_SOURCE,
      //   layout: {
      //     // get the icon name from the source's "icon" property
      //     // concatenate the name to get an icon from the style's sprite sheet
      //     'icon-image': ['concat', ['get', 'icon'], '-15'],
      //     // get the title name from the source's "title" property
      //     'text-field': ['get', 'title'],
      //     'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      //     'text-offset': [0, 0.6],
      //     'text-anchor': 'top',

      //   }
      // });

      // Listen for geojson
      this.subscr.add(
        this.geojsonData$.subscribe(geojson => {
          if (geojson) {
            (this.map.getSource(this.GEOJSON_SOURCE) as GeoJSONSource).setData(geojson as any);
          }
        })
      );

    });

  }

  private initControls() {

    // Geolocate
    this.geolocateCtrl = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: false,
      showAccuracyCircle: true,
    });
    this.map.addControl(this.geolocateCtrl);

    // Ruler
    this.rulerCtrl = new RulerControl();
    this.map.addControl(this.rulerCtrl);

  }


  // Handlers /////////////////////////////////////////////////////////////////////////////////////


  onToggleGeolocation() {
    this.geolocateCtrl.trigger();
  }

  onToggleRuler() {
    if (this.rulerCtrl.isMeasuring) {
      this.rulerCtrl.measuringOff();
    } else {
      this.rulerCtrl.measuringOn();
    }
  }

  onChangeMapStyle(styleUrl: string) {
    this.map.setStyle(styleUrl);
  }


  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

}
