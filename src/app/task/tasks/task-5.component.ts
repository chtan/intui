import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { TaskSharedService } from '../../services/task-shared.service';
import { environment } from "@environment/environment";

@Component({
  selector: 'app-task-5',
  imports: [],
  templateUrl: './task-5.component.html',
  styleUrl: './task-5.component.scss'
})
export class Task5Component implements OnInit {
  tid: string = "";
  state: any = null;

  constructor(
    private http: HttpClient,
    private taskSharedService: TaskSharedService,
  ) {
  }

  ngOnInit() {
    this.taskSharedService.currentData_tid.subscribe((data: any) => {
      this.tid = data;
    });

    this.taskSharedService.currentData_state.subscribe((data: any) => {
      this.state = data;
    });
  }

  handler(s: string) {
    if (this.tid != "") {
      let uf = [
        [
          s,
          [],
        ]
      ];

      let params = new HttpParams()
        .set('tid', this.tid)
        .set('applyString', JSON.stringify(uf))
      ;

      this.http.get('http://' + environment.apiUrl + '/task/update_state3', { params })
        .subscribe(
          (data: any) => {
            console.log(data);
            this.state = data['state'];
          },

          (error: any) => {
            console.error('Error fetching data:', error);
          }
        );
    }
  }
}
