import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Taskshared1Service {

  constructor() { }

  private state = new BehaviorSubject<any>(null);
  sharedData_state = this.state.asObservable();

  private structure = new BehaviorSubject<any>(null);
  sharedData_structure = this.structure.asObservable();

  private controls = new BehaviorSubject<any>(null);
  sharedData_controls = this.controls.asObservable();

  setState(data: any) {
    //console.log("@@@@@@@@@", data);
    this.state.next(data);
  }

  setStructure(data: any) {
    //console.log("@@@@@@@@@", data);
    this.structure.next(data);
  }

  setControls(data: any) {
    //console.log("@@@@@@@@@", data);
    this.controls.next(data);
  }
}
