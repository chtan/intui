import { ChangeDetectorRef, AfterViewInit, Component, ElementRef, 
         inject, OnInit, OnDestroy, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebSocket3Service } from '../../services/websocket3.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// import { CookieService } from 'ngx-cookie-service';
import { environment } from "@environment/environment";
// import { MarkdownModule } from 'ngx-markdown';
import { MarkdownComponent } from 'ngx-markdown';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-task-12',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownComponent,
    RouterModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './task-12.component.html',
  styleUrl: './task-12.component.scss',
  animations: [
    trigger('slideUpDown', [
      state('closed', style({ height: '15px', opacity: 1 })),
      state('open', style({ height: '*', opacity: 1 })),
      transition('closed <=> open', animate('300ms ease-in-out'))
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class Task12Component implements OnInit, OnDestroy, AfterViewInit {

  // ========================
  // ViewChild
  // ========================
  @ViewChild('card1Ref') card1!: ElementRef;

  // ========================
  // Variables
  // ========================
  taskid = '12';
  taskToken = '';
  currentPage: string = '0';
  currentCardIndex = 1;
  selectedOptionA: string = '';
  selectedOptionB: string = '';
  mediaUrl = 'assets/tasks/task-12/';

  private wsSubscription!: Subscription;
  receivedMessage: string = '';
  recipientList: string[] = ["coordinator_chtan_12"];
  message = "test";
  coordinatorMode: boolean = false;
  katexExpr = String.raw`## <u>Testing</u>`;
  interactionOpen = true;
  questions = ['0', '1'];
  currentPageIndex = 0;
  selectedOptions: Record<string, string> = {};
  submitted = false;
  checkActive = false;
  clickSound = new Audio('assets/sounds/click.wav');

  // ========================
  // Constructor
  // ========================
  constructor(
    private http: HttpClient,
    private wsService: WebSocket3Service,
    private host: ElementRef,
  ) {
    if (localStorage.getItem('Coordinator') != null) {
      this.coordinatorMode = true;
    }
  }

  // ========================
  // Angular Lifecycle Hooks
  // ========================
  ngOnInit() {
    if (localStorage.getItem('task_token') != null) {
      this.taskToken = String(localStorage.getItem('task_token'));

      if (!this.coordinatorMode) {
        this.wsService.connect(this.taskToken);
        this.wsSubscription = this.wsService.messages$.subscribe(
          (message) => { if (message) this.receivedMessage = message; }
        );
      }

      let uf = [[/* 'submitChoice', [questionIndex, this.selectedAnswers[questionIndex]] */]];

      const headers = new HttpHeaders({ 'X-Anonymous-Token': this.taskToken });
      const params = new HttpParams().set('applyString', JSON.stringify(uf));

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
          error: () => {}
        });
    }
  }

  ngAfterViewInit(): void {
    const containers: NodeListOf<HTMLElement> = this.host.nativeElement.querySelectorAll('.card');

    containers.forEach(container => {
      const btn = container.querySelector<HTMLButtonElement>('.replay-btn');
      const vid = container.querySelector<HTMLVideoElement>('video');
      if (!btn || !vid) return;

      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        try { vid.currentTime = 0; } 
        catch { try { vid.pause(); vid.currentTime = 0; } catch {} }

        const playPromise = vid.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {});
        }
      });

      btn.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    this.wsService.disconnect();
  }

  // ========================
  // User Interaction
  // ========================
  playClick() {
    this.clickSound.currentTime = 0;
    this.clickSound.play();
  }

  toggleCheck() {
    this.checkActive = !this.checkActive;
    if (this.checkActive) {
      setTimeout(() => {
        this.card1.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }

  toggleInteraction() {
    this.interactionOpen = !this.interactionOpen;
  }

  nextQuestion() {
    if (this.currentPageIndex < this.questions.length - 1) this.currentPageIndex++;
    this.currentPage = this.currentPageIndex.toString();

    if (this.checkActive) {
      setTimeout(() => {
        this.card1.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }

  prevQuestion() {
    if (this.currentPageIndex > 0) this.currentPageIndex--;
    this.currentPage = this.currentPageIndex.toString();

    if (this.checkActive) {
      setTimeout(() => {
        this.card1.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }

  submit() {
    if (!this.allChoicesMade()) return;
    this.submitted = true;
    // TODO: handle submission logic here
  }

  checkSolution() {
    if (!this.submitted) return;
    // TODO: handle check logic here
  }

  allChoicesMade(): boolean {
    return this.questions.every(q => this.selectedOptions[q]);
  }

  get currentPage_() {
    return this.questions[this.currentPageIndex];
  }

  replayVideo(event: Event) {
    const btn = event.currentTarget as HTMLElement;
    const card = btn.closest('.card');
    if (!card) return;

    const video = card.querySelector<HTMLVideoElement>('video');
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(err => console.warn('Video play failed:', err));
  }

  scrollTo(cardId: string) {
    const targetCard = document.getElementById(cardId);
    if (!targetCard) return;

    const allVideos = document.querySelectorAll<HTMLVideoElement>('.card video');
    allVideos.forEach(video => video.pause());

    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const videoInCard0 = targetCard.querySelector<HTMLVideoElement>('video');
    if (videoInCard0) videoInCard0.currentTime = 0;

    setTimeout(() => {
      const videoInCard = targetCard.querySelector<HTMLVideoElement>('video');
      if (videoInCard) videoInCard.play().catch(err => console.warn('Video play failed:', err));
    }, 1000);
  }

  // ========================
  // WebSocket Related
  // ========================
  sendMessage() {
    this.wsService.sendMessage(this.recipientList, this.message);
  }

  disconnect() {
    this.wsService.disconnect();
  }

  handleSelection(view: '0' | '1', value: string) {
    if (!this.coordinatorMode) {
      console.log(`Selected in ${view}: ${value}`);
      let uf = [['submitChoice', [view, value]]];

      const headers = new HttpHeaders({ 'X-Anonymous-Token': this.taskToken });
      const params = new HttpParams().set('applyString', JSON.stringify(uf));

      if (localStorage.getItem('task_token') != null) {
        this.taskToken = String(localStorage.getItem('task_token'));
        const headers = new HttpHeaders({ 'X-Anonymous-Token': this.taskToken });

        this.http.get<{ message: string }>('http://' + environment.apiUrl + '/api/anon-data/set-state/', { headers, params })
          .subscribe({
            next: (response: any) => {
              console.log(response, "set");
              this.selectedOptions[view] = value;
            },
            error: () => {}
          });
      }
    }
  }
}
