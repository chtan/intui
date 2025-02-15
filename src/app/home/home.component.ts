import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import katex from 'katex';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('mathContainer', { static: true }) mathContainer!: ElementRef;

  constructor() {
  }

  ngAfterViewInit() {
    //katex.render("c = \\pm\\sqrt{a^2 + b^2}", this.mathContainer.nativeElement, {
    //  throwOnError: false
    //});
  }
}
