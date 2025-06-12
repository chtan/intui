import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { environment } from "@environment/environment";
//import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  //cookieService = inject(CookieService);

  username = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {
    // This condition is added because sometimes coordinator is not null
    // while the other 2 items are. Not sure why that happens.
    // But it causes the system to hang on the front page,
    // user unable to log in.
    if (
      localStorage.getItem('Coordinator') === null ||
      localStorage.getItem('access_token') === null ||
      localStorage.getItem('refresh_token') === null
    ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('Coordinator');
    }

    // User can't log in when they were previously logged in with session token which is uncleared.
    // Need to do something about it...
    if ((Boolean(1)) && (localStorage.getItem('Coordinator') != null)) {
      this.router.navigate(['/workspace']);
    }
  }

  login() {
    const body = { username: this.username, password: this.password };
    this.http.post<any>('http://' + environment.apiUrl + '/users/login/', body)
      .subscribe({
        next: (res) => {
          // localStorage is only stored on browser and is not sent to server
          // unlike cookies.
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          localStorage.setItem('Coordinator', this.username + '');

          this.router.navigate(['/workspace']);
        },
        error: () => {
          this.router.navigate(['/']);
        }
      });
  }
}
