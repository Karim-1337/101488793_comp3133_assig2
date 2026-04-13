import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCardHover]',
  standalone: true,
})
export class CardHoverDirective {
  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly r: Renderer2
  ) {}

  @HostListener('mouseenter') onEnter(): void {
    this.r.setStyle(this.el.nativeElement, 'box-shadow', '0 4px 12px rgba(0,0,0,0.12)');
    this.r.setStyle(this.el.nativeElement, 'transform', 'translateY(-1px)');
  }

  @HostListener('mouseleave') onLeave(): void {
    this.r.removeStyle(this.el.nativeElement, 'box-shadow');
    this.r.removeStyle(this.el.nativeElement, 'transform');
  }
}
