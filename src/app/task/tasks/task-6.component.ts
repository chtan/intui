import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { environment } from "@environment/environment";
import { TaskSharedService } from '../../services/task-shared.service';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-task-6',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './task-6.component.html',
  styleUrl: './task-6.component.scss'
})
export class Task6Component implements OnInit, OnDestroy {
  tid: string = "";
  state: any = null;
  structure: any = null;

  selectedAnswers: (number|null)[] = [];
  results: string[] = [];

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

      for (let i = 0; i < this.state.pageState.length; i++) {
        if (this.state.pageState[i].choiceSequence.length > 0) {
          this.selectedAnswers[i] = this.state.pageState[i].choiceSequence[
            this.state.pageState[i].choiceSequence.length - 1
          ];
        } else {
          this.selectedAnswers[i] = null;
        }
      }
      
    });

    this.taskSharedService.currentData_structure.subscribe((data: any) => {
      this.structure = data;
    });

    console.log(this.tid, this.state, this.structure, "!!");

    // Connect web service to server
    this.wsService.connect(String(this.tid));

    this.wsSubscription = this.wsService.messages$.subscribe(
      (message: any) => {
        if (message) {
          //console.log(message);
        }
      }
    );
    
  }

  onAnswerChange(questionIndex: number, answer: number) {
    this.selectedAnswers[questionIndex] = answer;
  }

  submitAnswer(questionIndex: number) {
    this.handler('submitChoice', questionIndex, this.selectedAnswers[questionIndex]);
  }

  navigate(page: number) {
    this.handler('navigate', page);
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    
    this.wsService.disconnect();
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
            
            this.taskSharedService.setState(data['state']);
            this.taskSharedService.setStructure(data['structure']);
            
          },

          (error: any) => {
            console.error('Error fetching data:', error);
          }
        );
    }
  }
}
