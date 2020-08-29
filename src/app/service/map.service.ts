import {Injectable} from '@angular/core';
import {PointProps} from '@app/models/geojson-props';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {Plugins} from '@capacitor/core';
import {environment} from '@env/environment';
import {AlertController} from '@ionic/angular';
import {DEFAULT_GEOJSON_DATA} from '@models/default-geojson-data';
import {Select, Store} from '@ngxs/store';
import {Control, GeoJSONSource, GeolocateControl, Map} from 'mapbox-gl';
import RulerControl from 'mapbox-gl-controls/lib/ruler';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';

const {Storage} = Plugins;

@Injectable({
  providedIn: 'root'
})
export class MapService {

  // Data /////////////////////////////////////////////////////////////////////////////////////////

  private readonly GEOJSON_SOURCE = 'geojsonSource';
  private readonly GEOJSON_LAYER = 'geojsonSourceLayer';

  private readonly KEY_MAPBOX_TOKEN = 'mapboxToken';
  private readonly KEY_LAST_STYLE_USED = 'mapboxStyle';

  private readonly MAP_MARKERS_DATA: {name: string; url: string}[] = [
    {name: 'marker-journey', url: `assets/markers/marker-journey.svg`},
    {name: 'marker-mountain', url: `assets/markers/marker-mountain.svg`},
    {name: 'marker-bike', url: `assets/markers/marker-bike.svg`},
    {name: 'marker-ski', url: `assets/markers/marker-ski.svg`},
  ];

  @Select(CommonState.geojsonData)
  geojsonData$!: Observable<GeoJSON.FeatureCollection<GeoJSON.Geometry, PointProps> | null>;

  @Select(CommonState.currentGeojsonFeature)
  currentGeojsonFeature$!: Observable<GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null>;

  // Mapbox ///////////////////////////////////////////////////////////////////////////////////////

  public map!: Map;

  public geolocateCtrl?: GeolocateControl;
  public rulerCtrl?: any; // RulerControl;
  public stylesCtrl?: unknown; // StylesControl;

  // Others ///////////////////////////////////////////////////////////////////////////////////////

  /**
   * Flag to prevent "generic" map click action. Typically should be set to true if a feature
   * or something else which is not a generic point on the map is clicked.
   */
  private preventMapClick = false;

  readonly mapReady$ = new BehaviorSubject(false);

  private subscr = new Subscription();

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
    private alterCtrl: AlertController,
  ) {}


  // Init /////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Initialize the map.
   * @param elem HTML element where draw the map.
   */
  async initMap(elem: HTMLElement): Promise<void> {

    // Reset
    this.subscr.unsubscribe();
    this.subscr = new Subscription();

    await this.initMapbox(elem);
    this.initImages();
    this.initControls();

  }


  private async initMapbox(elem: HTMLElement): Promise<void> {

    const mapboxToken = await this.getMapboxToken();

    // Get last used style
    const styleUrlData = await Storage.get({key: this.KEY_LAST_STYLE_USED});

    // Create the map
    this.map = new Map({
      accessToken: mapboxToken,
      container: elem,
      style: styleUrlData.value ?? this.store.selectSnapshot(CommonState.mapStyles)[0].styleUrl,
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
          this.updateMapSource(geojson ?? DEFAULT_GEOJSON_DATA);
        })
      );

      // Listen for current geojson feature
      this.subscr.add(
        this.currentGeojsonFeature$.subscribe(async geojsonFeature => {

          if (geojsonFeature) {
            // Center map on the feature
            this.centerMapOn(geojsonFeature.geometry);

            // On small screen
            // const modal = await this.modalCtrl.create({
            //   component: MarkerDetailsViewComponent,
            //   componentProps: {geojsonFeature, isModal: true},
            // });

            // modal.present();
          }
        })
      );

      // Notify to interested components
      this.mapReady$.next(true);

    });


  }

  private initImages(): void {

    this.MAP_MARKERS_DATA.forEach(marker => {
      if (!this.map.hasImage(marker.name)) {
        const img = new Image(48, 48);
        img.src = marker.url;
        img.onload = () => this.map.addImage(marker.name, img);
      }
    });

  }

  private initLayers(): void {

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

  private initEventHandlers(): void {

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

  private initControls(): void {

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
    this.map.addControl(this.rulerCtrl as Control);

  }


  // Utilities ////////////////////////////////////////////////////////////////////////////////////

  private updateMapSource(geojson: GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>) {

    const currentSource: GeoJSONSource = this.map.getSource(this.GEOJSON_SOURCE) as GeoJSONSource;

    if (currentSource) {
      currentSource.setData(geojson);
    } else {
      this.map.addSource(this.GEOJSON_SOURCE, {type: 'geojson', data: geojson});
    }

  }


  // Mapbox token /////////////////////////////////////////////////////////////////////////////////


  private async getMapboxToken(): Promise<string> {

    // Get from environment
    if (environment.mapboxToken) {
      return environment.mapboxToken;
    }

    // Get from local storage
    const {value} = await Storage.get({key: this.KEY_MAPBOX_TOKEN});

    if (value) {
      return value;
    }

    // Ask to user
    const alert = await this.alterCtrl.create({
      header: 'Mapbox Token required',
      message: `In order to work, the application requires a <strong>Mapbox token</strong>. Here is the documentation on how to get one: <a href="https://docs.mapbox.com/help/how-mapbox-works/access-tokens/" target="_blank" rel="noopener">Access tokens</a>`,
      backdropDismiss: false,
      buttons: [
        {text: 'Done'}
      ],
      inputs: [
        {
          name: 'token',
          type: 'password',
          placeholder: 'Copy here the Mapbox token'
        }
      ]

    });
    alert.present();
    const alertDismiss = await alert.onDidDismiss();

    await this.setMapboxToken(alertDismiss.data.values.token);

    return alertDismiss.data.values.token;
  }

  private setMapboxToken(token: string): Promise<void> {
    return Storage.set({key: this.KEY_MAPBOX_TOKEN, value: token});
  }


  // Map APIs /////////////////////////////////////////////////////////////////////////////////////

  centerMapOn(geometry: GeoJSON.Geometry, zoom: number = this.map.getZoom()) {

    switch (geometry.type) {
      case 'Point':
        this.map.flyTo({
          center: geometry.coordinates as [number, number],
          zoom // Attention: Throws subtle error with undefined
        });
        break;

      default:
        console.warn(`Cannot center map on geojson feature of type ${geometry.type}`);
        break;
    }
  }

  toggleGeolocation() {
    this.geolocateCtrl?.trigger();
  }

  toggleRuler() {
    if (this.rulerCtrl.isMeasuring) {
      this.rulerCtrl.measuringOff();
    } else {
      this.rulerCtrl.measuringOn();
    }
  }


  changeMapStyle(styleUrl: string) {
    // Set new style
    this.map.setStyle(styleUrl);
    // Once new style loaded -> re-add images, layers and sources (they are removed)
    this.map.on('styledata', this.styleDataCallback);
    // Save last used style
    Storage.set({key: this.KEY_LAST_STYLE_USED, value: styleUrl});
  }


}
