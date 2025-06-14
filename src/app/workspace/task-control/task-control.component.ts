import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { environment } from "@environment/environment";
import { WebSocket1Service } from '../../services/websocket1.service';
import { Histogram1Component } from "../../charts/histogram1/histogram1.component"

// Ref: https://blog.logrocket.com/data-visualization-angular-d3-js/
//import * as d3 from 'd3';
//declare var $: any;

@Component({
  selector: 'app-task-control',
  imports: [
    MatButtonToggleModule,
    MatSlideToggleModule,
    CommonModule,
    FormsModule,
    Histogram1Component,
  ],
  providers: [],
  templateUrl: './task-control.component.html',
  styleUrl: './task-control.component.scss'
})
export class TaskControlComponent implements OnInit, OnDestroy {
  tid: string | null = ''; // e.g. '1'
  links: any = [];
  state: any = {};

  // Listen to messages on the socket connection
  private wsSubscription!: Subscription;
  receivedMessage: any;
  recipientList = []; // List of recipients of messages
  // message to send out using sendMessage function
  message = "";

  statistics: any[] = [];
  questionStats: any;
  /*
  questionStats: any = {
    "Question 1": { attempted: 1, not_attempted: 1 },
    "Question 2": { attempted: 0, not_attempted: 2 },
    "Question 3": { attempted: 2, not_attempted: 0 }
  };
  */
  
  isChecked = false; // Initially the toggle is off
  controls: any = {};
  isServiceUnavailable: Boolean = false;

  // Readable in html
  environment = environment;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private wsService: WebSocket1Service,
  ) {}

  // These 2 functions pertain to the widgets at the bottom,
  // created initially to test websocket.
  sendMessage() {
    this.wsService.sendMessage(this.recipientList, this.message);
  }

  disconnect() {
    this.wsService.disconnect();
  }


  ngOnInit() {
    // need to listen for changes using params observable
    this.route.params.subscribe(params => {
      this.tid = params['tid']; // Extract 'id' from URL

      this.loadTask();  // Function to update content
    });
  }


  // Controls
  onToggleChange(event: MatSlideToggleChange) {
    this.isChecked = event.checked; // You can also update the component's state here

    if (this.tid != null && +this.tid < 9) {
      this.handler("set_auto", Number(this.isChecked));
      this.controls.auto = this.isChecked;
    } else if (this.tid != null && +this.tid >= 10) {
      this.handler("toggleService", Number(this.isChecked));
      this.isServiceUnavailable = this.isChecked;
    }
  }


  downloadData(s: string, ...optionalArgs: any[]) {
    let uf = [
      [
        s,
        optionalArgs,
      ]
    ];

    const coordinator = localStorage.getItem('Coordinator');

    const headers = new HttpHeaders({
      'X-Request-Type': 'logged-in'
    });

    // Build query params
    let params: HttpParams = new HttpParams()
      .set('uid', String(coordinator))
      .set('tid', String(this.tid))
      .set('applyString', JSON.stringify(uf));

    // Make the HTTP GET request with headers and params
    this.http.get('http://' + environment.apiUrl + '/api/workspace/download-data', {
      headers: headers,
      responseType: 'blob' as 'json',
      params: params
    }).subscribe((blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
    
  }


  handler(s: string, ...optionalArgs: any[]) {
    let uf = [
      [
        s,
        optionalArgs,
      ]
    ];

    const headers = new HttpHeaders({
      'X-Request-Type': 'logged-in'
    });

    let params = new HttpParams()
      .set('uid', String(localStorage.getItem('Coordinator')))
      .set('tid', String(this.tid))
      .set('applyString', JSON.stringify(uf))
    ;

    this.http.get('http://' + environment.apiUrl + '/api/workspace/apply-task-method', {
      headers: headers,
      params: params
    }).subscribe(
      (data: any) => {
        console.log(data);
      },

      (error: any) => {
        console.error('Error fetching data:', error);
      }
    );
  }


  private loadTask(): void {
    // Clear the contents
    this.links = [];

    if (localStorage.getItem('Coordinator') != null) {
      const headers = new HttpHeaders({
        'X-Request-Type': 'logged-in'
      });

      let params = new HttpParams()
        .set('uid', String(localStorage.getItem('Coordinator')))
        .set('tid', String(this.tid))
      ;

      this.http.get('http://' + environment.apiUrl + '/api/workspace/task', {
        headers: headers,
        params: params
      }).subscribe(
        (data: any) => {
          if (data['status'] != 'ok') {
            this.router.navigate(['/']);
          }

          var tmpstate = data['state'];

          for (const key in tmpstate) {
            this.links.push(String(key));
            this.state[key] = tmpstate[key]["n"];
          }
          this.recipientList = this.links;
          this.questionStats = data["statistics"];
          this.isServiceUnavailable = data['controls']['on'];

          // Draw statistics chart


          // Connect to websocket
          this.wsService.connect(
            String(localStorage.getItem('Coordinator')), 
            String(localStorage.getItem('access_token')),
            this.tid + ''
          );

          // Subscribe to listen to and use incoming messages
          this.wsSubscription = this.wsService.messages$.subscribe(
            (message) => {
              if (message) {
                //console.log("Web Socket", message);
                this.receivedMessage = message;

                if (this.receivedMessage["message"] == "update global statistics") {
                  this.questionStats = JSON.parse(this.receivedMessage["data"]);
                }
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


  goToTokenPage(event: Event) {
    event.preventDefault();
    const taskToken = (event.target as HTMLElement).innerText;
    localStorage.setItem('anon_token', taskToken);

    const headers = new HttpHeaders({
      'X-Request-Type': 'anonymous'
    })

    this.http.get<{ message: string }>(
      'http://' + environment.apiUrl + '/api/anon-data/', 
      { headers }
    ).subscribe({
        next: (response: any) => {
          const url = this.router.serializeUrl(
            this.router.createUrlTree(['/taskpad'])
          );
          window.open(url + '?taskid=' + response['taskid'], '_blank');
        },
        error: () => {
          this.router.navigate(['/']); // Go home if invalid
        }
    });
  }


  ngAfterViewInit() {
    // This error: ExpressionChangedAfterItHasBeenCheckedError
    // occurs when the component state and the UI state are not in sync.
    // It can happen if a variable is changed after 
    // the change dectection cycle is completed.
    // Here, we manually trigger the change detection cycle so that 
    // angular can resolve the differeces again.
    //
    // Somehow this.selectedValue is set to undefined somewhere which I can't find.
    //this.cdr.detectChanges();
  }


  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks and disconnect WebSocket
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }
}
