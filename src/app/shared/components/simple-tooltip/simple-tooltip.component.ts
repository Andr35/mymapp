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

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-simple-tooltip',
  templateUrl: './simple-tooltip.component.html',
  styleUrls: ['./simple-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleTooltipComponent {

  @Input()
  data: string | {icon: string, text: string} = '';

  get icon() {
    return typeof this.data === 'string' ? null : this.data.icon;
  }

  get text() {
    return typeof this.data === 'string' ? this.data : this.data.text;
  }

}
