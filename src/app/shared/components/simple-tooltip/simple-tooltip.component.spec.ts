/*!
 * Copyright 2019 Fondazione Bruno Kessler
 * Licensed under the EUPL, Version 1.1 or - as soon they will be approved by the European
 * Commission - subsequent versions of the EUPL (the "Licence"); You may not use this work
 * except in compliance with the Licence.
 *
 * You may obtain a copy of the Licence at:
 * http://ec.europa.eu/idabc/eupl.html
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the Licence is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the Licence for the specific language
 * governing permissions and limitations under the Licence.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {C3SimpleTooltipComponent} from './simple-tooltip.component';


describe('C3SimpleTooltipComponent', () => {
  let component: C3SimpleTooltipComponent;
  let fixture: ComponentFixture<C3SimpleTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [C3SimpleTooltipComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(C3SimpleTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
