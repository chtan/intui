import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebSocket2Service } from '../../services/websocket2.service';
import { Taskshared1Service } from '../../services/taskshared1.service';
//import { CookieService } from 'ngx-cookie-service';
import { environment } from "@environment/environment";

@Component({
  selector: 'app-task-10',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './task-10.component.html',
  styleUrl: './task-10.component.scss'
})
export class Task10Component implements OnInit, OnDestroy {
  //cookieService = inject(CookieService);
  isServiceUnavailable = false;
  controls: any;

  // Template task-related variable
  taskid = '10';
  taskToken = '';
  currentPage: '0' | '1' = '0';
  selectedOptionA: string = '';
  selectedOptionB: string = '';

  // Listen to messages on the socket connection
  private wsSubscription!: Subscription;
  receivedMessage: any = '';
  recipientList: string[] = ["chtan"]; // List of recipients of messages
  // message to send out using sendMessage function
  message = "test"; 

  // This ensures that if the coordinator logs out, 
  // the mode remains and he cannot change the task state of a user.
  coordinatorMode: boolean = false;

  // Disconnected-from-server task variables
  state: any = {
    "pageState": [
        {
            "choiceSequence": [
                0
            ],
            "chooseState": false
        },
        {
            "choiceSequence": [
                2
            ],
            "chooseState": false
        },
        {
            "choiceSequence": [],
            "chooseState": true
        }
    ],
    "statistics": {
        "Question 1": "attempted",
        "Question 2": "attempted",
        "Question 3": "not yet attempted"
    }
  }

  /*
  structures: any = [
    {
      "title": "Question 1",
      "mcq": {
          "statement": "What is 1 + 1?\n",
          "choices": [
              2,
              3,
              4,
              5
          ]
      },
      "navigablePages": [
          1
      ]
    },
    {
      "title": "Question 2",
      "mcq": {
          "statement": "What is 1 + 2?\n",
          "choices": [
              2,
              3,
              4,
              5
          ]
      },
      "navigablePages": [
          0, 2
      ]
    },
    {
      "title": "Question 3",
      "mcq": {
          "statement": "What is 1 + 3?\n",
          "choices": [
              2,
              3,
              4,
              5
          ]
      },
      "navigablePages": [
          1
      ]
    },
  ]
  */
  pageIndex: number = 0;
  structure_default: any = {
    "title": "",
    "mcq": {
        "statement": "",
        "choices": []
    },
    "navigablePages": []
  };
  structure: any;

  selectedAnswers: any = [
    null,
    null,
    null
  ]

  constructor(
    private http: HttpClient,
    private wsService: WebSocket2Service,
    private taskshared1Service: Taskshared1Service,
  ) {
    if (localStorage.getItem('Coordinator') != null) {
      this.coordinatorMode = true;
    }

    this.structure = this.structure_default;
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
    //if (localStorage.getItem('task_token') != null) {
    //  this.taskToken = String(localStorage.getItem('task_token'));

    if (localStorage.getItem('anon_token') != null) {
      this.taskToken = String(localStorage.getItem('anon_token'));

      // If not coordinator, then turn on some services.
      // I must turn on the web service because the task needs
      // to list to the coordinator for messages.
      if (!this.coordinatorMode) {
      }

      //
      // CONNECTION TO WEB SERVICE
      //
      this.wsService.connect(this.taskToken, this.taskid);
      this.wsSubscription = this.wsService.messages$.subscribe(
        (message) => {
          if (message) {
            //console.log(message, typeof message, "*******");
            this.receivedMessage = message; // Update component variable

            // Why has this become an object??
            // I thought it's a string that's passed around.
            if (this.receivedMessage['message'] == 'toggle service') {
              this.isServiceUnavailable = this.receivedMessage['data'];
            }
          }
        }
      );

      //
      // REGISTERS VARIABLES FOR LISTENING
      //
      this.taskshared1Service.sharedData_state.subscribe((data: any) => {
        if (data != null) {
          this.state = data;

          for (let i = 0; i < this.state.pageState.length; i++) {
            if (this.state.pageState[i].choiceSequence.length > 0) {
              this.selectedAnswers[i] = this.state.pageState[i].choiceSequence[
                this.state.pageState[i].choiceSequence.length - 1
              ];
            } else {
              this.selectedAnswers[i] = null;
            }
          }
        }
      });

      this.taskshared1Service.sharedData_structure.subscribe((data: any) => {
        if (data != null) {
          this.structure = data;
        }
      });

      this.taskshared1Service.sharedData_controls.subscribe((data: any) => {
        if (data != null) {
          this.controls = data;
          this.isServiceUnavailable = this.controls.on;

          //console.log(this.isServiceUnavailable, data, "???????????????");
        }
      });

      //console.log(this.state, this.structure, this.controls, this.selectedAnswers, "!!");


      //
      // LOAD STATE
      //
      this.handler("getCompositeOnStart")

      /*
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
      */
    }
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks and disconnect WebSocket
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  onAnswerChange(questionIndex: number, answer: number) {
    this.selectedAnswers[questionIndex] = answer;
  }

  submitAnswer(questionIndex: number) {
    // This is for testing only. 
    // Do not allow possiblity of state change when coordinator mode is on.
    //if ((this.selectedAnswers[questionIndex] != null) && (true)) {
    if ((this.selectedAnswers[questionIndex] != null) && (!this.coordinatorMode)) {
      this.handler('submitChoice', questionIndex, this.selectedAnswers[questionIndex]);
    }
  }

  togglePanel(): void {
    document.getElementById('sidePanel')?.classList.toggle('closed');
  }

  navigate(dir: number) {
    const newpage = this.pageIndex + dir;

    if ((newpage >= 0) && (newpage < this.state.pageState.length)) {
      //this.handler('navigate', newpage);

      this.handler("getStructureAtIndex", newpage);
      this.pageIndex = newpage;
      //this.structure = this.structure_default;
      //this.structure = this.structures[this.pageIndex];
    }
  }

  handler(s: string, ...optionalArgs: any[]) {
    if (this.taskToken != "") {
      let uf = [
        [
          s,
          optionalArgs,
        ]
      ];

      /*
      const headers = new HttpHeaders({
        'X-Anonymous-Token': this.taskToken
      });
      */

      const headers = new HttpHeaders({
        'X-Request-Type': 'anonymous'
      })

      const params = new HttpParams()
        .set('applyString', JSON.stringify(uf))
      ;

      this.http.get(
        'http://' + environment.apiUrl + '/api/anon-data/apply-task-method/',
        { headers, params }
      ).subscribe(
          (data: any) => {
            console.log(data, "------------");
            
            this.taskshared1Service.setState(data['composite']['state']);
            this.taskshared1Service.setStructure(data['composite']['structure']);
            this.taskshared1Service.setControls(data['composite']['controls']);
          },

          (error: any) => {
            console.error('Error fetching data:', error);
          }
        );
    }
  }
}
