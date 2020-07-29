import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Journey, JourneyPhoto, PointProps} from '@app/models/geojson-props';
import {MapService} from '@app/service/map.service';
import {MarkerService} from '@app/service/marker.service';
import {CommonActions} from '@app/store/common/common.actions';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngxs/store';
import {format} from 'date-fns';


interface MarkerFormValue {
  title: string | null;
  journeys: Journey[] | null;
}

type MarkerFormValueGroup = {[key in (keyof MarkerFormValue)]: unknown};

@Component({
  selector: 'app-marker-details-view',
  templateUrl: './marker-details-view.component.html',
  styleUrls: ['./marker-details-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkerDetailsViewComponent {

  private readonly DATE_FMT = 'yyyy-MM-dd';

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
    private fb: FormBuilder,
    private mapService: MapService,
    private cd: ChangeDetectorRef,
    private store: Store,
    private modalCtrl: ModalController,
    private markerService: MarkerService,
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
      this.mapService.centerMapOn(this.geojsonFeature.geometry);
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

        const photoInfo = await this.markerService.preparePhoto(file);

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

}
