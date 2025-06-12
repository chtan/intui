import { Component, inject, AfterViewInit  } from '@angular/core';
import { NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

//import { CookieService } from 'ngx-cookie-service';
import { environment } from "@environment/environment";

import { DataService } from '../services/data.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-workspace',
  imports: [
    RouterLink,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
  ],
  providers: [ 
    //CookieService,
    DataService,
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent implements AfterViewInit {
  //cookieService = inject(CookieService);
  dataService = inject(DataService);

  uid: string | null = ''; // e.g. chtan
  listOfTids: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {
  }

  ngOnInit() {
    //this.uid = this.route.snapshot.paramMap.get('uid'); // Read the 'uid' from the URL
    this.uid = localStorage.getItem('Coordinator');

    if (this.uid != null) {
      const headers = new HttpHeaders({
        'X-Request-Type': 'logged-in'
      });

      let params = new HttpParams()
        .set('uid', this.uid)
      ;

      this.http.get('http://' + environment.apiUrl + '/api/workspace', {
        headers: headers,
        params: params
      }).subscribe(
          (data: any) => {
            //console.log(data, data['status'] == 'ok', '???');

            if (data['status'] != 'ok') {
              this.router.navigate(['/']);
            }

            this.listOfTids = data['tids'];
            this.dataService.updateData(this.listOfTids);
          },

          (error: any) => {
            console.error('Error fetching data:', error);
          }
        );
    }
  }

  ngAfterViewInit() {
  }

  logout(event: Event) {
    event.preventDefault();  // prevent default link behavior

    const refresh = localStorage.getItem('refresh_token');

    this.http.post('http://' + environment.apiUrl + '/users/logout/', { refresh }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    }).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: () => {
        // Even if logout fails, remain on current page
        this.authService.logout();
        this.router.navigate(['.']);
      }
    });
  }
}
