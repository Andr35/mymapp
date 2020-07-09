import {AfterViewInit, Component} from '@angular/core';
import {Plugins} from '@capacitor/core';


const {SplashScreen} = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements AfterViewInit {

  ngAfterViewInit() {
    SplashScreen.hide();
  }

}
