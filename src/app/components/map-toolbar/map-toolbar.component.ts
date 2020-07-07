import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapToolbarComponent implements OnInit {

  constructor() {}

  ngOnInit() {}

}
