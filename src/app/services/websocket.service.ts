import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { BehaviorSubject } from 'rxjs';
import * as rxOps from 'rxjs/operators';

/*
For testing in the browser console:

const ws = new WebSocket('ws://localhost:8000/ws/chat/chtan/');
ws.onopen = () => {
  ws.send(JSON.stringify({ recipients: ['46c7fdfb', '6b26107c', 'e736cb4f', '08d5fd41', 'd8d260db'], message: 'Hello from JS!', data: 12345 }));
};
ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

*/

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  private messageSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messageSubject.asObservable();
  private isConnected = false;

  connect(username: string): void {
    if (this.isConnected) {
      console.warn('WebSocket is already connected.');
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/chat/${username}/`;
    this.socket$ = webSocket(wsUrl);

    this.socket$
      .pipe(rxOps.retryWhen((errors) => errors.pipe(rxOps.delay(5000))))
      .subscribe(
        (message) => {
          console.log('Message received:', message, typeof message);
          this.messageSubject.next(message);
        },
        (err) => {
          console.error('WebSocket error:', err);
          this.isConnected = false;
        },
        () => {
          console.warn('WebSocket closed');
          this.isConnected = false;
        }
      );

    this.isConnected = true;
  }

  sendMessage(recipients: string[], message: string): void {
    if (this.isConnected && this.socket$) {
      this.socket$.next({ recipients: recipients, message: message, data: 123 });
    } else {
      console.warn('WebSocket is not connected.');
    }
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.isConnected = false;
    }
  }
}
