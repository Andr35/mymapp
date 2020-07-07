import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild} from '@angular/core';
import {environment} from '@env/environment';
import {GeolocateControl, Map} from 'mapbox-gl';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements AfterViewInit {

  @ViewChild('mapContainer')
  mapContainer: ElementRef<HTMLDivElement>;

  map: Map;

  constructor() {}

  ngAfterViewInit() {

    // Create the map
    this.map = new Map({
      accessToken: environment.mapboxToken,
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [11, 46],
      zoom: 8
    });

    // Init map
    this.map.on('load', () => {
      this.map.resize();
    });

    this.map.addControl(new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: false,
      showAccuracyCircle: true,
    }));

  }

}
