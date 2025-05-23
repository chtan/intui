import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { environment } from "@environment/environment";

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    const body = { username: this.username, password: this.password };
    this.http.post<any>('http://' + environment.apiUrl + '/users/login/', body)
      .subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          this.router.navigate(['/workspace', this.username]);
        },
        error: () => {
          this.router.navigate(['/']);
        }
      });
  }
}
