import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataService {
  private _data = signal<any[]>([]);              // Writable signal
  readonly data = this._data.asReadonly();        // Readonly signal

  setData(newData: any[]) {
    this._data.set(newData);                      // Replace entire array
  }

  updateData(updater: (prev: any[]) => any[]) {
    this._data.update(updater);                   // Update based on current value
  }
}
