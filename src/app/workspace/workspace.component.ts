import { Component, inject, AfterViewInit  } from '@angular/core';
import { NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

//import { CookieService } from 'ngx-cookie-service';
import { environment } from "@environment/environment";

import { DataService } from '../services/data.service';

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
    private router: Router
  ) {
  }

  ngOnInit() {
    //this.uid = this.route.snapshot.paramMap.get('uid'); // Read the 'uid' from the URL
    this.uid = localStorage.getItem('Coordinator');

    if (this.uid != null) {
      let params = new HttpParams()
        .set('uid', this.uid + '')
      ;

      // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
      this.http.get('http://' + environment.apiUrl + '/workspace', { params })
        .subscribe(
          (data: any) => {
            //console.log(data, data['status'] == 'ok', '???');

            if (data['status'] != 'ok') {
              localStorage.removeItem('Coordinator');
              this.router.navigate(['/']);
            }

            this.listOfTids = data['tids'];
            this.dataService.updateData(this.listOfTids);
            localStorage.setItem('Coordinator', String(this.uid));
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('Coordinator');
        this.router.navigate(['/']);
      },
      error: () => {
        // Even if logout fails, remain on current page
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('Coordinator');
        this.router.navigate(['.']);
      }
    });
  }
}
