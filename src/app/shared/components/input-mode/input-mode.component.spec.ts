import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';
import {InputModeComponent} from './input-mode.component';


describe('InputModeComponent', () => {
  let component: InputModeComponent;
  let fixture: ComponentFixture<InputModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InputModeComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InputModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
