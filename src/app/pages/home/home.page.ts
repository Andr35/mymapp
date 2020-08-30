import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Journey, PointProps} from '@app/models/geojson-props';
import {PhotoInfo} from '@app/models/photo-info';
import {MapService} from '@app/service/map.service';
import {MarkerService} from '@app/service/marker.service';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {PhotoFileData} from '@models/photo-file-data';
import {Select, Store} from '@ngxs/store';
import {format, isSameDay} from 'date-fns';
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
  geojsonData$!: Observable<GeoJSON.FeatureCollection<GeoJSON.Geometry, PointProps> | null>;

  @Select(CommonState.currentGeojsonFeature)
  currentGeojsonFeature$!: Observable<GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null>;

  // Template elems ///////////////////////////////////////////////////////////////////////////////

  @ViewChild('mapContainer')
  private readonly mapContainer?: ElementRef<HTMLDivElement>;

  // Others ///////////////////////////////////////////////////////////////////////////////////////

  private readonly subscr = new Subscription();

  constructor(
    private store: Store,
    private mapService: MapService,
    private markerService: MarkerService,
    // private modalCtrl: ModalController,
  ) {}

  ngAfterViewInit() {

    if (this.mapContainer?.nativeElement) {
      this.mapService.initMap(this.mapContainer.nativeElement);
    }

  }

  // Callbacks ////////////////////////////////////////////////////////////////////////////////////

  async onReadImages(files: FileList) {

    const photos: PhotoFileData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);

      if (file?.type.startsWith('image')) {
        photos.push(await this.markerService.extractPhotoData(file));
      }

    }

    if (photos.length > 0) {

      const photoInfos: PhotoInfo[] = [];
      for (const photo of photos) {
        const photoInfo = await this.markerService.preparePhoto(photo.file);
        photoInfos.push(photoInfo);
      }

      const journeys = photos.reduce<Journey[]>((a, b, i) => {
        let bucket = a.find(j => isSameDay(new Date(j.date), b.shotDate));

        if (bucket) {
          bucket.photos = [...(bucket.photos ?? []), {
            filename: photoInfos[i].filename,
            base64Data: photoInfos[i].base64Data,
            filePath: (photos[i].file as any).path,
          }];
        } else {
          bucket = {
            date: format(b.shotDate, 'yyyy-MM-dd'),
            photos: [{
              filename: photoInfos[i].filename,
              base64Data: photoInfos[i].base64Data,
              filePath: (photos[i].file as any).path,
            }]
          } as Journey;
          a.push(bucket);
        }

        return a;
      }, []);

      // Match "My photo name" of "0001 My photo name.jpg"
      const title = this.markerService.prepareTitle(photos[0].file.name);

      this.store.dispatch(new CommonActions.AddMarker({
        coordinates: [photos[0].long ?? 11, photos[0].lat ?? 46],
        props: this.markerService.preparePointProps('journey', journeys, title)
      }));

    }

  }

  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

}
