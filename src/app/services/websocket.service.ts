/*
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  // ! operator
  // tells TypeScript that the variable will be assigned before use
  private socket$!: WebSocketSubject<any>;

  connect(username: string) {
    this.socket$ = webSocket(`ws://localhost:8000/ws/chat/${username}/`);

    this.socket$.subscribe(
      (message) => console.log("📩 Received:", message),
      (err) => console.error("❌ WebSocket Error:", err),
      () => console.log("🔌 WebSocket closed")
    );
  }

  sendMessage(recipients: string[], message: string) {
    this.socket$.next({ recipients, message });
  }

  closeConnection() {
    this.socket$.complete();
  }
}
*/

import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Subject, BehaviorSubject } from 'rxjs';
//import { retryWhen, delay } from 'rxjs/operators';
import * as rxOps from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  // ! operator
  // tells TypeScript that the variable will be assigned before use
  private socket$!: WebSocketSubject<any>;
  private messageSubject = new BehaviorSubject<any>(null); // Store the latest message
  public messages$ = this.messageSubject.asObservable(); // Exposed observable

  constructor() {}

  connect(username: string) {
    // Establish WebSocket connection with the username parameter
    const wsUrl = `ws://localhost:8000/ws/chat/${username}/`;
    //this.socket$ = new WebSocketSubject(wsUrl);
    const ws = new WebSocketSubject(wsUrl);

    // To ensure reconnect
    this.socket$ = ws.pipe(
      rxOps.retryWhen(errors => errors.pipe(rxOps.delay(5000))) // Retry every 5 seconds
    ) as WebSocketSubject<any>;

    this.socket$.subscribe(
      (message) => {
        console.log('Message received:', message);
        this.messageSubject.next(message); // Emit message to subscribers
      },
      (err) => console.error('WebSocket error:', err),
      () => console.warn('WebSocket closed')
    );
  }

  sendMessage(recipients: string[], message: string) {
    if (this.socket$) {
      this.socket$.next({ recipients, message });
    } else {
      console.warn('WebSocket is not connected.');
    }
  }

  disconnect() {
    if (this.socket$) {
      this.socket$.complete(); // Close the WebSocket connection
    }
  }
}
