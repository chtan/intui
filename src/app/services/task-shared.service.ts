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

  private structure = new BehaviorSubject<any>(null);
  currentData_structure = this.structure.asObservable();

  private controls = new BehaviorSubject<any>(null);
  currentData_controls = this.controls.asObservable();

  setTid(data: string) {
    this.tid.next(data);
  }

  setState(data: any) {
    this.state.next(data);
  }

  setStructure(data: any) {
    this.structure.next(data);
  }

  setControls(data: any) {
    //console.log("@@@@@@@@@", data);

    this.controls.next(data);
  }
}
