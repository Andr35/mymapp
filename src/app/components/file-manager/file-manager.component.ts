import {ChangeDetectionStrategy, Component, ElementRef, ViewChild} from '@angular/core';
import {PointProps} from '@app/models/geojson-props';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {hasActionsExecuting} from '@ngxs-labs/actions-executing';
import {Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerComponent {

  @Select(hasActionsExecuting()) loading$: Observable<boolean>;

  @Select(CommonState.file) file$: Observable<File | null>;
  @Select(CommonState.geojsonData) geojsonData$: Observable<GeoJSON.Feature<GeoJSON.Geometry, PointProps> | null>;

  @ViewChild('fileInput') fileInputElem: ElementRef<HTMLInputElement>;


  constructor(private store: Store) {}


  onOpenFilePrompt() {
    this.fileInputElem.nativeElement.click();
  }

  onOpenFile(files?: FileList) {

    if (!files) {
      return;
    }

    const file = files.item(0);
    if (file) {
      this.store.dispatch(new CommonActions.OpenFile({file}));
    }
  }

  onSave() {
    this.store.dispatch(new CommonActions.SaveFile());
  }

}
