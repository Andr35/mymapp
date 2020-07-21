import {ChangeDetectionStrategy, Component, Inject, Input, Optional} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HomePage} from '@app/home/home.page';
import {PointProps} from '@app/models/geojson-props';
import {ModalController} from '@ionic/angular';
import {format} from 'date-fns';


interface MarkerFormValue {
  title: string | null;
  journeyDates: Date[] | null;
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

  get formJourneyDatesControl(): FormArray {
    return this.form.get('journeyDates') as FormArray;
  }
  get formTitleControl(): FormControl {
    return this.form.get('title') as FormControl;
  }


  constructor(
    @Optional() @Inject(HomePage) private home: HomePage | undefined,
    private fb: FormBuilder,
    private modalCtrl: ModalController,
  ) {

    this.form = this.fb.group({
      title: [null, Validators.required],
      journeyDates: this.fb.array([]),
    } as MarkerFormValueGroup);

    // Add at least a journey
    this.onAddJourney();
  }


  private updateFormValue() {

    if (this.geojsonFeature) {

      this.formJourneyDatesControl.clear();
      this.geojsonFeature.properties.journeys.forEach(() => {
        this.formJourneyDatesControl.push(this.fb.control(null));
      });

      this.form.patchValue({
        title: this.geojsonFeature.properties.title,
        journeyDates: this.geojsonFeature.properties.journeys.map(j => j.date)
      });

      // Add at least a journey
      if (this.geojsonFeature.properties.journeys.length === 0) {
        this.onAddJourney();
      }


    } else {
      this.form.reset();
      this.form.patchValue({
        title: null,
        journeyDates: null,
      });

      // Add at least a journey
      this.onAddJourney();
    }
  }


  onCenterOnMap() {
    if (this.geojsonFeature) {
      this.home?.centerMapOn(this.geojsonFeature);
    }
  }

  onAddJourney() {

    this.formJourneyDatesControl.push(
      this.fb.control(format(new Date(), this.DATE_FMT), [Validators.required])
    );

  }

  onRemoveJourney(index: number) {
    this.formJourneyDatesControl.removeAt(index);
  }

  onSave() {
    // TODO impl
  }

  onDeleteMarker() {
    // TODO impl
  }

  onClose() {
    if (this.isModal) {
      this.modalCtrl.dismiss();
    }
  }

}
