import { Component, AfterViewInit, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-taskspace',
  imports: [
    NgFor,
    RouterLink,
  ],
  providers: [
    //DataService, // Don't set this otherwise it will be a different copy!
  ],
  templateUrl: './taskspace.component.html',
  styleUrl: './taskspace.component.scss'
})
export class TaskspaceComponent implements OnInit {
  listOfTids: any[] = [];
  subscription: Subscription;

  constructor(
    private dataService: DataService
  ) {
    this.subscription = this.dataService.data$.subscribe(data => {
      this.listOfTids = data;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
