import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[textareaAutoGrow]',
})
export class TextareaAutoGrowDirective {
  constructor(private el: ElementRef) {}

  /**
   * We initialize the height once the view is ready.
   */
  ngOnInit() {
    this.adjustHeight();
  }

  ngAfterViewInit() {
    // Re-adjust once the view has been fully initialized
    this.adjustHeight();
  }

  /**
   * Listen for input events to dynamically resize the textarea.
   */
  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjustHeight();
  }

  /**
   * Sets the textarea height to its scrollHeight so that it grows
   * to fit its content.
   */
  private adjustHeight(): void {
    const textArea = this.el.nativeElement as HTMLTextAreaElement;

    // Reset height to auto to properly calculate scrollHeight
    textArea.style.height = '1px';

    // Set the height to the scrollHeight plus some offset if needed
    textArea.style.height = `${textArea.scrollHeight}px`;
    console.log('autoGrow:', textArea.scrollHeight);
  }
}
