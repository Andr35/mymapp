import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';

@Component({
  selector: 'app-input-mode',
  templateUrl: './input-mode.component.html',
  styleUrls: ['./input-mode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputModeComponent {

  inputMode = false;

  constructor(private cd: ChangeDetectorRef) {}

  setInputMode() {
    this.inputMode = true;
    this.cd.markForCheck();
  }

  setViewMode() {
    this.inputMode = false;
    this.cd.markForCheck();
  }

}
