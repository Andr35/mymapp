import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {PointProps} from '@app/models/geojson-props';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {environment} from '@env/environment';
import {DEFAULT_GEOJSON_DATA} from '@models/default-geojson-data';
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

  // Data /////////////////////////////////////////////////////////////////////////////////////////

  private readonly GEOJSON_SOURCE = 'geojsonSource';
  private readonly GEOJSON_LAYER = 'geojsonSourceLayer';

  private readonly MAP_MARKERS_DATA: {name: string; url: string}[] = [
    {name: 'marker-journey', url: `assets/markers/marker-journey.svg`},
    {name: 'marker-mountain', url: `assets/markers/marker-mountain.svg`},
    {name: 'marker-bike', url: `assets/markers/marker-bike.svg`},
    {name: 'marker-sky', url: `assets/markers/marker-sky.svg`},
  ];

  @Select(CommonState.geojsonData)
  geojsonData$: Observable<GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>;

  @Select(CommonState.currentGeojsonFeature)
  currentGeojsonFeature$: Observable<GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null>;

  // Template elems ///////////////////////////////////////////////////////////////////////////////

  @ViewChild('mapContainer')
  mapContainer: ElementRef<HTMLDivElement>;

  // Mapbox ///////////////////////////////////////////////////////////////////////////////////////

  public map: Map;

  private geolocateCtrl: GeolocateControl;
  public rulerCtrl: RulerControl;
  public stylesCtrl: StylesControl;

  // Others ///////////////////////////////////////////////////////////////////////////////////////

  /**
   * Flag to prevent "generic" map click action. Typically should be set to true if a feature
   * or something else which is not a generic point on the map is clicked.
   */
  private preventMapClick = false;

  private readonly subscr = new Subscription();

  private readonly styleDataCallback = () => {

    // Once called -> turn off
    this.map.off('styledata', this.styleDataCallback);

    // Images, Layers and Sources are all removed -> re-add them
    this.updateMapSource(this.store.selectSnapshot(CommonState.geojsonData) ?? DEFAULT_GEOJSON_DATA);
    this.initImages();
    this.initLayers();

  }

  constructor(
    private store: Store,
    // private modalCtrl: ModalController,
  ) {}

  ngAfterViewInit() {

    this.initMap();
    this.initImages();
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

      // Init source
      this.updateMapSource(DEFAULT_GEOJSON_DATA);

      // Layers
      this.initLayers();
      // Event handlers
      this.initEventHandlers();

      // Listen for geojson
      this.subscr.add(
        this.geojsonData$.subscribe(geojson => {
          if (geojson) {
            this.updateMapSource(geojson);
          }
        })
      );

      // Listen for current geojson feature
      this.subscr.add(
        this.currentGeojsonFeature$.subscribe(async geojsonFeature => {
          if (geojsonFeature) {
            // Center map on the feature
            this.centerMapOn(geojsonFeature);

            // On small screen
            // const modal = await this.modalCtrl.create({
            //   component: MarkerDetailsViewComponent,
            //   componentProps: {geojsonFeature, isModal: true},
            // });

            // modal.present();
          }
        })
      );

    });


  }

  private initImages() {

    this.MAP_MARKERS_DATA.forEach(marker => {
      if (!this.map.hasImage(marker.name)) {
        const img = new Image(48, 48);
        img.src = marker.url;
        img.onload = () => this.map.addImage(marker.name, img);
      }
    });

  }

  private initLayers() {

    if (!this.map.getLayer(this.GEOJSON_LAYER)) {

      this.map.addLayer({
        id: this.GEOJSON_LAYER,
        type: 'symbol',
        source: this.GEOJSON_SOURCE,
        layout: {

          // Icon
          'icon-image': ['concat', 'marker-', ['get', 'type']],
          'icon-offset': [0, -24],

          // Text
          'text-field': ['get', 'title'],
          'text-size': 12,
          'text-offset': [0, 0.6],
          'text-anchor': 'top',
          'icon-allow-overlap': true
        }
      });

    }

  }

  private initEventHandlers() {

    this.map.on('click', this.GEOJSON_LAYER, (ev) => {
      this.preventMapClick = true;

      const feature = ev.features?.[0];
      if (feature) {
        // Search for original feature
        const gjFeatures = this.store.selectSnapshot(CommonState.geojsonDataFeatures);
        const gjFeature = gjFeatures.find(f => f.id === (feature.properties as any).id);

        if (gjFeature) {
          this.store.dispatch(new CommonActions.SetCurrentGeojsonFeature({geojsonFeature: gjFeature}));
        }
      }
    });

    this.map.on('click', () => {
      if (!this.preventMapClick) {
        this.store.dispatch(new CommonActions.SetCurrentGeojsonFeature({geojsonFeature: null}));
      }

      // Reaset flag
      this.preventMapClick = false;
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    this.map.on('mouseenter', this.GEOJSON_LAYER, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    this.map.on('mouseleave', this.GEOJSON_LAYER, () => {
      this.map.getCanvas().style.cursor = '';
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
    // Set new style
    this.map.setStyle(styleUrl);
    // Once new style loaded -> re-add images, layers and sources (they are removed)
    this.map.on('styledata', this.styleDataCallback);
  }


  // Utils ////////////////////////////////////////////////////////////////////////////////////////


  updateMapSource(geojson: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>) {

    const currentSource: GeoJSONSource = this.map.getSource(this.GEOJSON_SOURCE) as GeoJSONSource;

    if (currentSource) {
      currentSource.setData(geojson);
    } else {
      this.map.addSource(this.GEOJSON_SOURCE, {type: 'geojson', data: geojson});
    }

  }

  centerMapOn(geojsonFeature: GeoJSON.Feature<GeoJSON.Geometry, PointProps>) {

    if (geojsonFeature.type === 'Feature') {
      switch (geojsonFeature.geometry.type) {
        case 'Point':
          this.map.flyTo({center: geojsonFeature.geometry.coordinates as [number, number]});
          break;

        default:
          console.warn(`Cannot center map on geojson feature of type ${geojsonFeature.geometry.type}`);
          break;
      }
    }
  }


  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

}
