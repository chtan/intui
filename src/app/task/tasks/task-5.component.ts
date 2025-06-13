import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { marked } from 'marked';
import { MarkdownModule } from 'ngx-markdown';

import { environment } from "@environment/environment";
import { TaskSharedService } from '../../services/task-shared.service';
import { WebSocketService } from '../../services/websocket.service';
import { SvgCountdownComponent } from '../../ui/svg-countdown/svg-countdown.component';


@Component({
  selector: 'app-task-5',
  imports: [
    CommonModule,
    MarkdownModule,
    SvgCountdownComponent,
    FormsModule,
  ],
  templateUrl: './task-5.component.html',
  styleUrl: './task-5.component.scss'
})
export class Task5Component implements OnInit, OnDestroy {
  @ViewChild(SvgCountdownComponent) countdownComponent!: SvgCountdownComponent; // Reference to countdown component

  tid: string = "";
  state: any = null;
  structure: any = null;

  mediaUrl: string = "";
  playState: any = null;

  // Voice recorder
  audio: any = null;

  // Bell at counter end
  countdownDuration: number = 10; // Default duration (in seconds)
  soundEnabled: boolean = true; // Sound is enabled by default

  // Shared with coordinator task control
  controls: any = {
    auto: false,
  };

  private wsSubscription!: Subscription;

  constructor(
    private http: HttpClient,
    private taskSharedService: TaskSharedService,
    private wsService: WebSocketService,
  ) {
  }

  ngOnInit() {
    this.taskSharedService.currentData_tid.subscribe((data: any) => {
      this.tid = data;
    });

    this.taskSharedService.currentData_state.subscribe((data: any) => {
      this.state = data;
    });

    this.taskSharedService.currentData_structure.subscribe((data: any) => {
      this.structure = data;
    });

    
    this.taskSharedService.currentData_controls.subscribe((data: any) => {
      this.controls = data;
    });


    // Just before browser navigates away, call this - helps to handle undesire behaviours. 
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // URL of media
    this.mediaUrl = "http://" + environment.mediaUrl + "/";

    // Connect web service to server
    this.wsService.connect(String(this.tid));

    this.wsSubscription = this.wsService.messages$.subscribe(
      (message: any) => {
        if (message) {
          //console.log(message);

          // This is broadcasted from the server, 
          // after coordinator updates the task control state,
          // which applies to all instances.
          if (message['message'] == 'set auto') {
            this.controls['auto'] = message['data'];

            console.log(this.controls, "%%%%%%%%%%%");

            // The audio must stop playing.
            if (this.audio) {
              this.audio.pause();
              this.audio.currentTime = 0;
            }

            // If it is now not auto, leave the state alone.
            // If it becomes auto, then restart (which doesn't change selected options).
            if (this.controls.auto) {
              this.handler('restart');
            }
          }
        }
      }
    );

    // If auto, start playing the app automatically
    if (this.controls.auto && this.state.page > -1) {
      this.playState = [this.state.page, 0];
      this.playScript();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);

    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    
    this.wsService.disconnect();
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
    if (this.controls.auto) {
      this.handler('restart');
    }
  };

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
        this.playAudio(this.mediaUrl + this.structure.audioUrl);
        break;

      case a == 0 && b == 2:
        this.playPause(3);
        break;

      case a == 0 && b == 3:
        this.playPause(0.0);
        break;

      case a == 0 && b == 4:
        this.handler('increasePage');
        break;

      case a == 1 && b == 0:
        this.playPause(3);
        break;

      case a == 1 && b == 1:
        this.playAudio(this.mediaUrl + this.structure.audioUrl);
        break;

      case a == 1 && b == 2:
        this.startCountdown();
        break;

      case a == 1 && b == 3:
        this.handler('increasePage');
        break;

      case a == 2 && b == 0:
        this.playPause(3);
        break;

      case a == 2 && b == 1:
        this.playAudio(this.mediaUrl + this.structure.audioUrl);
        break;

      case a == 2 && b == 2:
        this.startCountdown();
        break;

      case a == 2 && b == 3:
        this.handler('submit');
        break;

      default:
        //console.log("Unknown fruit.");
    }
  }

  // User selects an option from the MCQ
  onSelect(index: number) {
    this.handler('setOption', index);
  }

  // Handle countdown completion
  onCountdownComplete() {
    this.playState = [this.playState[0], this.playState[1] + 1];
    this.playScript();
  }

  // Start the countdown by calling startCountdown() in SvgCountdownComponent
  startCountdown() {
    if (this.countdownComponent) {
      this.countdownComponent.startCountdown();
    }
  }

  // Pause
  playPause(n: number) {
    // Non-blocking
    setTimeout(() => {
      this.playState = [this.playState[0], this.playState[1] + 1];
      this.playScript();
    }, n * 1000);
  }

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

  handler(s: string, ...optionalArgs: any[]) {
    if (this.tid != "") {
      let uf = [
        [
          s,
          optionalArgs,
        ]
      ];

      let params = new HttpParams()
        .set('tid', this.tid)
        .set('applyString', JSON.stringify(uf))
      ;

      this.http.get('http://' + environment.apiUrl + '/task/update_state3', { params })
        .subscribe(
          (data: any) => {
            console.log(data);

            // Need to update this on the shared data service????
            // This is a bug - refer to task-6
            //this.state = data['state'];
            //this.structure = data['structure'];
            
            // It should be this...
            this.taskSharedService.setState(data['state']);
            this.taskSharedService.setStructure(data['structure']);

            if (this.controls.auto && ['increasePage', 'start'].includes(s)) {
              if (this.state.page == 0) {
                this.playState = [this.state.page, 0];
                this.playScript();
              } else {
                this.playState = [this.playState[0], this.playState[1] + 1];
                this.playScript();
              }
            }

          },

          (error: any) => {
            console.error('Error fetching data:', error);
          }
        );
    }
  }
}
