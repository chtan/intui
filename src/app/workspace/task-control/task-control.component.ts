import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
//import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';

import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

import { CookieService } from 'ngx-cookie-service';
import { environment } from "@environment/environment";

// Ref: https://blog.logrocket.com/data-visualization-angular-d3-js/
import * as d3 from 'd3';
declare var $: any;

@Component({
  selector: 'app-task-control',
  imports: [
    //NgFor,
    MatButtonToggleModule,
    CommonModule,
    RouterLink,
    FormsModule,
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
  globalStatistics: any = {};


  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private wsService: WebSocketService
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

    // this does not do the job as it is one-off
    //this.tid = this.route.snapshot.paramMap.get('tid'); // Read the 'uid' from the URL
  }

  private loadTask(): void {

    // Clear the contents
    this.links = [];
    this.clearSvg();

    if (this.tid == "1") {

      if (this.cookieService.check('Coordinator')) {

        let params = new HttpParams()
          .set('uid', this.cookieService.get('Coordinator'))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
          .subscribe(
            (data: any) => {
              //console.log("!!!!", data);

              if (data['status'] != 'ok') {
                this.cookieService.delete('Coordinator');
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
              this.wsService.connect(this.cookieService.get('Coordinator'));

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
      if (this.cookieService.check('Coordinator')) {

        let params = new HttpParams()
          .set('uid', this.cookieService.get('Coordinator'))
          .set('tid', String(this.tid))
        ;

        // Get task coordinator state for this userId (e.g. chtan, who is the task coordinator here)
        this.http.get('http://' + environment.apiUrl + '/workspace/task', { params })
          .subscribe(
            (data: any) => {
              //console.log('000', data);
              
              if (data['status'] != 'ok') {
                this.cookieService.delete('Coordinator');
                this.router.navigate(['/']);
              }

              var tmpstate = data['state'];
              this.globalStatistics = data['statistics'];
              console.log("$%^", this.globalStatistics);

              //console.log(tmpstate, tmpstate["6b26107c"], "****", typeof tmpstate);
              for (const key in tmpstate) {
                this.links.push(String(key));
                this.state[key] = tmpstate[key]["n"];
              }
              this.recipientList = this.links;
              

              // Connect to websocket
              this.wsService.connect(this.cookieService.get('Coordinator'));

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
}
