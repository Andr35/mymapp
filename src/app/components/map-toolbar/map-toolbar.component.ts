import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HomePage} from '@app/home/home.page';

@Component({
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapToolbarComponent {

  constructor(public home: HomePage) {}

}
