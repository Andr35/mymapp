import {AfterViewInit, ChangeDetectionStrategy, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {JourneyPhoto} from '@app/models/geojson-props';
import {NAV_STATE_IMG_VIEWER_INDEX, NAV_STATE_IMG_VIEWER_PHOTOS} from '@app/models/nav-contants';
import {IonSlides} from '@ionic/angular';

@Component({
  selector: 'app-img-viewer',
  templateUrl: 'img-viewer.page.html',
  styleUrls: ['img-viewer.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImgViewerPage implements OnInit, AfterViewInit {

  @ViewChild(IonSlides)
  private readonly slides: IonSlides;


  photos?: JourneyPhoto[];

  initialIndex = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.photos = this.router.getCurrentNavigation()?.extras.state?.[NAV_STATE_IMG_VIEWER_PHOTOS];
    this.initialIndex = this.router.getCurrentNavigation()?.extras.state?.[NAV_STATE_IMG_VIEWER_INDEX] ?? 0;
  }

  ngAfterViewInit() {
    this.slides.slideTo(this.initialIndex);
  }


  @HostListener('document:keydown.ArrowLeft')
  async slidePrev() {
    if (!(await this.slides.isBeginning())) {
      this.slides.slidePrev();
    }
  }

  @HostListener('document:keydown.ArrowRight')
  async slideNext() {
    if (!(await this.slides.isEnd())) {
      this.slides.slideNext();
    }
  }

}
