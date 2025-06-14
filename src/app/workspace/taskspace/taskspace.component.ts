import { Component, AfterViewInit, OnInit, computed, effect, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-taskspace',
  imports: [
    NgFor,
    RouterLink,
  ],
  providers: [],
  templateUrl: './taskspace.component.html',
  styleUrl: './taskspace.component.scss'
})
export class TaskspaceComponent implements OnInit {
  private dataService = inject(DataService);
  listOfTids = this.dataService.data;

  constructor() {
    effect(() => {
      console.log('Data changed:', this.listOfTids());
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }
}
