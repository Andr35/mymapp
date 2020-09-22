import {ChangeDetectionStrategy, Component, EventEmitter, Output} from '@angular/core';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {map, take, withLatestFrom} from 'rxjs/operators';

@Component({
  selector: 'app-map-filter',
  templateUrl: './map-filter.component.html',
  styleUrls: ['./map-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapFilterComponent {

  @Select(CommonState.filterYears) filterYears$!: Observable<number[]>;
  @Select(CommonState.geojsonDataFeaturesYears) availableYears$!: Observable<number[]>;

  filterYearsSelect$: Observable<{[label: number]: boolean}> = this.filterYears$.pipe(
    withLatestFrom(this.availableYears$),
    map(([years, availableYears]) => years.length === 0 ? availableYears : years),
    map(years => years.reduce<{[label: number]: boolean}>((a, b) => {
      a[b] = true;
      return a;
    }, {}))
  );


  @Output()
  closing = new EventEmitter<void>();

  constructor(
    private store: Store
  ) {}

  onYearSelectionChange(event: CustomEvent) {

    const selYear = parseInt(event.detail.value, 10);
    const checked = event.detail.checked;

    this.availableYears$
      .pipe(
        withLatestFrom(this.filterYearsSelect$),
        take(1),
      )
      .subscribe(([availableYears, filterYearsSelect]) => {

        const years = availableYears
          .filter(year => year === selYear ? checked : filterYearsSelect[year]);

        this.onSetFilterYears(years.length === availableYears.length ? [] : years);
      });
  }

  onSetFilterYears(years: number[]) {
    this.store.dispatch(new CommonActions.SetFilter({years}));
  }

  onClose() {
    this.closing.next();
  }

}
