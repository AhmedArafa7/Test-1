import { Component, signal, OnInit, ElementRef, viewChild, effect, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../profile/services/profile.service';
import { NotificationSignalRService } from '../../../core/services/notification-signalr.service';
import { AppNotification } from '../../../core/models';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [RelativeTimePipe, TranslateModule, CommonModule, EmptyStateComponent],
  template: `
    <div class="min-h-screen bg-slate-50/50 font-sans p-4 md:p-8 pt-24 md:pt-28">
      <div class="max-w-3xl mx-auto flex flex-col gap-6 md:gap-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-6 border-b border-slate-100 w-full">
          <div>
            <h1 class="text-3xl md:text-[40px] font-black text-slate-900 tracking-tight mb-2">
              {{ 'NOTIFICATIONS.TITLE' | translate }}
            </h1>
            <p class="text-slate-500 font-bold text-sm md:text-base">
              {{ 'NOTIFICATIONS.SUBTITLE' | translate }}
            </p>
          </div>
          
          @if (notifications().length > 0) {
            <button (click)="markAllRead()" 
                    class="text-xs font-black uppercase tracking-wider text-[#0a8f96] hover:text-[#076b70] transition-colors duration-200 flex items-center gap-1.5 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ 'NOTIFICATIONS.MARK_ALL_READ' | translate }}</span>
            </button>
          }
        </div>

        <!-- Push Notification Activation Banner -->
        @if (pushPermissionStatus() !== 'granted') {
          <div class="bg-gradient-to-br from-[#0a8f96]/10 to-[#076b70]/5 border border-[#0a8f96]/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div class="flex items-start gap-4 ltr:text-left rtl:text-right">
              <div class="w-12 h-12 rounded-2xl bg-[#0a8f96]/10 text-[#0a8f96] flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 animate-swing" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
                </svg>
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 text-base mb-1">{{ 'NOTIFICATIONS.PUSH_BANNER_TITLE' | translate }}</h3>
                <p class="text-xs text-slate-500 font-bold leading-relaxed">
                  {{ 'NOTIFICATIONS.PUSH_BANNER_DESC' | translate }}
                </p>
              </div>
            </div>
            <button (click)="requestPushPermission()" 
                    class="bg-[#0a8f96] hover:bg-[#076b70] text-white text-xs font-black px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-[#0a8f96]/15 hover:shadow-lg active:scale-95 shrink-0 cursor-pointer">
              {{ 'NOTIFICATIONS.PUSH_BANNER_BTN' | translate }}
            </button>
          </div>
        }

        @if (notifications().length === 0) {
          <!-- Empty State -->
          <app-empty-state
            title="NOTIFICATIONS.EMPTY_TITLE"
            message="NOTIFICATIONS.EMPTY_MSG"
            actionText="NOTIFICATIONS.BROWSE_PROPERTIES"
            (actionClicked)="goToProperties()">
            <!-- Projected Icon -->
            <svg icon class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </app-empty-state>
        } @else {
          <!-- Smart Time-Grouped Notifications -->
          <div class="flex flex-col gap-8 w-full">
            @for (group of getGroupedNotifications(); track group.key) {
              <div class="flex flex-col gap-4">
                <!-- Group Temporal Heading -->
                <div class="flex items-center gap-3 px-2">
                    <h2 class="text-xs font-black uppercase tracking-wider text-[#0a8f96] bg-[#0a8f96]/5 px-3 py-1.5 rounded-lg">
                      {{ group.titleKey | translate }}
                    </h2>
                  <div class="h-px bg-slate-100 flex-1"></div>
                  <span class="text-[10px] font-bold text-slate-400">
                    {{ group.items.length }} {{ group.items.length === 1 ? ('NOTIFICATIONS.NOTIFICATION_SINGULAR' | translate) : ('NOTIFICATIONS.NOTIFICATION_PLURAL' | translate) }}
                  </span>
                </div>

                <!-- Group Items Container -->
                <div class="flex flex-col gap-3">
                  @for (n of group.items; track n.id) {
                    <!-- Swipe Container Outer Card -->
                    <div class="notification-container relative overflow-hidden rounded-3xl bg-slate-100 shadow-sm border border-slate-100 transition-all select-none"
                         [class.removing]="removingIds().has(n.id)">
                         
                      <!-- Swipe Right: Mark as Read Background -->
                      <div class="absolute inset-0 bg-[#0a8f96] flex items-center justify-start px-6 text-white transition-opacity duration-200 rounded-3xl"
                           [class.opacity-100]="getSwipeX(n.id) > 10"
                           [class.opacity-0]="getSwipeX(n.id) <= 10">
                        <div class="flex items-center gap-2">
                          <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span class="text-[11px] font-black uppercase tracking-wider">{{ 'NOTIFICATIONS.MARK_READ_ACTION' | translate }}</span>
                        </div>
                      </div>

                      <!-- Swipe Left: Delete Background -->
                      <div class="absolute inset-0 bg-red-500 flex items-center justify-end px-6 text-white transition-opacity duration-200 rounded-3xl"
                           [class.opacity-100]="getSwipeX(n.id) < -10"
                           [class.opacity-0]="getSwipeX(n.id) >= -10">
                        <div class="flex items-center gap-2">
                          <span class="text-[11px] font-black uppercase tracking-wider">{{ 'NOTIFICATIONS.DELETE_ACTION' | translate }}</span>
                          <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </div>
                      </div>

                      <!-- Main Interactive Card -->
                      <div (touchstart)="onTouchStart($event, n.id)"
                           (touchmove)="onTouchMove($event, n.id)"
                           (touchend)="onTouchEnd($event, n.id)"
                           [style.transform]="'translateX(' + getSwipeX(n.id) + 'px)'"
                           [style.transition]="isSwiping(n.id) ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'"
                           (click)="markRead(n)"
                           class="px-6 md:px-8 py-6 flex items-start gap-5 cursor-pointer bg-white transition-all hover:bg-slate-50/50 relative group rounded-3xl"
                           [class.bg-[#0a8f96]/[0.01]]="!n.isRead"
                           [class.opacity-60]="n.isRead">
                        
                        <!-- Notification Active Border for Unread -->
                        @if (!n.isRead) {
                          <div class="absolute right-0 top-0 bottom-0 w-1 bg-[#0a8f96] rounded-r-md"></div>
                        }

                        <!-- Icon -->
                        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105"
                             [class]="n.isRead ? 'bg-slate-50 text-slate-400' : 'bg-[#0a8f96]/10 text-[#0a8f96]'">
                          @if (n.type === 'BookingUpdate') {
                            <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          } @else if (n.type === 'NewMessage') {
                            <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                            </svg>
                          } @else if (n.type === 'PaymentUpdate') {
                            <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          } @else {
                            <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                          }
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between gap-4 mb-1.5">
                            <h3 class="font-extrabold text-slate-900 text-base md:text-lg group-hover:text-[#0a8f96] transition-colors duration-200"
                                [class.text-slate-500]="n.isRead">
                              {{ n.title }}
                            </h3>
                            <span class="text-xs font-bold text-slate-400 shrink-0">
                              {{ n.createdOnUtc | relativeTime }}
                            </span>
                          </div>
                          <p class="text-sm font-medium text-slate-500 leading-relaxed">
                            {{ n.body }}
                          </p>
                          
                          <!-- Quick actions for booking -->
                          @if (!n.isRead && n.type === 'BookingUpdate') {
                            <div class="flex items-center gap-3 mt-4">
                              <button class="bg-[#0a8f96] text-white text-[11px] font-black uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-[#076b70] shadow-sm hover:shadow transition-all duration-200 cursor-pointer">
                                {{ 'NOTIFICATIONS.VIEW_DETAILS' | translate }}
                              </button>
                              <button class="bg-white text-slate-700 text-[11px] font-black uppercase tracking-wider px-5 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer">
                                {{ 'NOTIFICATIONS.RESCHEDULE' | translate }}
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
          
          <!-- Infinite Scroll Sentinel Element -->
          <div #infiniteScrollSentinel class="h-20 w-full flex items-center justify-center py-6">
            @if (loading()) {
              <div class="flex items-center gap-2 text-slate-500 font-bold text-xs bg-white px-5 py-3 rounded-full border border-slate-100 shadow-sm animate-pulse">
                <svg class="animate-spin h-4 w-4 text-[#0a8f96]" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ 'NOTIFICATIONS.LOADING_MORE' | translate }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    .notification-container {
      transition: max-height 0.3s ease-out, opacity 0.3s ease-out, margin 0.3s ease-out, transform 0.3s ease-out;
      max-height: 350px;
    }
    
    .notification-container.removing {
      max-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      opacity: 0 !important;
      border-color: transparent !important;
      transform: translateX(-100%) scale(0.9) !important;
      pointer-events: none !important;
    }

    @keyframes swing {
      0%, 100% { transform: rotate(0); }
      20% { transform: rotate(15deg); }
      40% { transform: rotate(-10deg); }
      60% { transform: rotate(5deg); }
      80% { transform: rotate(-5deg); }
    }
    
    .animate-swing {
      animation: swing 1.2s ease-in-out infinite;
      transform-origin: top center;
    }
  `]
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications = signal<AppNotification[]>([]);
  
  page = signal(1);
  pageSize = 10;
  totalPages = signal(1);
  hasMore = signal(false);
  loading = signal(false);

  // Swipe gesture variables
  private swipeData = new Map<string, { startX: number; currentX: number; isSwiping: boolean }>();
  activeSwipeId = signal<string | null>(null);
  removingIds = signal<Set<string>>(new Set());

  // Push Permission State
  pushPermissionStatus = signal<string>('default');

  // Infinite Scroll Observer
  infiniteScrollSentinel = viewChild<ElementRef>('infiniteScrollSentinel');
  private observer: IntersectionObserver | null = null;

  constructor(
    private profileService: ProfileService, 
    private notifService: NotificationSignalRService, 
    private router: Router,
    private translate: TranslateService
  ) {
    // Reactively initialize the observer as soon as sentinel is rendered
    effect(() => {
      const el = this.infiniteScrollSentinel()?.nativeElement;
      if (el) {
        this.setupInfiniteScroll(el);
      }
    });
  }
  
  async ngOnInit() { 
    this.checkPushPermission();
    await this.loadNotifications(1);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  checkPushPermission() {
    if ('Notification' in window) {
      this.pushPermissionStatus.set(Notification.permission);
    }
  }

  async requestPushPermission() {
    if (!('Notification' in window)) {
      alert(this.translate.instant('NOTIFICATIONS.PUSH_NOT_SUPPORTED'));
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', reg);
      }
      
      const permission = await Notification.requestPermission();
      this.pushPermissionStatus.set(permission);
      
      if (permission === 'granted') {
        const successTitle = this.translate.instant('NOTIFICATIONS.PUSH_SUCCESS_TITLE');
        const successBody = this.translate.instant('NOTIFICATIONS.PUSH_SUCCESS_BODY');
        const fallbackBody = this.translate.instant('NOTIFICATIONS.PUSH_SUCCESS_BODY_FALLBACK');
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification(successTitle, {
            body: successBody,
            icon: '/favicon.ico',
            dir: 'rtl',
            vibrate: [100, 50, 100]
          } as any);
        } else {
          new Notification(successTitle, {
            body: fallbackBody,
            icon: '/favicon.ico'
          });
        }
      }
    } catch (err) {
      console.error('Service worker/push permission registration failed:', err);
    }
  }

  setupInfiniteScroll(sentinelElement: HTMLElement) {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && this.hasMore() && !this.loading()) {
        void this.loadMore();
      }
    }, {
      rootMargin: '150px' // Start loading 150px before reaching bottom
    });
    this.observer.observe(sentinelElement);
  }

  async loadNotifications(p: number, append = false) {
    this.loading.set(true);
    try {
      const res = await this.profileService.getNotifications(p, this.pageSize);
      console.log('ProfileService.getNotifications backend response:', res);

      let items: AppNotification[] = [];
      let pageNumber = 1;
      let totalPages = 1;
      let hasNextPage = false;

      if (res) {
        if (Array.isArray(res)) {
          items = res;
          pageNumber = p;
          totalPages = 1;
          hasNextPage = false;
        } else {
          items = res.items || (res as any).Items || [];
          pageNumber = res.pageNumber || (res as any).PageNumber || p;
          totalPages = res.totalPages || (res as any).TotalPages || 1;
          hasNextPage = res.hasNextPage || (res as any).HasNextPage || false;
        }
      }

      console.log('Parsed notification items:', items);

      if (append) {
        this.notifications.update(current => [...current, ...items]);
      } else {
        this.notifications.set(items);
      }
      this.page.set(pageNumber);
      this.totalPages.set(totalPages);
      this.hasMore.set(hasNextPage);
      
      // Sync with SignalR service if it's the first page
      if (p === 1 && !append) {
        this.notifService.setNotifications(items);
      }
    } catch (err) {
      console.error('Failed to load notifications in component:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore() {
    if (this.hasMore() && !this.loading()) {
      await this.loadNotifications(this.page() + 1, true);
    }
  }

  goToProperties() {
    this.router.navigate(['/properties']);
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

  // Swipe gesture implementations
  onTouchStart(event: TouchEvent, id: string) {
    const touch = event.touches[0];
    this.swipeData.set(id, {
      startX: touch.clientX,
      currentX: touch.clientX,
      isSwiping: true
    });
    this.activeSwipeId.set(id);
  }

  onTouchMove(event: TouchEvent, id: string) {
    const data = this.swipeData.get(id);
    if (!data || !data.isSwiping) return;

    const touch = event.touches[0];
    data.currentX = touch.clientX;
    this.swipeData.set(id, { ...data });
    
    const diffX = data.currentX - data.startX;
    // If swiping noticeably horizontal, prevent page scroll
    if (Math.abs(diffX) > 10) {
      if (event.cancelable) {
        event.preventDefault();
      }
    }
  }

  async onTouchEnd(event: TouchEvent, id: string) {
    const data = this.swipeData.get(id);
    this.swipeData.delete(id);
    this.activeSwipeId.set(null);

    if (!data) return;

    const diffX = data.currentX - data.startX;
    
    // In RTL/Arabic layout, swiping right increases X, which marks as read
    if (diffX > 80) {
      const n = this.notifications().find(x => x.id === id);
      if (n && !n.isRead) {
        await this.markRead(n);
      }
    }
    // Swiping left decreases X, which deletes/removes the notification locally
    else if (diffX < -80) {
      this.deleteNotificationLocally(id);
    }
  }

  getSwipeX(id: string): number {
    if (this.activeSwipeId() === id) {
      const data = this.swipeData.get(id);
      if (data) {
        const diff = data.currentX - data.startX;
        return Math.max(-120, Math.min(120, diff));
      }
    }
    return 0;
  }

  isSwiping(id: string): boolean {
    return this.activeSwipeId() === id;
  }

  deleteNotificationLocally(id: string) {
    this.removingIds.update(set => {
      const newSet = new Set(set);
      newSet.add(id);
      return newSet;
    });

    setTimeout(() => {
      this.notifications.update(ns => ns.filter(n => n.id !== id));
      this.removingIds.update(set => {
        const newSet = new Set(set);
        newSet.delete(id);
        return newSet;
      });
      this.notifService.setNotifications(this.notifications());
    }, 300);
  }

  // Time-Grouping logic
  getGroupedNotifications() {
    const list = this.notifications();
    if (list.length === 0) return [];

    const today: AppNotification[] = [];
    const yesterday: AppNotification[] = [];
    const lastWeek: AppNotification[] = [];
    const older: AppNotification[] = [];

    const now = new Date();
    
    const getMidnight = (d: Date) => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    };

    const todayMidnight = getMidnight(now);
    const yesterdayMidnight = todayMidnight - 24 * 60 * 60 * 1000;
    const sevenDaysAgoMidnight = todayMidnight - 7 * 24 * 60 * 60 * 1000;

    for (const n of list) {
      const time = new Date(n.createdOnUtc).getTime();
      if (time >= todayMidnight) {
        today.push(n);
      } else if (time >= yesterdayMidnight) {
        yesterday.push(n);
      } else if (time >= sevenDaysAgoMidnight) {
        lastWeek.push(n);
      } else {
        older.push(n);
      }
    }

    const groups: { key: string; titleKey: string; items: AppNotification[] }[] = [];
    if (today.length > 0) {
      groups.push({ key: 'today', titleKey: 'NOTIFICATIONS.GROUP_TODAY', items: today });
    }
    if (yesterday.length > 0) {
      groups.push({ key: 'yesterday', titleKey: 'NOTIFICATIONS.GROUP_YESTERDAY', items: yesterday });
    }
    if (lastWeek.length > 0) {
      groups.push({ key: 'lastWeek', titleKey: 'NOTIFICATIONS.GROUP_LAST_WEEK', items: lastWeek });
    }
    if (older.length > 0) {
      groups.push({ key: 'older', titleKey: 'NOTIFICATIONS.GROUP_OLDER', items: older });
    }

    return groups;
  }
}
