import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ImgViewerPage} from './img-viewer.page';


describe('ImgViewerPage', () => {
  let component: ImgViewerPage;
  let fixture: ComponentFixture<ImgViewerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImgViewerPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
