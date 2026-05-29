import { Injectable, signal, OnDestroy, effect } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { AppNotification } from '../models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class NotificationSignalRService implements OnDestroy {
  private hub?: signalR.HubConnection;

  private _notifications = signal<AppNotification[]>([]);
  private _unreadCount = signal(0);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();

  constructor(private auth: AuthService, private toast: ToastService) {
    // Automatically disconnect when user logs out
    effect(() => {
      if (!this.auth.token) {
        void this.disconnect();
      }
    });
  }

  async connect(): Promise<void> {
    if (
      this.hub?.state === signalR.HubConnectionState.Connected ||
      this.hub?.state === signalR.HubConnectionState.Connecting ||
      this.hub?.state === signalR.HubConnectionState.Reconnecting
    ) {
      return;
    }

    if (!this.auth.token) return;

    if (!this.hub) {
      this.hub = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.hubUrl}/notifications`, { 
          accessTokenFactory: () => this.auth.token ?? ''
        })
        .withAutomaticReconnect()
        .build();

      this.hub.on('ReceiveNotification', (notification: AppNotification) => {
        const prefsRaw = localStorage.getItem('baytology_notification_prefs');
        const prefs = prefsRaw ? JSON.parse(prefsRaw) : { sound: true, showPreview: true };

        if (this.shouldShowNotification(notification)) {
          this._notifications.update(n => [notification, ...n]);
          this._unreadCount.update(c => c + 1);

          // Play sound if enabled
          if (prefs.sound !== false) {
            this.playNotificationSound();
          }

          // Show toast preview if enabled
          if (prefs.showPreview !== false) {
            this.toast.info(`${notification.title}: ${notification.body}`);
          }

          // Trigger OS native local Push Notification
          this.triggerLocalPush(notification.title, notification.body);
        }
      });
    }

    try {
      await this.hub.start();
    } catch (e) {
      console.error('NotificationHub connection failed:', e);
      this.hub = undefined;
    }
  }

  async disconnect(): Promise<void> {
    if (this.hub) { await this.hub.stop(); this.hub = undefined; }
  }

  markAsRead(id: string): void {
    const notifications = this._notifications().map(notification => {
      if (notification.id !== id || notification.isRead) {
        return notification;
      }
      return { ...notification, isRead: true };
    });

    this._notifications.set(notifications);
    this._unreadCount.set(notifications.filter(notification => !notification.isRead).length);
  }

  setNotifications(notifications: AppNotification[]): void {
    this._notifications.set(notifications);
    this._unreadCount.set(notifications.filter(n => !n.isRead).length);
  }

  private shouldShowNotification(n: AppNotification): boolean {
    try {
      const raw = localStorage.getItem('baytology_notification_prefs');
      if (!raw) return true;
      const prefs = JSON.parse(raw);
      
      // Master toggle
      if (prefs.enabled === false) return false;
      
      // Per-type toggle
      if (n.type === 'NewMessage' && prefs.newMessage === false) return false;
      if (n.type === 'PaymentUpdate' && prefs.paymentUpdate === false) return false;
      if (n.type === 'PropertyMatch' && prefs.propertyMatch === false) return false;
      
      // Quiet hours
      if (prefs.quietHoursEnabled && prefs.quietStart && prefs.quietEnd) {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const current = h * 60 + m;
        const [sh, sm] = prefs.quietStart.split(':').map(Number);
        const [eh, em] = prefs.quietEnd.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        
        if (start <= end) {
          if (current >= start && current <= end) return false;
        } else {
          // Overnight (e.g. 23:00 - 07:00)
          if (current >= start || current <= end) return false;
        }
      }
      
      return true;
    } catch {
      return true;
    }
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.volume = 0.5;
      void audio.play();
    } catch (e) {
      console.warn('Could not play notification sound', e);
    }
  }

  triggerLocalPush(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body: body,
            icon: '/favicon.ico',
            dir: 'rtl',
            vibrate: [100, 50, 100]
          } as any);
        }).catch(() => {
          new Notification(title, { body: body, icon: '/favicon.ico' });
        });
      } else {
        new Notification(title, { body: body, icon: '/favicon.ico' });
      }
    }
  }

  ngOnDestroy(): void { this.disconnect(); }
}
