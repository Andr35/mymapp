import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HomePage} from '@app/home/home.page';
import {MarkerProps} from '@app/models/marker-props';


interface MarkerFormValue {
  title: string | null;
}

type MarkerFormValueGroup = {[key in (keyof MarkerFormValue)]: unknown};

@Component({
  selector: 'app-marker-details-card',
  templateUrl: './marker-details-card.component.html',
  styleUrls: ['./marker-details-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkerDetailsCardComponent {

  private _geojsonFeature: GeoJSON.Feature<GeoJSON.Geometry, MarkerProps> | null;
  @Input()
  public get geojsonFeature(): GeoJSON.Feature<GeoJSON.Geometry, MarkerProps> | null {
    return this._geojsonFeature;
  }
  public set geojsonFeature(value: GeoJSON.Feature<GeoJSON.Geometry, MarkerProps> | null) {
    this._geojsonFeature = value;

    this.updateFormValue();
  }

  readonly form: FormGroup;

  get formValue(): MarkerFormValue {
    return this.form.value;
  }


  constructor(
    private home: HomePage,
    private fb: FormBuilder,
  ) {

    this.form = this.fb.group({
      title: [null, Validators.required]
    } as MarkerFormValueGroup);

  }


  private updateFormValue() {
    if (this.geojsonFeature) {
      this.form.patchValue({
        title: this.geojsonFeature.properties.title
      });
    } else {
      this.form.reset();
      this.form.patchValue({
        title: null
      });
    }
  }


  onCenterOnMap() {
    if (this.geojsonFeature) {
      this.home.centerMapOn(this.geojsonFeature);
    }
  }

}
