import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {PointProps} from '@app/models/geojson-props';
import {CommonActions} from '@app/store/common/common.actions';
import {CommonState} from '@app/store/common/common.state';
import {hasActionsExecuting} from '@ngxs-labs/actions-executing';
import {Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerComponent {

  @Select(hasActionsExecuting()) loading$: Observable<boolean>;

  @Select(CommonState.file) file$: Observable<File | null>;
  @Select(CommonState.geojsonData) geojsonData$: Observable<GeoJSON.FeatureCollection<GeoJSON.Geometry, PointProps> | null>;

  @ViewChild('fileInput')
  private readonly fileInputElem: ElementRef<HTMLInputElement>;

  /**
   * Flag indicating the save operation status
   */
  savingStatus: 'success' | 'error' | null = null;

  get saveBtnColor(): string {
    switch (this.savingStatus) {
      case 'success':
        return 'success';

      case 'error':
        return 'danger';

      default:
        return 'primary';
    }
  }

  get saveBtnIcon(): string {
    switch (this.savingStatus) {
      case 'success':
        return 'check';

      case 'error':
        return 'close';

      default:
        return 'content-save-outline';
    }
  }

  constructor(private store: Store, private cd: ChangeDetectorRef) {}


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
    this.resetSavingFlag();

    this.store.dispatch(new CommonActions.SaveFile()).pipe(
      finalize(() => {
        this.cd.markForCheck();
        setTimeout(() => {
          this.resetSavingFlag();
        }, 3000);
      })
    ).subscribe(
      () => {
        this.savingStatus = 'success';
      },
      () => {
        this.savingStatus = 'error';
      }
    );
  }

  onCloseFile() {
    this.store.dispatch(new CommonActions.CloseFile());
  }

  private resetSavingFlag() {
    this.savingStatus = null;
    this.cd.markForCheck();
  }

}
