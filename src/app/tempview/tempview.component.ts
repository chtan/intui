import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from "@environment/environment";


@Component({
  selector: 'app-tempview',
  imports: [],
  templateUrl: './tempview.component.html',
  styleUrl: './tempview.component.scss'
})
export class TempviewComponent {

  constructor(private http: HttpClient, private router: Router) {}

  testing() {
    let taskToken = localStorage.getItem('task_token');

    console.log(taskToken);

    if (taskToken !== null) {
      const headers = new HttpHeaders({
        'X-Anonymous-Token': taskToken
      });

      this.http.get<{ message: string }>('http://' + environment.apiUrl + '/api/anon-data/hello/', { headers })
        .subscribe({
          next: (response) => {
            console.log(response);
          },
          error: () => {
          }
        });
    }
  }
}
