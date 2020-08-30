import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, Renderer2, TrackByFunction} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Journey, JourneyPhoto, PointProps} from '@app/models/geojson-props';
import {ADD_MARKER_TOOLS} from '@app/models/marker-types';
import {MapService} from '@app/service/map.service';
import {MarkerService} from '@app/service/marker.service';
import {CommonActions} from '@app/store/common/common.actions';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngxs/store';
import {format} from 'date-fns';
import {MapMouseEvent, MapTouchEvent} from 'mapbox-gl';
import {Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';


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
export class MarkerDetailsViewComponent implements OnDestroy {

  private readonly DATE_FMT = 'yyyy-MM-dd';

  @Input()
  isModal?: boolean;

  private _geojsonFeature: GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null = null;
  @Input()
  public get geojsonFeature(): GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null {
    return this._geojsonFeature;
  }
  public set geojsonFeature(value: GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null) {
    this._geojsonFeature = value;

    this.updateFormValue();
  }

  get geojsonId(): string {
    return this.geojsonFeature?.properties.id ?? '';
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

  isMarkerRepositionOn = false;

  private saveStatus: 'pending' | 'success' = 'pending';
  private saveStatusTimer?: any;

  get saveStatusColor() {
    switch (this.saveStatus) {
      case 'pending':
        return 'secondary';

      case 'success':
        return 'success';

      default:
        return 'secondary';
    }
  }

  get saveStatusIcon() {
    switch (this.saveStatus) {
      case 'pending':
        return 'content-save-outline';

      case 'success':
        return 'check';

      default:
        return 'content-save-outline';
    }
  }

  private autoSaveSubscr?: Subscription;

  private readonly repositionMarkerCallback: (ev: MapMouseEvent | MapTouchEvent) => void = (ev) => {

    // Disable tool
    this.toggleRepositionMarker();

    const newCoords = ev.lngLat.toArray();

    this.store.dispatch(new CommonActions.UpdateMarker({
      featureId: this.geojsonId,
      coordinates: newCoords
    }));

  }

  readonly trackByJourneys: TrackByFunction<AbstractControl> = (_i, item) => item.value.date;

  readonly trackByPhotos: TrackByFunction<JourneyPhoto> = (_i, item) => item.filename;

  constructor(
    private fb: FormBuilder,
    private mapService: MapService,
    private renderer: Renderer2,
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
    this.disableAutoSave();

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

    this.enableAutoSave();
  }


  onCenterOnMap() {
    if (this.geojsonFeature) {
      this.mapService.centerMapOn(this.geojsonFeature.geometry);
    }
  }

  onAddJourney(journey?: Journey) {

    this.formJourneysControl.push(
      this.fb.group({
        date: this.fb.control(journey?.date ?? format(new Date(), this.DATE_FMT), {
          validators: [Validators.required],
          updateOn: 'blur' // Provide the good UI/UX experience (don't change)
        }),
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
      id: this.geojsonId,
      type: this.geojsonFeature?.properties.type ?? 'unknown',
      title: formValue.title ?? 'Unknown',
      journeys: formValue.journeys ?? []
    };

    this.store.dispatch(new CommonActions.UpdateMarker({
      featureId: updatedFeatureProps.id,
      props: updatedFeatureProps
    })).subscribe(() => {
      clearTimeout(this.saveStatusTimer);
      this.saveStatus = 'success';
      this.cd.markForCheck();

      this.saveStatusTimer = setTimeout(() => {
        this.saveStatus = 'pending';
        this.cd.markForCheck();
      }, 2000);
    });

  }

  onDeleteMarker() {
    const featureId = this.geojsonFeature?.id;
    if (featureId) {
      this.store.dispatch(new CommonActions.RemoveMarker({featureId}));
    }
  }

  async onOpenImg(files: FileList, journeyControl: AbstractControl) {

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file?.type.startsWith('image')) {

        const photoInfo = await this.markerService.preparePhoto(file);

        this.addPhoto(journeyControl, {
          filename: file.name,
          base64Data: photoInfo.base64Data,
          filePath: (file as any).path
        });

        try {
          const dateControl = journeyControl.get('date');
          if (!dateControl || dateControl.value === format(new Date(), this.DATE_FMT)) { // Today
            // Try to set date using photo shot time
            const photoData = await this.markerService.extractPhotoData(file);
            dateControl?.patchValue(format(photoData.shotDate, this.DATE_FMT));
          }
        } catch (e) {
          // Does not matter
        }

      }
    }

    try {
      // Try to assign title if missing
      if (!this.formTitleControl.value) {
        const title = this.markerService.prepareTitle(files.item(0)?.name ?? '');
        if (title) {
          this.formTitleControl.patchValue(title);
        }
      }
    } catch (e) {
      // Does not matter
    }

  }

  onChangeMarkerType() {

    const currType = this.geojsonFeature?.properties.type ?? 'unknown';
    const index = ADD_MARKER_TOOLS.findIndex(t => t.type === currType);

    const nextType = ADD_MARKER_TOOLS[(index + 1) % ADD_MARKER_TOOLS.length].type;

    this.store.dispatch(new CommonActions.UpdateMarker({
      featureId: this.geojsonId,
      markerType: nextType,
    }));

  }

  toggleRepositionMarker() {

    if (!this.isMarkerRepositionOn) {
      this.mapService.map.on('click', this.repositionMarkerCallback);
      this.renderer.addClass(this.mapService.map.getCanvasContainer(), 'app-map-clickable');
    } else {
      this.mapService.map.off('click', this.repositionMarkerCallback);
      this.renderer.removeClass(this.mapService.map.getCanvasContainer(), 'app-map-clickable');
    }

    this.isMarkerRepositionOn = !this.isMarkerRepositionOn;
  }

  onClose() {
    // Automatically closed if no selected geojson feature exists
    this.store.dispatch(new CommonActions.SetCurrentGeojsonFeature({geojsonFeature: null}));

    if (this.isModal) {
      this.modalCtrl.dismiss();
    }
  }

  onRemovePhoto(journeyControl: AbstractControl, index: number) {
    (journeyControl.get('photos') as FormArray).removeAt(index);
  }


  private addPhoto(journeyControl: AbstractControl, photoData: JourneyPhoto) {

    (journeyControl.get('photos') as FormArray).push(
      this.fb.control(photoData)
    );

    this.cd.markForCheck();
  }

  private disableAutoSave() {
    this.autoSaveSubscr?.unsubscribe();
  }

  private enableAutoSave() {
    this.autoSaveSubscr?.unsubscribe();

    this.autoSaveSubscr = this.form.valueChanges.pipe(
      debounceTime(750)
    ).subscribe(() => {
      this.onSave();
    });

  }

  ngOnDestroy() {
    this.autoSaveSubscr?.unsubscribe();

    if (this.isMarkerRepositionOn) {
      this.toggleRepositionMarker();
    }
  }

}
