import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {PointProps} from '@app/models/geojson-props';
import {MapService} from '@app/service/map.service';
import {CommonState} from '@app/store/common/common.state';
import {Select} from '@ngxs/store';
import {Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements AfterViewInit, OnDestroy {

  // Data /////////////////////////////////////////////////////////////////////////////////////////

  @Select(CommonState.geojsonData)
  geojsonData$: Observable<GeoJSON.FeatureCollection<GeoJSON.Geometry, PointProps> | null>;

  @Select(CommonState.currentGeojsonFeature)
  currentGeojsonFeature$: Observable<GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null>;

  // Template elems ///////////////////////////////////////////////////////////////////////////////

  @ViewChild('mapContainer')
  private readonly mapContainer: ElementRef<HTMLDivElement>;

  // Others ///////////////////////////////////////////////////////////////////////////////////////

  private readonly subscr = new Subscription();

  constructor(
    private mapService: MapService,
    // private modalCtrl: ModalController,
  ) {}

  ngAfterViewInit() {

    this.mapService.initMap(this.mapContainer.nativeElement);

  }

  // Utils ////////////////////////////////////////////////////////////////////////////////////////

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

}
