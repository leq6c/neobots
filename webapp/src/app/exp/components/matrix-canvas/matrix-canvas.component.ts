import {
  Component,
  type ElementRef,
  ViewChild,
  type AfterViewInit,
  type OnDestroy,
} from '@angular/core';

@Component({
  selector: 'app-matrix-canvas',
  templateUrl: './matrix-canvas.component.html',
})
export class MatrixCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('matrixCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private drops: number[] = [];

  ngAfterViewInit(): void {
    this.initCanvas();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.drops = Array(Math.floor(canvas.width / 20)).fill(0);
    };

    // Initial setup
    resizeCanvas();

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    this.animate();
  }

  private animate(): void {
    const characters =
      'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const canvas = this.canvasRef.nativeElement;

    const draw = () => {
      // Create a semi-transparent black rectangle to create fade effect
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);

      this.ctx.font = '15px monospace';

      // Loop through each column
      for (let i = 0; i < this.drops.length; i++) {
        // Get a random character
        const text = characters.charAt(
          Math.floor(Math.random() * characters.length)
        );

        // Random color with varying opacity
        this.ctx.fillStyle = `rgba(0, 255, ${Math.random() * 255}, ${
          Math.random() * 0.5 + 0.1
        })`;

        // Draw the character
        this.ctx.fillText(text, i * 20, this.drops[i] * 20);

        // Reset drop when it reaches bottom or randomly
        if (this.drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          this.drops[i] = 0;
        }

        // Move drop down
        this.drops[i]++;
      }

      this.animationId = requestAnimationFrame(draw);
    };

    draw();
  }
}
