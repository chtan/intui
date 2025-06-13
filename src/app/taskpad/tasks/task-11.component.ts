import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  TESTING = false;

  isServiceUnavailable = false;

  @ViewChild(SvgCountdownComponent) countdownComponent!: SvgCountdownComponent; // Reference to countdown component

  //cookieService = inject(CookieService);
  taskid = '11';
  taskToken = '';

  // Listen to messages on the socket connection
  private wsSubscription!: Subscription;
  receivedMessage: any = '';
  recipientList: string[] = ["chtan"]; // List of recipients of messages
  // message to send out using sendMessage function
  message = "test"; 

  // This ensures that if the coordinator logs out, 
  // the mode remains and he cannot change the task state of a user.
  coordinatorMode: boolean = false;

  state: any = {};

  page = 0;

  structure: any;
  pageStructure: any = {
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
    on: true,
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
    if (localStorage.getItem('anon_token') != null) {
      this.taskToken = String(localStorage.getItem('anon_token'));

      // Start paging from here
      this.page = -1;

      // Connect to web service
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
            this.receivedMessage = message;

            if (this.receivedMessage['message'] == 'toggle service') {
              // When coordinator toggles on/off, the task is restarted.
              // The state remains unchanged though.
              this.isServiceUnavailable = Boolean(this.receivedMessage['data']);
              this.page = -1;
              this.audio.pause();
              this.audio.currentTime = 0;
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

      // load state
      this.handler("getCompositeOnStart")

      // Just before browser navigates away, call this - helps to handle undesire behaviours. 
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    };
  }


  // HTTP request to api server
  handler(s: string, ...optionalArgs: any[]) {
    if (this.taskToken != "") {
      let uf = [
        [
          s,
          optionalArgs,
        ]
      ];

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
            //console.log(data, "------------");
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


  // User selects option from mcq
  onSelect(choiceIndex:number, questionIndex:number) {
    this.handler('setOption', choiceIndex, questionIndex);
  }


  //
  // Timer Controls
  //

  // Start the timer countdown by calling startCountdown() in SvgCountdownComponent
  startCountdown() {
    if (this.countdownComponent) {
      this.countdownComponent.startCountdown();
    }
  }


  // Handle countdown completion: on complete, move to the next state.
  onCountdownComplete() {
    this.playState = [this.playState[0], this.playState[1] + 1];
    this.playScript();
  }


  // Pause
  playPause(n: number) {
    // Non-blocking
    setTimeout(() => {
      // the playstate has a simple branching structure - refer to similar statements above/below
      this.playState = [this.playState[0], this.playState[1] + 1]; 
      this.playScript();
    }, n * 1000);
  }


  //
  // Audio Control
  //
  playAudio(url: string) {
    try {
      this.audio = new Audio(url);

      // No need for this currently
      this.audio.play().catch((error: any) => {
      });;

      this.audio.onended = () => {
        //console.log("Audio ended!");
        this.playState = [this.playState[0], this.playState[1] + 1];
        this.playScript();
      };
    } catch (error) {
      console.error('Something went wrong:', error);
    }
  }


  //
  // Play Script for entire task
  //
  playScript() {
    var a = this.playState[0];
    var b = this.playState[1];

    switch (true) {
      case a == 0 && b > 4:
        this.playState = [1, 0];
        a = 1;
        b = 0;
        break;

      case a == 1 && b > 3:
        this.playState = [2, 0];
        a = 2;
        b = 0;
        break;

      default:
        //
    }

    switch (true) {
      case a == 0 && b == 0:
        this.playPause(3);
        break;

      case a == 0 && b == 1:
        this.playAudio(this.mediaUrl + this.pageStructure.audioUrl);
        break;

      case a == 0 && b == 2:
        this.playPause(3);
        break;

      case a == 0 && b == 3:
        this.playPause(0.0);
        break;

      case a == 0 && b == 4:
        this.onPlusButtonClick();
        break;

      case a == 1 && b == 0:
        this.playPause(3);
        break;

      case a == 1 && b == 1:
        this.playAudio(this.mediaUrl + this.pageStructure.audioUrl);
        break;

      case a == 1 && b == 2:
        this.startCountdown();
        break;

      case a == 1 && b == 3:
        this.onPlusButtonClick();
        break;

      case a == 2 && b == 0:
        this.playPause(3);
        break;

      case a == 2 && b == 1:
        this.playAudio(this.mediaUrl + this.pageStructure.audioUrl);
        break;

      case a == 2 && b == 2:
        this.startCountdown();
        break;

      case a == 2 && b == 3:
        this.onPlusButtonClick();
        break;

      default:
        //console.log("Unknown fruit.");
    }
  }


  // This will execute when the refresh button is clicked,
  // just before the page is refreshed.
  // We will rewind the page to the start but keep the checking states
  // when this happens.
  private beforeUnloadHandler = (event: BeforeUnloadEvent): void => {
    // Execute your cleanup or logic before the page unloads
    //console.log('Before unload event triggered');
    // Optionally, you can set a returnValue to show a confirmation dialog in some browsers.
    //event.returnValue = '';

    // If auto, need to restart, 
    // as browser does not allow auto-play without user interaction.
    //if (this.controls.auto) {
    //  this.handler('restart');
    //}
  };


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
    this.page += 1;

    if ((this.page >= 0) || (this.page <= 2)) {
      this.pageStructure = this.structure[this.page];
    }

    // If auto, start playing the app automatically
    if (this.controls.auto) {
      this.playState = [this.page, 0];
      this.playScript();
    }
  }

  onMinusButtonClick() {
    this.page -= 1;

    if ((this.page >= 0) || (this.page <= 2)) {
      this.pageStructure = this.structure[this.page];
    }
  }
}
