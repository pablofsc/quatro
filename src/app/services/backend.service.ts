import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SocketService } from './socket.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    protected readonly http: HttpClient,
    protected readonly socketService: SocketService,
    public readonly socket: SocketService
  ) {}

  private endpoint = environment.BACKEND_URL || '';

  public async createSession(): Promise<{ player: string; session: string; }> {
    return new Promise((res, rej) => {
      this.http.post(this.endpoint + '/create', {})
        .subscribe({
          next: (data: any) => {
            if (!data.player || !data.session) {
              throw new Error("Did not receive user and session.");
            }

            const player = data.player;
            const session = data.session;

            this.socketService.connect(player);

            res({ player, session });
          },
          error: (err) => {
            rej(err);
          }
        });
    });
  }

  public async joinSession(session: string, player?: string): Promise<{ player: string; session: string; }> {
    return new Promise((res, rej) => {
      this.http.put(this.endpoint + '/join', { session, player })
        .subscribe({
          next: (data: any) => {
            const player = data['playerCode'];

            this.socketService.connect(player);

            res({ player, session });
          },
          error: (err) => {
            switch (err.status) {
              case HttpStatusCode.Conflict: return rej('ALREADY_JOINED');
              case HttpStatusCode.NotFound: return rej('SESSION_NOT_FOUND');
              case HttpStatusCode.Unauthorized: return rej('ALREADY_STARTED');

              default: return rej('UNKNOWN_ERROR');
            }
          }
        });
    });
  }
}
