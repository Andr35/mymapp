import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MapService} from '@app/service/map.service';
import {environment} from '@env/environment';
import {IonSearchbar} from '@ionic/angular';
import mbxClient from '@mapbox/mapbox-sdk';
import mbxGeocodingClient from '@mapbox/mapbox-sdk/services/geocoding';
import {GeocoderResult, GeocoderResultFeature} from '@models/geocoder-result';

@Component({
  selector: 'app-map-search',
  templateUrl: './map-search.component.html',
  styleUrls: ['./map-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapSearchComponent implements OnInit, AfterViewInit {

  @ViewChild(IonSearchbar)
  private readonly searchBar: IonSearchbar;

  private geocodingClient: any;

  results: GeocoderResultFeature[];

  constructor(
    private cd: ChangeDetectorRef,
    private mapService: MapService,
  ) {}

  ngOnInit() {

    // Create a generic mapbox client
    const mapboxClient = mbxClient({accessToken: environment.mapboxToken});
    // Create geocoding client
    this.geocodingClient = mbxGeocodingClient(mapboxClient);

  }

  async onSearch(inputText: string) {
    if (inputText) {
      const response = await this.geocodingClient.forwardGeocode({query: inputText}).send();

      const match: GeocoderResult = response.body;
      this.results = match.features;
      this.cd.markForCheck();
    }

  }

  ngAfterViewInit() {

    setTimeout(() => { // Wait for initialization for some time
      this.searchBar.setFocus();
    }, 200);

  }

  onResultSelect(result: GeocoderResultFeature) {

    this.mapService.centerMapOn(result.geometry, 15);

  }

}
