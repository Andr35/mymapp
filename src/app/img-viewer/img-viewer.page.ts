import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {JourneyPhoto} from '@app/models/geojson-props';
import {NAV_STATE_PHOTO} from '@app/models/nav-contants';

@Component({
  selector: 'app-img-viewer',
  templateUrl: 'img-viewer.page.html',
  styleUrls: ['img-viewer.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImgViewerPage implements OnInit {


  photo?: JourneyPhoto;


  constructor(private router: Router) {}

  ngOnInit() {
    this.photo = this.router.getCurrentNavigation()?.extras.state?.[NAV_STATE_PHOTO];
  }

}
