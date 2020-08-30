import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MapService} from '@app/service/map.service';
import {Plugins} from '@capacitor/core';

const {Device} = Plugins;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {


  version = 'Unknown';

  readonly allowMarkerOverlap$ = this.map.allowMarkerOverlap$;

  constructor(
    private cd: ChangeDetectorRef,
    private map: MapService,
  ) {}

  async ngOnInit() {

    const devInfo = await Device.getInfo();
    this.version = devInfo.appVersion;
    this.cd.markForCheck();
  }


  onToggleMarkerOverlap(checked: boolean) {
    this.map.setMarkerOverlap(checked);
  }

}
