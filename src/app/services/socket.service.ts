import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor() {}

  private sockets: Map<string, Socket> = new Map();
  private endpoint = environment.BACKEND_URL || '';
  private message = 'message';

  connect(player: string): Socket {
    if (this.sockets.has(this.endpoint)) {
      return this.sockets.get(this.endpoint)!; // Return existing connection
    }

    const socket = io(this.endpoint, { query: { player } });
    this.sockets.set(this.endpoint, socket);
    console.log(`Connected to ${this.endpoint}`);
    return socket;
  }

  disconnect(): void {
    const socket = this.sockets.get(this.endpoint);

    if (socket) {
      socket.disconnect();
      this.sockets.delete(this.endpoint);
      console.log(`Disconnected from ${this.endpoint}`);
    }
  }

  listen(event: string): Observable<any> {
    const socket = this.sockets.get(this.endpoint);

    if (socket) {
      return new Observable((subscriber) => {
        socket.on(event, (data: any) => {
          subscriber.next(data);
        });

        return () => socket.off(this.message); // Cleanup when unsubscribed
      });
    }
    throw new Error(`Socket for ${this.endpoint} is not connected`);
  }

  emit(data: any): void {
    const socket = this.sockets.get(this.endpoint);

    if (socket) {
      socket.emit(this.message, data);
    }
    else {
      console.error(`Socket for ${this.endpoint} is not connected`);
    }
  }

  async emitAndWait(data: any, acknowledgmentType: string): Promise<void> {
    this.emit(data);

    return new Promise((resolve) => {
      this.listen('message')
        .subscribe({
          next: (data: any) => {
            if (data.type === acknowledgmentType) {
              resolve();
            }
          }
        });
    });
  }
}
