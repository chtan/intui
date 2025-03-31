import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskSharedService {

  constructor() { }

  private tid = new BehaviorSubject<string>('');
  currentData_tid = this.tid.asObservable();

  private state = new BehaviorSubject<any>(null);
  currentData_state = this.state.asObservable();

  setTid(data: string) {
    this.tid.next(data);
  }

  setState(data: any) {
    this.state.next(data);
  }
}
