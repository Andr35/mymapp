import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MapStyle} from '@app/models/map-style';
import {PopoverController} from '@ionic/angular';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-map-styles-list',
  templateUrl: './map-styles-list.component.html',
  styleUrls: ['./map-styles-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapStylesListComponent {

  @Input()
  mapStyles$?: Observable<MapStyle[]>;

  constructor(private popoverCtrl: PopoverController) {}

  onChangeMapStyle(styleUrl: string) {
    this.popoverCtrl.dismiss(styleUrl);
  }

}
