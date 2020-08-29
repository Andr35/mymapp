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

import {Overlay, OverlayPositionBuilder, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {SimpleTooltipComponent} from '@app/shared/components/simple-tooltip/simple-tooltip.component';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnInit, OnDestroy {

  @Input('appTooltip')
  data: any = '';

  private readonly tooltipComp = SimpleTooltipComponent;

  private overlayRef?: OverlayRef;

  /**
   * Reference to the current created tooltip component.
   */
  private tooltipComponentRef?: ComponentRef<SimpleTooltipComponent> | null;


  constructor(
    private overlayPositionBuilder: OverlayPositionBuilder,
    private elementRef: ElementRef,
    private overlay: Overlay
  ) {}

  ngOnInit() {

    const positionStrategy = this.overlayPositionBuilder
      // Create position attached to the elementRef
      .flexibleConnectedTo(this.elementRef)
      // Describe how to connect overlay to the elementRef
      // Means, attach overlay's center bottom point to the
      // top center point of the elementRef.
      .withPositions([
        {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom'}, // Center - Top
        {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center'}, // Right - Center
        {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top'}, // Center - Bottom
        {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center'}, // Left - Center
      ]);

    this.overlayRef = this.overlay.create({positionStrategy});
  }

  @HostListener('mouseenter')
  show() {
    // Create tooltip portal
    const tooltipPortal = new ComponentPortal(this.tooltipComp);

    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
    }

    // Attach tooltip portal to overlay
    this.tooltipComponentRef = this.overlayRef?.attach(tooltipPortal);

    // Pass content to tooltip component instance
    if (this.tooltipComponentRef) {
      this.tooltipComponentRef.instance.data = this.data;
    }
  }

  @HostListener('mouseleave')
  hide() {
    this.overlayRef?.detach();
  }

  ngOnDestroy() {
    this.overlayRef?.detach();
    this.tooltipComponentRef?.destroy();
    this.tooltipComponentRef = null;
  }

}
