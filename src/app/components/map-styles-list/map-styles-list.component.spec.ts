import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';
import {MapToolbarComponent} from './map-styles-list.component';


describe('MapToolbarComponent', () => {
  let component: MapToolbarComponent;
  let fixture: ComponentFixture<MapToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapToolbarComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
