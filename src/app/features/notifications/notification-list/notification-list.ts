import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../profile/services/profile.service';
import { NotificationSignalRService } from '../../../core/services/notification-signalr.service';
import { AppNotification } from '../../../core/models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-notification-list', standalone: true,
  imports: [EmptyStateComponent, RelativeTimePipe, TranslateModule],
  template: `
    <div class="min-h-screen bg-white font-sans">
      <div class="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-[40px] font-black text-gray-900 tracking-tight mb-2">{{ 'NOTIFICATIONS.TITLE' | translate }}</h1>
          <p class="text-gray-500 text-[15px]">{{ 'NOTIFICATIONS.SUBTITLE' | translate }}</p>
        </div>

        @if (notifications().length === 0) {
          <app-empty-state icon="🔔" [title]="'NOTIFICATIONS.EMPTY_TITLE' | translate" [message]="'NOTIFICATIONS.EMPTY_MSG' | translate" />
        } @else {
          <div class="bg-white rounded-[20px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <!-- Card Header -->
            <div class="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <h2 class="text-xl font-bold text-gray-900">{{ 'NOTIFICATIONS.RECENT' | translate }}</h2>
              <button (click)="markAllRead()" class="text-[11px] font-black uppercase tracking-[0.15em] text-[#0a8f96] hover:underline transition-all">
                {{ 'NOTIFICATIONS.MARK_ALL_READ' | translate }}
              </button>
            </div>

            <!-- Notification Items -->
            <div>
              @for (n of notifications(); track n.id; let first = $first) {
                <div (click)="markRead(n)"
                     class="px-8 py-6 flex items-start gap-5 cursor-pointer transition-all hover:bg-gray-50/50"
                     [class]="first && !n.isRead ? 'bg-[#0a8f96]/[0.02] border-l-4 border-[#0a8f96]' : 'border-b border-gray-50'"
                     [class.opacity-60]="n.isRead">
                  <!-- Icon -->
                  <div class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                       [class]="n.type === 'NewMessage' ? 'bg-gray-100 text-gray-500' : n.type === 'PaymentUpdate' ? 'bg-[#0a8f96]/10 text-[#0a8f96]' : n.type === 'BookingUpdate' ? 'bg-[#0a8f96]/10 text-[#0a8f96]' : 'bg-gray-100 text-gray-400'">
                    @if (n.type === 'BookingUpdate') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    } @else if (n.type === 'NewMessage') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                    } @else if (n.type === 'PaymentUpdate') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                    }
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-900 text-[15px]">{{ n.title }}</p>
                    <p class="text-sm text-gray-500 mt-1 leading-relaxed">{{ n.body }}</p>
                    @if (!n.isRead && n.type === 'BookingUpdate') {
                      <div class="flex items-center gap-3 mt-4">
                        <button class="bg-[#0a8f96] text-white text-[11px] font-black uppercase tracking-wider px-5 py-2 rounded-md hover:bg-[#076b70] transition-all">{{ 'NOTIFICATIONS.VIEW_DETAILS' | translate }}</button>
                        <button class="bg-white text-gray-700 text-[11px] font-black uppercase tracking-wider px-5 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-all">{{ 'NOTIFICATIONS.RESCHEDULE' | translate }}</button>
                      </div>
                    }
                  </div>

                  <!-- Time -->
                  <div class="shrink-0 text-right">
                    <span class="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">{{ n.createdOnUtc | relativeTime }}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Load More -->
            <div class="px-8 py-5 border-t border-gray-100 text-center">
              <button (click)="loadMore()" 
                      [disabled]="loading() || !hasMore()"
                      class="text-[11px] font-black uppercase tracking-[0.15em] text-[#0a8f96] hover:underline transition-all disabled:opacity-50">
                {{ loading() ? ('NOTIFICATIONS.LOADING' | translate) : hasMore() ? ('NOTIFICATIONS.LOAD_MORE' | translate) : ('NOTIFICATIONS.NO_MORE' | translate) }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class NotificationListComponent implements OnInit {
  notifications = signal<AppNotification[]>([]);
  
  page = signal(1);
  pageSize = 10;
  totalPages = signal(1);
  hasMore = signal(false);
  loading = signal(false);

  constructor(private profileService: ProfileService, private notifService: NotificationSignalRService, private router: Router) {}
  
  async ngOnInit() { 
    await this.loadNotifications(1);
  }

  async loadNotifications(p: number, append = false) {
    this.loading.set(true);
    try {
      const res = await this.profileService.getNotifications(p, this.pageSize);
      if (append) {
        this.notifications.update(current => [...current, ...res.items]);
      } else {
        this.notifications.set(res.items);
      }
      this.page.set(res.pageNumber);
      this.totalPages.set(res.totalPages);
      this.hasMore.set(res.hasNextPage);
      
      // Sync with SignalR service if it's the first page
      if (p === 1 && !append) {
        this.notifService.setNotifications(res.items);
      }
    } catch (err) {
      console.error('Failed to load real notifications', err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore() {
    if (this.hasMore() && !this.loading()) {
      await this.loadNotifications(this.page() + 1, true);
    }
  }

  async markAllRead() {
    const unread = this.notifications().filter(n => !n.isRead);
    for (const n of unread) {
      try {
        await this.profileService.markNotificationRead(n.id);
        this.notifService.markAsRead(n.id);
      } catch {}
    }
    this.notifications.update(ns => ns.map(x => ({ ...x, isRead: true })));
  }

  async markRead(n: AppNotification) {
    if (!n.isRead) {
      try {
        await this.profileService.markNotificationRead(n.id);
        this.notifications.update(ns => ns.map(x => x.id === n.id ? { ...x, isRead: true } : x));
        this.notifService.markAsRead(n.id);
      } catch {}
    }

    if (!n.referenceId || !n.referenceType) {
      return;
    }

    switch (n.referenceType) {
      case 'Property':
      case 'PropertyUpdate':
        this.router.navigate(['/properties', n.referenceId]);
        break;
      case 'Booking':
      case 'BookingUpdate':
      case 'BookingConfirmed':
        this.router.navigate(['/bookings', n.referenceId]);
        break;
      case 'Message':
      case 'NewMessage':
      case 'Conversation':
        this.router.navigate(['/conversations']);
        break;
      case 'Payment':
      case 'PaymentUpdate':
      case 'Refund':
        this.router.navigate(['/bookings']);
        break;
      default:
        console.warn('Unhandled notification reference type:', n.referenceType);
        break;
    }
  }
}




