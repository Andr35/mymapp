import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';
import {MapStylesListComponent} from './map-styles-list.component';


describe('MapStylesListComponent', () => {
  let component: MapStylesListComponent;
  let fixture: ComponentFixture<MapStylesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapStylesListComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapStylesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
