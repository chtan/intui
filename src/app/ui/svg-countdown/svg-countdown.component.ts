import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-svg-countdown',
  templateUrl: './svg-countdown.component.html',
  styleUrls: ['./svg-countdown.component.scss'],
})
export class SvgCountdownComponent implements OnInit, OnDestroy {
  @Input() duration: number = 5; // Countdown duration in seconds
  @Input() enableSound: boolean = true; // Toggle sound
  @Output() countdownComplete = new EventEmitter<void>();

  private intervalId: any; // Interval ID for clearing later
  private startTime: number = 0; // To track when countdown started
  public remainingTime: number = 0; // Time left in countdown
  public circumference: number = 2 * Math.PI * 45; // Circumference of circle (radius 45)

  constructor() {}

  ngOnInit(): void {
    this.remainingTime = this.duration;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  startCountdown() {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear any previous countdown
    }

    this.remainingTime = this.duration;
    this.startTime = Date.now();

    // Start interval to update countdown
    this.intervalId = setInterval(() => {
      
      this.remainingTime = this.duration - Math.floor((Date.now() - this.startTime) / 1000);

      // -1 because it takes another 1 sec for the SVG to complete the effect.
      if (this.remainingTime <= -1) {
        clearInterval(this.intervalId);

        if (this.enableSound) {
          const audio = new Audio('sounds/bell.wav'); // Path to your bell sound
          audio.play();

          audio.onended = () => {
            // Emit the event without any data
            this.countdownComplete.emit(); // Emit the event to notify parent that countdown is complete.
          };
        }
      }
    }, 1000); // Update every second
  }

  get dashOffset() {
    return this.circumference - (Math.max(0, this.remainingTime) / this.duration) * this.circumference;
  }
}
