import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { environment } from "@environment/environment";

@Component({
  selector: 'app-go-task',
  imports: [
    FormsModule,
  ],
  templateUrl: './go-task.component.html',
  styleUrl: './go-task.component.scss'
})
export class GoTaskComponent {
  taskToken = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  submitToken() {
    const headers = new HttpHeaders({
      'X-Anonymous-Token': this.taskToken
    });

    this.http.get<{ message: string }>('http://' + environment.apiUrl + '/api/anon-data/', { headers })
      .subscribe({
        next: (response) => {
          localStorage.setItem('task_token', this.taskToken); // Save token
          this.router.navigate(['/tempview']); // Go to guarded page
        },
        error: () => {
          this.router.navigate(['/']); // Go home if invalid
        }
      });
  }
}

