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
    //console.log(localStorage.getItem('Coordinator'), "!!!!");

    if (localStorage.getItem('Coordinator') != null) {
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
          //this.router.navigate(['/workspace', this.username]);
        },
        error: () => {
          this.router.navigate(['/']);
        }
      });
  }
}
