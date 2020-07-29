import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Journey, PointProps} from '@app/models/geojson-props';
import {PhotoInfo} from '@app/models/photo-info';
import {MapService} from '@app/service/map.service';
import {MarkerService} from '@app/service/marker.service';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {Select, Store} from '@ngxs/store';
import {format, isSameDay, parse} from 'date-fns';
import * as EXIF from 'exif-js';
import {Observable, Subscription} from 'rxjs';


interface PhotoData {
  file: File;
  shotDate: Date;
  lat: number | null;
  long: number | null;
}

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
    private store: Store,
    private mapService: MapService,
    private markerService: MarkerService,
    // private modalCtrl: ModalController,
  ) {}

  ngAfterViewInit() {

    this.mapService.initMap(this.mapContainer.nativeElement);

  }

  // Callbacks ////////////////////////////////////////////////////////////////////////////////////

  async onReadImages(files: FileList) {

    const photos: PhotoData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);

      if (file?.type.startsWith('image')) {
        photos.push(await this.extractPhotoData(file));
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
            base64Data: photoInfos[i].base64Data
          }];
        } else {
          bucket = {
            date: format(b.shotDate, 'yyyy-MM-dd'),
            photos: [{
              filename: photoInfos[i].filename,
              base64Data: photoInfos[i].base64Data
            }]
          } as Journey;
          a.push(bucket);
        }

        return a;
      }, []);

      this.store.dispatch(new CommonActions.AddMarker({
        coordinates: [photos[0].long ?? 11, photos[0].lat ?? 46],
        props: this.markerService.preparePointProps('journey', journeys)
      }));

    }

  }


  private extractPhotoData(file: File): Promise<PhotoData> {
    return new Promise<PhotoData>((resolve, reject) => {

      const reader = new FileReader();

      reader.onload = event => {
        const img = new Image();
        img.onload = () => {
          EXIF.getData(img as any, () => {
            const shotDate: string = EXIF.getTag(img, 'DateTimeOriginal'); // yyyy:MM:dd HH:mm:ss
            const gpsLatRef: 'N' | 'S' = EXIF.getTag(img, 'GPSLatitudeRef');
            const gpsLongRef: 'E' | 'W' = EXIF.getTag(img, 'GPSLongitudeRef');
            const gpsLat: [number, number, number] = EXIF.getTag(img, 'GPSLatitude');
            const gpsLong: [number, number, number] = EXIF.getTag(img, 'GPSLongitude');

            resolve({
              file,
              shotDate: parse(shotDate, 'yyyy:MM:dd HH:mm:ss', new Date()),
              lat: this.convLatLong(gpsLat, gpsLatRef),
              long: this.convLatLong(gpsLong, gpsLongRef),
            });

          });
        };
        img.onerror = err => reject(err);
        img.src = event.target?.result as string ?? '';
      };
      reader.onerror = err => reject(err);

      reader.readAsDataURL(file);


    });
  }

  private convLatLong(value: [number, number, number], ref: 'N' | 'S' | 'E' | 'W'): number {
    const stdValue = value[0] + (value[1] / 60) + (value[2] / 3600);
    return (ref === 'N' || ref === 'E') ? stdValue : -stdValue;
  }


  ngOnDestroy() {
    this.subscr.unsubscribe();
  }

}
