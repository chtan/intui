import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../services/websocket.service';

//import { CookieService } from 'ngx-cookie-service';
import { environment } from "@environment/environment";

@Component({
  selector: 'app-task-9',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './task-9.component.html',
  styleUrl: './task-9.component.scss'
})
export class Task9Component implements OnInit, OnDestroy {
  //cookieService = inject(CookieService);
  taskid = '9';
  taskToken = '';
  currentPage: '0' | '1' = '0';
  selectedOptionA: string = '';
  selectedOptionB: string = '';

  // Listen to messages on the socket connection
  private wsSubscription!: Subscription;
  receivedMessage: string = '';
  recipientList: string[] = ["chtan"]; // List of recipients of messages
  // message to send out using sendMessage function
  message = "test"; 

  // This ensures that if the coordinator logs out, 
  // the mode remains and he cannot change the task state of a user.
  coordinatorMode: boolean = false;

  constructor(
    private http: HttpClient,
    private wsService: WebSocketService,
  ) {
    if (localStorage.getItem('Coordinator') != null) {
      this.coordinatorMode = true;
    }
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
    
    if (localStorage.getItem('task_token') != null) {
      this.taskToken = String(localStorage.getItem('task_token'));

      // Connect to web service
      if (!this.coordinatorMode) {
        this.wsService.connect(this.taskToken);
        this.wsSubscription = this.wsService.messages$.subscribe(
          (message) => {
            if (message) {
              this.receivedMessage = message; // Update component variable
            }
          }
        );
      }

      // load state
      let uf = [
        [
          //'submitChoice',
          //[questionIndex, this.selectedAnswers[questionIndex]],
        ]
      ];

      const headers = new HttpHeaders({
        'X-Anonymous-Token': this.taskToken
      });

      
      const params = new HttpParams()
        .set('applyString', JSON.stringify(uf))
        ;
      
      this.http.get('http://' + environment.apiUrl + '/api/anon-data/get-state/', { headers, params })
        .subscribe({
          next: (response: any) => {
            console.log(response, "get");

            let state = response["state"];
            if (state["0"] != null) {
              this.selectedOptionA = state["0"];
              this.selectedOptionB = state["1"];
            }
            
          },
          error: () => {
          }
        });
    }
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks and disconnect WebSocket
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  toggleView() {
    this.currentPage = this.currentPage === '0' ? '1' : '0';
  }

  handleSelection(view: '0' | '1', value: string) {
    if (!this.coordinatorMode) {

      console.log(`Selected in ${view}: ${value}`);

      let uf = [
        [
          'submitChoice',
          [view, value],
        ]
      ];

      const headers = new HttpHeaders({
        'X-Anonymous-Token': this.taskToken
      });

      const params = new HttpParams()
        .set('applyString', JSON.stringify(uf))
        ;

      // update state
      if (localStorage.getItem('task_token') != null) {
        this.taskToken = String(localStorage.getItem('task_token'));

        const headers = new HttpHeaders({
          'X-Anonymous-Token': this.taskToken
        });

        this.http.get<{ message: string }>('http://' + environment.apiUrl + '/api/anon-data/set-state/', { headers, params })
          .subscribe({
            next: (response: any) => {
              console.log(response, "set");
            },
            error: () => {
            }
          });
      }
    }
  }
}
