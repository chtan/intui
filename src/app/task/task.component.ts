import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

//import { CookieService } from 'ngx-cookie-service';

import { Subscription } from 'rxjs';
import { WebSocketService } from '../services/websocket.service';

import { environment } from "@environment/environment";

@Component({
  selector: 'app-task',
  imports: [
    //NgFor,
    //RouterLink,
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent implements OnInit, OnDestroy {
  tid: string | null = '';
  ttid: string = '';
  n: number | null = null;

  // Listen to messages on the socket connection
  private wsSubscription!: Subscription;
  receivedMessage: string = '';
  recipientList = ["chtan"]; // List of recipients of messages
  // message to send out using sendMessage function
  message = ""; 

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private wsService: WebSocketService,
    //private dataService: DataService
  ) {
  }

  // These 2 functions pertain to the widgets at the bottom,
  // created initially to test websocket.
  sendMessage() {
    this.wsService.sendMessage(this.recipientList, this.message);
  }

  disconnect() {
    this.wsService.disconnect();
  }

  ngOnInit() {
    this.tid = this.route.snapshot.paramMap.get('tid'); // Read the 'tid' from the URL

    if (this.tid != null) {
      let params = new HttpParams()
        .set('tid', this.tid)
      ;

      // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
      this.http.get('http://' + environment.apiUrl + '/task', { params })
        .subscribe(
          (data: any) => {
            console.log(data);

            if (data['status'] != 'ok') {

            }

            this.ttid = data['tasktypeid'];
            //this.state = data['state'];
            this.n = data['state']['n'];

            this.wsService.connect(String(this.tid));

            this.wsSubscription = this.wsService.messages$.subscribe(
              (message) => {
                if (message) {
                  this.receivedMessage = message; // Update component variable
                }
              }
            );
          },

          (error: any) => {
            console.error('Error fetching data:', error);
          }
        );
    }
  }

  changeValue() {
    if (this.n !== null) {

      // Sent the incremented n to the server for updating.
      // If successful, update the local state.
      if (this.tid != null) {
        let params = new HttpParams()
          .set('n', Number(this.n) + 1)
          .set('tid', this.tid)
        ;

        this.http.get('http://' + environment.apiUrl + '/task/update_state', { params })
          .subscribe((data: any) => {
            console.log(data);

            if (data['status'] != 'ok') {

            }

            this.n = data['state']['n'];
          },
          (error) => {
            console.error('Error fetching data:', error);
          });
      }
    }
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks and disconnect WebSocket
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }
}
