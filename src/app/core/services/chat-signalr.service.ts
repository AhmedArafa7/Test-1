import { Injectable, signal, OnDestroy, effect } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Message } from '../models';

@Injectable({ providedIn: 'root' })
export class ChatSignalRService implements OnDestroy {
  private hub?: signalR.HubConnection;
  private _connected = signal(false);
  private _connectionState = signal<'Connected' | 'Disconnected' | 'Connecting' | 'Reconnecting'>('Disconnected');
  private _incomingMessage = signal<Message | null>(null);

  readonly connected = this._connected.asReadonly();
  readonly connectionState = this._connectionState.asReadonly();
  readonly incomingMessage = this._incomingMessage.asReadonly();

  constructor(private auth: AuthService) {
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this.disconnect();
      }
    });
  }

  async connect(): Promise<void> {
    if (this.hub?.state === signalR.HubConnectionState.Connected) return;
    if (!this.auth.token) return;

    this._connectionState.set('Connecting');

    if (!this.hub) {
      this.hub = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.hubUrl}/chat`, { 
          accessTokenFactory: () => this.auth.token ?? ''
        })
        .withAutomaticReconnect()
        .build();

      this.hub.on('ReceiveMessage', (message: Message) => {
        this._incomingMessage.set(message);
      });

      this.hub.onreconnecting(() => this._connectionState.set('Reconnecting'));
      this.hub.onreconnected(() => {
        this._connectionState.set('Connected');
        this._connected.set(true);
      });
      this.hub.onclose(() => {
        this._connectionState.set('Disconnected');
        this._connected.set(false);
      });
    }

    try {
      await this.hub.start();
      this._connected.set(true);
      this._connectionState.set('Connected');
      console.log('ChatHub connected successfully');
    } catch (e) { 
      console.error('ChatHub connection failed:', e);
      this._connectionState.set('Disconnected');
      this.hub = undefined; // Allow retry
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (this.hub) await this.hub.invoke('JoinConversation', conversationId);
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (this.hub) await this.hub.invoke('LeaveConversation', conversationId);
  }

  async sendMessage(conversationId: string, content: string, attachmentUrl?: string): Promise<string> {
    if (!this.hub) throw new Error('Not connected');
    return this.hub.invoke<string>('SendMessage', conversationId, content, attachmentUrl);
  }

  async disconnect(): Promise<void> {
    if (this.hub) { await this.hub.stop(); this.hub = undefined; this._connected.set(false); }
  }

  ngOnDestroy(): void { this.disconnect(); }
}



