import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {Journey, JourneyType, PointProps} from '@app/models/geojson-props';
import {PhotoInfo} from '@models/photo-info';
import {v4 as uuidv4} from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  private readonly DEFAULT_IMAGE_HEIGHT = 768;

  constructor(
    @Inject(DOCUMENT) private document: Document,
  ) {}

  preparePointProps(markerType: JourneyType, journeys: Journey[] = []): PointProps {
    return {
      id: uuidv4(),
      type: markerType,
      title: '',
      journeys
    };

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

}
