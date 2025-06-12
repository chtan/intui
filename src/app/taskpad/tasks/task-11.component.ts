import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MarkdownModule } from 'ngx-markdown';
import { environment } from "@environment/environment";
import { Taskshared1Service } from '../../services/taskshared1.service';
import { WebSocket2Service } from '../../services/websocket2.service';
import { SvgCountdownComponent } from '../../ui/svg-countdown/svg-countdown.component';

@Component({
  selector: 'app-task-11',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    SvgCountdownComponent,
  ],
  templateUrl: './task-11.component.html',
  styleUrl: './task-11.component.scss'
})
export class Task11Component implements OnInit, OnDestroy {
  TESTING = true;

  @ViewChild(SvgCountdownComponent) countdownComponent!: SvgCountdownComponent; // Reference to countdown component

  //cookieService = inject(CookieService);
  taskid = '11';
  taskToken = '';

  // Listen to messages on the socket connection
  private wsSubscription!: Subscription;
  receivedMessage: string = '';
  recipientList: string[] = ["chtan"]; // List of recipients of messages
  // message to send out using sendMessage function
  message = "test"; 

  // This ensures that if the coordinator logs out, 
  // the mode remains and he cannot change the task state of a user.
  coordinatorMode: boolean = false;

  state: any = {
    page: 0,
    selectedOption: 0,
  }

  //structure: any = null;
  structure: any = {
    imageUrl: "tasks/task-5/boy+busstop.png",
    audioUrl: "tasks/task-5/boy+busstop.wav",
    options: [
      'A. 便利店的老板在开门',
      'B. 街道上有小贩在卖早餐',
      'C. 一群学生在跑步',
      'D. 公交车已经停在站牌前',
    ],
    markdown: '1. 小明在等公交车时，看到了什么？',
    maxPageIndex: 3,
  };

  mediaUrl: string = "http://" + environment.mediaUrl + "/";
  //mediaUrl: string = "";
  playState: any = null;

  // Voice recorder
  audio: any = null;

  // Bell at counter end
  countdownDuration: number = 10; // Default duration (in seconds)
  soundEnabled: boolean = true; // Sound is enabled by default

  // Shared with coordinator task control
  controls: any = {
    auto: true,
  };

  constructor(
    private http: HttpClient,
    private wsService: WebSocket2Service,
    private taskshared1Service: Taskshared1Service,
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
    // Start paging from here
    this.state.page = -1;
    
    if (localStorage.getItem('task_token') != null) {
      this.taskToken = String(localStorage.getItem('task_token'));

      // Connect to web service
      if (!this.coordinatorMode) {
        this.wsService.connect(this.taskToken, this.taskid);
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
            
          },
          error: () => {
          }
        });
    }
  }


  // User selects option from mcq
  onSelect(i: any) {

  }


  // HTTP request to api server
  handler(s: string, ...optionalArgs: any[]) {
  }


  // Handle countdown completion
  onCountdownComplete() {
  }


  // Start the timer countdown by calling startCountdown() in SvgCountdownComponent
  startCountdown() {
  }


  // Pause
  playPause(n: number) {
  }


  playAudio(url: string) {
  }


  playScript() {
  }


  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks and disconnect WebSocket
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  //
  // For TESTING
  //
  onPlusButtonClick() {
    this.state.page += 1;
  }

  onMinusButtonClick() {
    this.state.page -= 1;
  }
}
