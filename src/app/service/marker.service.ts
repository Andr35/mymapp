import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {Journey, JourneyType, PointProps} from '@app/models/geojson-props';
import {PhotoFileData} from '@models/photo-file-data';
import {PhotoInfo} from '@models/photo-info';
import {parse} from 'date-fns';
import * as EXIF from 'exif-js';
import {v4 as uuidv4} from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  private readonly DEFAULT_IMAGE_HEIGHT = 480;

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) { }

  preparePointProps(markerType: JourneyType, journeys: Journey[] = [], title = ''): PointProps {
    return {
      id: uuidv4(),
      type: markerType,
      title,
      journeys
    };

  }

  prepareTitle(filename: string): string {
    return filename.match(/(\d+\s)?(.+)\.[a-zA-Z0-9]{3,4}/)?.[2] ?? '';
  }

  async preparePhoto(file: File): Promise<PhotoInfo> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        const imgElem = new Image();

        imgElem.onload = () => {
          const canvas = this.document.createElement('canvas');
          // tslint:disable-next-line:no-non-null-assertion
          const ctx = canvas.getContext('2d')!;
          // > smooth == < sharpen
          // ctx.imageSmoothingEnabled = true;
          // ctx.imageSmoothingQuality = 'high';

          // Resize
          canvas.height = this.DEFAULT_IMAGE_HEIGHT;
          canvas.width = (this.DEFAULT_IMAGE_HEIGHT * imgElem.width) / imgElem.height;

          ctx.drawImage(imgElem, 0, 0, imgElem.width, imgElem.height, 0, 0, canvas.width, canvas.height);

          const base64Data = ctx.canvas.toDataURL('image/jpeg');
          resolve({
            base64Data,
            width: canvas.width,
            height: canvas.height,
            filename: file.name,
          });
        };
        imgElem.onerror = err => reject(err);
        imgElem.src = event.target?.result as string ?? '';
      };
      reader.onerror = err => reject(err);

      reader.readAsDataURL(file);
    });
  }

  extractPhotoData(file: File): Promise<PhotoFileData> {
    return new Promise<PhotoFileData>((resolve, reject) => {

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
              lat: gpsLat ? this.convLatLong(gpsLat, gpsLatRef) : null,
              long: gpsLong ? this.convLatLong(gpsLong, gpsLongRef) : null,
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

}
