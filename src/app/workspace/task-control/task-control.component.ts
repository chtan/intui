import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';

import { environment } from "@environment/environment";
//import { WebSocketService } from '../../services/websocket.service';
import { WebSocket1Service } from '../../services/websocket1.service';

import { Histogram1Component } from "../../charts/histogram1/histogram1.component"

// Ref: https://blog.logrocket.com/data-visualization-angular-d3-js/
import * as d3 from 'd3';
declare var $: any;

@Component({
  selector: 'app-task-control',
  imports: [
    //NgFor,
    MatButtonToggleModule,
    MatSlideToggleModule,
    CommonModule,
    RouterLink,
    FormsModule,
    Histogram1Component,
  ],
  providers: [ CookieService ],
  templateUrl: './task-control.component.html',
  styleUrl: './task-control.component.scss'
})
export class TaskControlComponent implements OnInit, OnDestroy {
  cookieService = inject(CookieService);

  tid: string | null = ''; // e.g. '1'
  links: any = [];
  state: any = {};

  // Listen to messages on the socket connection
  private wsSubscription!: Subscription;
  receivedMessage: any;
  recipientList = []; // List of recipients of messages
  // message to send out using sendMessage function
  message = "";

  // d3
  private svg: any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  statistics: any[] = [];
  globalStatistics: any;
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

  environment = environment;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
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

      //this.loadControls();
      this.loadTask();  // Function to update content
    });

    // this does not do the job as it is one-off
    //this.tid = this.route.snapshot.paramMap.get('tid'); // Read the 'uid' from the URL
  }

  onToggleChange(event: MatSlideToggleChange) {
    //console.log('Slide Toggle Changed:', event.checked); // Will log true or false based on the toggle state
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
    if (this.tid != null && +this.tid >= 10) {
      let uf = [
        [
          s,
          optionalArgs,
        ]
      ];

      const refresh = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');
      const coordinator = localStorage.getItem('Coordinator');

      // Build headers
      const headers = new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
        'x-refresh-token': refresh || ''  // optional: custom header for refresh token
      });

      // Build query params
      let params = new HttpParams()
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


    } else if (this.tid != "") {
      let uf = [
        [
          s,
          optionalArgs,
        ]
      ];

      let params = new HttpParams()
        .set('uid', String(localStorage.getItem('Coordinator')))
        .set('tid', String(this.tid))
        .set('applyString', JSON.stringify(uf))
      ;

      this.http.get('http://' + environment.apiUrl + '/workspace/download_data', {
        responseType: 'blob' as 'json',
        params: params
      }).subscribe((blob: any) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'data.csv';
          document.body.appendChild(a); // For Firefox
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
    }
  }

  handler(s: string, ...optionalArgs: any[]) {

    if (this.tid != null && +this.tid < 9) {
      let uf = [
        [
          s,
          optionalArgs,
        ]
      ];

      let params = new HttpParams()
        .set('uid', String(localStorage.getItem('Coordinator')))
        .set('tid', String(this.tid))
        .set('applyString', JSON.stringify(uf))
      ;

      this.http.get('http://' + environment.apiUrl + '/workspace/update_state', { params })
        .subscribe(
          (data: any) => {
            console.log(data);

          },

          (error: any) => {
            console.error('Error fetching data:', error);
          }
        );
    } else if (this.tid != null && +this.tid >= 10) {
      let uf = [
        [
          s,
          optionalArgs,
        ]
      ];



      console.log(s, optionalArgs);

      const refresh = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');

      const headers = new HttpHeaders({
        Authorization: `Bearer ${accessToken}`,
        'x-refresh-token': refresh || ''  // optional: custom header for refresh token
      });

      let params = new HttpParams()
        .set('uid', String(localStorage.getItem('Coordinator')))
        .set('tid', String(this.tid))
        .set('applyString', JSON.stringify(uf))
      ;

      // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
      //        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
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
  }


  private loadTask(): void {

    // Clear the contents
    this.links = [];
    this.clearSvg();

    if (this.tid == "1") {

      if (localStorage.getItem('Coordinator') != null) {

        let params = new HttpParams()
          .set('uid', String(localStorage.getItem('Coordinator')))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
          .subscribe(
            (data: any) => {
              //console.log("!!!!", data);

              if (data['status'] != 'ok') {
                localStorage.removeItem('Coordinator');
                this.router.navigate(['/']);
              }

              var tmpstate = data['state'];

              //console.log(tmpstate, tmpstate["6b26107c"], "****", typeof tmpstate);
              for (const key in tmpstate) {
                this.links.push(String(key));
                this.state[key] = tmpstate[key]["n"];
              }
              this.recipientList = this.links;
              //console.log("abc", this.recipientList, this.state);
            
              // Connect to websocket
              this.wsService.connect(String(localStorage.getItem('Coordinator')));

              // Subscribe to listen to and use incoming messages
              this.wsSubscription = this.wsService.messages$.subscribe(
                (message) => {
                  if (message) {
                    this.receivedMessage = message;

                    if (this.receivedMessage["message"] == "update state") {
                      this.state[this.receivedMessage["sender"]] = this.receivedMessage["data"]["n"];
                      //console.log(this.state);

                      // Draw Chart
                      this.statistics = Object.entries(this.state).map(([Id, N]) => ({ Id, N }));
                      //this.drawBars(this.statistics);
                      this.updateBar([{
                        Id: this.receivedMessage["sender"],
                        N: this.receivedMessage["data"]["n"],
                      }]);
                    }
                  }
                }
              );

              // Draw Chart
              this.statistics = Object.entries(this.state).map(([Id, N]) => ({ Id, N }));
              this.drawBars(this.statistics);
            },
            
            (error: any) => {
              console.error('Error fetching data:', error);
            }
          );
      }
    } else if (this.tid == "3") {
      if (localStorage.getItem('Coordinator') != null) {

        let params = new HttpParams()
          .set('uid', String(localStorage.getItem('Coordinator')))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
          .subscribe(
            (data: any) => {
              //console.log('000', data);
              
              if (data['status'] != 'ok') {
                localStorage.removeItem('Coordinator');
                this.router.navigate(['/']);
              }

              var tmpstate = data['state'];
              this.globalStatistics = data['statistics'];
              //console.log("$%^", this.globalStatistics);

              //console.log(tmpstate, tmpstate["6b26107c"], "****", typeof tmpstate);
              for (const key in tmpstate) {
                this.links.push(String(key));
                this.state[key] = tmpstate[key]["n"];
              }
              this.recipientList = this.links;
              

              // Connect to websocket
              this.wsService.connect(String(localStorage.getItem('Coordinator')));

              // Subscribe to listen to and use incoming messages
              this.wsSubscription = this.wsService.messages$.subscribe(
                (message) => {
                  if (message) {
                    //console.log("Web Socket", message);
                    this.receivedMessage = message;

                    if (message['message'] == 'update statistics') {
                      this.globalStatistics = message['data'];
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
    } else if (this.tid == "4") {
      if (localStorage.getItem('Coordinator') != null) {

        let params = new HttpParams()
          .set('uid', String(localStorage.getItem('Coordinator')))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
          .subscribe(
            (data: any) => {
              console.log('000', data);
              
              if (data['status'] != 'ok') {
                localStorage.removeItem('Coordinator');
                this.router.navigate(['/']);
              }

              var tmpstate = data['state'];

              for (const key in tmpstate) {
                this.links.push(String(key));
                this.state[key] = tmpstate[key]["n"];
              }
              this.recipientList = this.links;
            },
            
            (error: any) => {
              console.error('Error fetching data:', error);
            }
          );
      }
    } else if (this.tid == "5") {
      if (localStorage.getItem('Coordinator') != null) {

        let params = new HttpParams()
          .set('uid', String(localStorage.getItem('Coordinator')))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
          .subscribe(
            (data: any) => {
              //console.log('000', data);
              
              if (data['status'] != 'ok') {
                localStorage.removeItem('Coordinator');
                this.router.navigate(['/']);
              }

              var tmpstate = data['state'];

              this.controls = data['controls'];


              for (const key in tmpstate) {
                this.links.push(String(key));
                this.state[key] = tmpstate[key]["n"];
              }
              this.recipientList = this.links;

              // Connect to websocket
              this.wsService.connect(String(localStorage.getItem('Coordinator')));

              // Subscribe to listen to and use incoming messages
              this.wsSubscription = this.wsService.messages$.subscribe(
                (message) => {
                  if (message) {
                    this.receivedMessage = message;
                  }
                }
              );
            },
            
            (error: any) => {
              console.error('Error fetching data:', error);
            }
          );
      }

    //} else if (this.tid == "6") {
    } else if (environment.constants.workspaceStdVar2.includes(this.tid + '')) {
      if (localStorage.getItem('Coordinator') != null) {

        let params = new HttpParams()
          .set('uid', String(localStorage.getItem('Coordinator')))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
          .subscribe(
            (data: any) => {
              if (data['status'] != 'ok') {
                localStorage.removeItem('Coordinator');
                this.router.navigate(['/']);
              }

              var tmpstate = data['state'];
              this.globalStatistics = data['statistics'];

              for (const key in tmpstate) {
                this.links.push(String(key));
                this.state[key] = tmpstate[key]["n"];
              }
              this.recipientList = this.links;

              // Connect to websocket
              this.wsService.connect(String(localStorage.getItem('Coordinator')));

              // Subscribe to listen to and use incoming messages
              this.wsSubscription = this.wsService.messages$.subscribe(
                (message) => {
                  if (message) {
                    console.log("Web Socket", message);
                    this.receivedMessage = message;

                    if (message['message'] == 'update statistics') {
                      this.globalStatistics = message['data'];
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
    }  else if (['8', '9'].includes(this.tid + '')) {
      if (localStorage.getItem('Coordinator') != null) {

        let params = new HttpParams()
          .set('uid', String(localStorage.getItem('Coordinator')))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
          .subscribe(
            (data: any) => {
              if (data['status'] != 'ok') {
                localStorage.removeItem('Coordinator');
                this.router.navigate(['/']);
              }

              var tmpstate = data['state'];

              for (const key in tmpstate) {
                this.links.push(String(key));
                this.state[key] = tmpstate[key]["n"];
              }
              this.recipientList = this.links;

              // Connect to websocket
              this.wsService.connect(String(localStorage.getItem('Coordinator')));

              // Subscribe to listen to and use incoming messages
              this.wsSubscription = this.wsService.messages$.subscribe(
                (message) => {
                  if (message) {
                    //console.log("Web Socket", message);
                    this.receivedMessage = message;

                    if (this.receivedMessage["message"] == "update global statistics") {
                      this.globalStatistics = JSON.parse(this.receivedMessage["data"]);
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
    }  else if (this.tid != null && +this.tid >= 10) {
      if (localStorage.getItem('Coordinator') != null) {

        const refresh = localStorage.getItem('refresh_token');
        const accessToken = localStorage.getItem('access_token');

        const headers = new HttpHeaders({
          Authorization: `Bearer ${accessToken}`,
          'x-refresh-token': refresh || ''  // optional: custom header for refresh token
        });

        let params = new HttpParams()
          .set('uid', String(localStorage.getItem('Coordinator')))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        //        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
        this.http.get('http://' + environment.apiUrl + '/api/workspace/task', {
          headers: headers,
          params: params
        }).subscribe(
            (data: any) => {
              console.log(data, "!!!!!!");

              if (data['status'] != 'ok') {
                localStorage.removeItem('Coordinator');
                this.router.navigate(['/']);
              }

              var tmpstate = data['state'];

              for (const key in tmpstate) {
                this.links.push(String(key));
                this.state[key] = tmpstate[key]["n"];
              }
              this.recipientList = this.links;

              this.globalStatistics = data["statistics"];
              this.questionStats = this.globalStatistics;

              this.isServiceUnavailable = data['controls']['on'];

              // Draw statistics chart


              // Connect to websocket
              this.wsService.connect(String(localStorage.getItem('Coordinator')), String(localStorage.getItem('access_token')));

              // Subscribe to listen to and use incoming messages
              this.wsSubscription = this.wsService.messages$.subscribe(
                (message) => {
                  if (message) {
                    //console.log("Web Socket", message);
                    this.receivedMessage = message;

                    if (this.receivedMessage["message"] == "update global statistics") {
                      this.globalStatistics = JSON.parse(this.receivedMessage["data"]);
                      this.questionStats = this.globalStatistics;
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
    } else {

    }
  }

  private clearSvg(): void {
    d3.select("figure#bar")
      .select("svg")
      .remove(); // Remove existing SVG
  }

  private createSvg(): void {
    this.svg = d3.select("figure#bar")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[]): void {
    this.createSvg();

    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.Id))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, 200])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: any) => x(d.Id))
      .attr("y", (d: any) => y(d.N))
      .attr("width", x.bandwidth())
      .attr("height", (d: any) => this.height - y(d.N))
      .attr("fill", "#d04a35");
  }

  // https://chatgpt.com/c/67b09d7d-72f0-8001-88ac-c99a82499da6
  private updateBar(updatedData: any[]): void {
    // Update Y-axis scale in case the value range changes
    const y = d3.scaleLinear()
      .domain([0, 200]) // Adjust domain if needed
      .range([this.height, 0]);

    // Select the bar chart
    const bars = this.svg.selectAll("rect")
      .data(updatedData, (d: any) => d.Id); // Use Id as key

    // Transition the affected bar
    bars.transition()
      .duration(500)
      .attr("y", (d: any) => y(d.N))
      .attr("height", (d: any) => this.height - y(d.N));
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
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks and disconnect WebSocket
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  goToTokenPage(event: Event) {

    event.preventDefault();
    const taskToken = (event.target as HTMLElement).innerText;

    if (this.tid != null && +this.tid == 8) {

      const headers = new HttpHeaders({
        'X-Anonymous-Token': taskToken
      });

      this.http.get<{ message: string }>('http://' + environment.apiUrl + '/api/anon-data/', { headers })
        .subscribe({
          next: (response) => {
            localStorage.setItem('task_token', taskToken); // Save token

            const url = this.router.serializeUrl(
              this.router.createUrlTree(['/tempview'])
            );
            //this.router.navigate(['/tempview']); // Go to guarded page
            window.open(url, '_blank');
          },
          error: () => {
            this.router.navigate(['/']); // Go home if invalid
          }
        });

    } else if (this.tid != null && +this.tid >= 9) {

      // This is coordinator trying to view the current state.

      const headers = new HttpHeaders({
        'X-Anonymous-Token': taskToken
      });

      this.http.get<{ message: string }>('http://' + environment.apiUrl + '/api/anon-data/', { headers })
        .subscribe({
          next: (response: any) => {
            localStorage.setItem('task_token', taskToken); // Save token

            const url = this.router.serializeUrl(
              this.router.createUrlTree(['/taskpad'])
            );
            //this.router.navigate(['/tempview']); // Go to guarded page
            window.open(url + '?taskid=' + response['taskid'], '_blank');
          },
          error: () => {
            this.router.navigate(['/']); // Go home if invalid
          }
        });

    }

  }
}
