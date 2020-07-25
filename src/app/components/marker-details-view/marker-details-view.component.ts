import {DOCUMENT} from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, Optional} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HomePage} from '@app/home/home.page';
import {Journey, JourneyPhoto, PointProps} from '@app/models/geojson-props';
import {CommonActions} from '@app/store/common/common.actions';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngxs/store';
import {format} from 'date-fns';


interface MarkerFormValue {
  title: string | null;
  journeys: Journey[] | null;
}

type MarkerFormValueGroup = {[key in (keyof MarkerFormValue)]: unknown};

interface PhotoInfo {
  filename: string;
  base64Data: string;
  width: number;
  height: number;
}

@Component({
  selector: 'app-marker-details-view',
  templateUrl: './marker-details-view.component.html',
  styleUrls: ['./marker-details-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkerDetailsViewComponent {

  private readonly DATE_FMT = 'yyyy-MM-dd';
  private readonly DEFAULT_IMAGE_HEIGHT = 768;

  @Input()
  isModal?: boolean;

  private _geojsonFeature: GeoJSON.Feature<GeoJSON.Point, PointProps> | null;
  @Input()
  public get geojsonFeature(): GeoJSON.Feature<GeoJSON.Point, PointProps> | null {
    return this._geojsonFeature;
  }
  public set geojsonFeature(value: GeoJSON.Feature<GeoJSON.Point, PointProps> | null) {
    this._geojsonFeature = value;

    this.updateFormValue();
  }

  readonly form: FormGroup;

  get formValue(): MarkerFormValue {
    return this.form.value;
  }

  get formJourneysControl(): FormArray {
    return this.form.get('journeys') as FormArray;
  }
  get formTitleControl(): FormControl {
    return this.form.get('title') as FormControl;
  }


  constructor(
    @Optional() @Inject(HomePage) private home: HomePage | undefined,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private store: Store,
    private modalCtrl: ModalController,
    @Inject(DOCUMENT) private document: Document,
  ) {

    this.form = this.fb.group({
      title: [null, Validators.required],
      journeys: this.fb.array([]),
    } as MarkerFormValueGroup);

    // Add at least a journey
    this.onAddJourney();
  }


  private updateFormValue() {

    if (this.geojsonFeature) {

      this.formJourneysControl.clear();
      this.geojsonFeature.properties.journeys?.forEach(journey => {
        this.onAddJourney(journey);
      });

      this.form.patchValue({
        title: this.geojsonFeature.properties.title,
        journeys: this.geojsonFeature.properties.journeys?.map(j => ({...j, date: format(new Date(j.date), this.DATE_FMT)})) ?? []
      } as MarkerFormValueGroup);

      // Add at least a journey
      if ((this.geojsonFeature.properties.journeys?.length ?? 0) === 0) {
        this.onAddJourney();
      }


    } else {
      this.form.reset();
      this.form.patchValue({
        title: null,
        journeys: null,
      } as MarkerFormValueGroup);

      // Add at least a journey
      this.onAddJourney();
    }
  }


  onCenterOnMap() {
    if (this.geojsonFeature) {
      this.home?.centerMapOn(this.geojsonFeature);
    }
  }

  onAddJourney(journey?: Journey) {

    this.formJourneysControl.push(
      this.fb.group({
        date: this.fb.control(journey?.date ?? format(new Date(), this.DATE_FMT), [Validators.required]),
        photos: this.fb.array(journey?.photos?.map(photo => this.fb.control(photo)) ?? [])
      })
    );

  }

  onRemoveJourney(index: number) {
    this.formJourneysControl.removeAt(index);
  }

  onSave() {

    if (this.form.invalid) {
      return;
    }

    const formValue: MarkerFormValue = this.form.value;

    const updatedFeatureProps: PointProps = {
      id: this.geojsonFeature?.properties.id ?? '',
      type: this.geojsonFeature?.properties.type ?? 'unknown',
      title: formValue.title ?? 'Unknown',
      journeys: formValue.journeys ?? []
    };

    this.store.dispatch(new CommonActions.UpdateMarker({
      featureId: updatedFeatureProps.id,
      props: updatedFeatureProps
    }));

  }

  onDeleteMarker() {
    const featureId = this.geojsonFeature?.id;
    if (featureId) {
      this.store.dispatch(new CommonActions.RemoveMarker({featureId}));
    }
  }

  async onOpenImg(files: FileList, journeyControl: FormGroup) {

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file?.type.startsWith('image')) {

        const photoInfo = await this.preparePhoto(file);

        this.addPhoto(journeyControl, {
          filename: file.name,
          base64Data: photoInfo.base64Data,
        });

      }
    }

  }

  onClose() {
    if (this.isModal) {
      this.modalCtrl.dismiss();
    }
  }


  private addPhoto(journeyControl: FormGroup, photoData: JourneyPhoto) {

    (journeyControl.get('photos') as FormArray).push(
      this.fb.control(photoData)
    );

    this.cd.markForCheck();
  }

  private async preparePhoto(file: File): Promise<PhotoInfo> {
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
