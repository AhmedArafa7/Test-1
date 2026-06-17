import { Component, signal, computed, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../profile/services/profile.service';
import { NotificationSignalRService } from '../../../core/services/notification-signalr.service';
import { extractApiError } from '../../../core/utils/api-error';
import { ConversationService } from '../../conversations/services/conversation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AppNotification, Conversation } from '../../../core/models';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ToastService } from '../../../core/services/toast.service';

interface NotificationGroup {
  type: string;
  labelKey: string;
  items: AppNotification[];
  expanded: boolean;
  latestUnread: AppNotification | null;
  unreadCount: number;
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [RelativeTimePipe, TranslateModule, CommonModule, EmptyStateComponent],
  template: `
    <div class="min-h-screen bg-slate-50/50 font-sans p-4 md:p-8 pt-24 md:pt-28">
      <div class="max-w-3xl mx-auto flex flex-col gap-6 md:gap-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-6 border-b border-slate-100 w-full gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl md:text-[40px] font-black text-slate-900 tracking-tight">
                {{ 'NOTIFICATIONS.TITLE' | translate }}
              </h1>
              <button (click)="openGuide()"
                      [attr.aria-label]="'NOTIFICATIONS.GUIDE_BUTTON_ARIA' | translate"
                      [title]="'NOTIFICATIONS.GUIDE_BUTTON' | translate"
                      class="w-9 h-9 shrink-0 rounded-full bg-[#0a8f96]/10 hover:bg-[#0a8f96] text-[#0a8f96] hover:text-white border-2 border-[#0a8f96]/30 hover:border-[#0a8f96] flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>
                </svg>
              </button>
            </div>
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
          <app-empty-state
            title="NOTIFICATIONS.EMPTY_TITLE"
            message="NOTIFICATIONS.EMPTY_MSG"
            actionText="NOTIFICATIONS.BROWSE_PROPERTIES"
            (actionClicked)="goToProperties()">
            <svg icon class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </app-empty-state>
        } @else {
          <!-- Grouped by Type -->
          <div class="flex flex-col gap-4 w-full">
            @for (group of groupedNotifications(); track group.type) {
              <div class="rounded-3xl border transition-all overflow-hidden"
                   [class]="group.unreadCount > 0 ? 'bg-white border-[#0a8f96]/20 shadow-sm' : 'bg-white border-slate-100'">
                
                <!-- Group Header (always visible) -->
                <div (click)="toggleGroup(group.type)"
                     class="flex items-center gap-4 px-6 md:px-8 py-5 cursor-pointer hover:bg-slate-50/50 transition-colors select-none">
                  
                  <!-- Icon -->
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                       [class]="group.unreadCount > 0 ? 'bg-[#0a8f96]/10 text-[#0a8f96]' : 'bg-slate-100 text-slate-400'">
                    @if (group.type === 'NewMessage') {
                      <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                    } @else if (group.type === 'PaymentUpdate') {
                      <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    } @else {
                      <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                    }
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-extrabold text-slate-900 text-sm md:text-base"
                          [class.text-[#0a8f96]]="group.unreadCount > 0">
                        {{ group.labelKey | translate }}
                      </h3>
                      @if (group.unreadCount > 0) {
                        <span class="bg-[#0a8f96] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center tabular-nums shadow-sm">
                          {{ group.unreadCount > 99 ? '99+' : group.unreadCount }}
                        </span>
                      }
                    </div>
                    @if (group.latestUnread && group.unreadCount > 0) {
                      <p class="text-xs font-bold text-slate-500 mt-0.5 truncate max-w-[280px]">
                        @if (group.type === 'NewMessage' && group.latestUnread.title) {
                          <span class="text-[#0a8f96]">{{ group.latestUnread.title }}:</span>
                          {{ group.latestUnread.body }}
                        } @else if (group.type === 'NewMessage') {
                          {{ group.latestUnread.body }}
                        } @else {
                          {{ group.latestUnread.title }}
                        }
                      </p>
                    } @else if (group.items.length > 0) {
                      <p class="text-xs font-bold text-slate-400 mt-0.5">
                        {{ group.items.length }} {{ group.items.length === 1 ? ('NOTIFICATIONS.NOTIFICATION_SINGULAR' | translate) : ('NOTIFICATIONS.NOTIFICATION_PLURAL' | translate) }}
                      </p>
                    }
                  </div>

                  <!-- Expand Arrow -->
                  <div class="shrink-0 transition-transform duration-200"
                       [class.rotate-180]="isGroupExpanded(group.type)">
                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
                  </div>
                </div>

                <!-- Expanded Items -->
                @if (isGroupExpanded(group.type)) {
                  <div class="border-t border-slate-100">
                    @for (n of group.items; track n.id; let i = $index) {
                      <div (click)="markRead(n)"
                           class="flex items-start gap-4 px-6 md:px-8 py-4 cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-50 last:border-b-0"
                           [class.bg-[#0a8f96]/[0.02]]="!n.isRead">
                        
                        <!-- Unread dot -->
                        <div class="shrink-0 mt-2">
                          @if (!n.isRead) {
                            <div class="w-2 h-2 rounded-full bg-[#0a8f96]"></div>
                          } @else {
                            <div class="w-2 h-2 rounded-full bg-transparent"></div>
                          }
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                          @if (group.type === 'NewMessage') {
                            <!-- Sender name as bold header -->
                            @if (n.title) {
                              <p class="text-[11px] font-black text-[#0a8f96] mb-0.5 truncate"
                                 [class.text-slate-400]="n.isRead">
                                {{ n.title }}
                              </p>
                            }
                            <!-- Actual message preview -->
                            <p class="text-sm font-bold text-slate-800 leading-relaxed truncate"
                               [class.text-slate-500]="n.isRead">
                              {{ n.body }}
                            </p>
                          } @else {
                            <p class="text-sm font-bold text-slate-800"
                               [class.text-slate-500]="n.isRead">
                              {{ n.title }}
                            </p>
                            <p class="text-xs font-medium text-slate-400 mt-0.5">
                              {{ n.body }}
                            </p>
                          }
                        </div>

                        <!-- Time -->
                        <span class="text-[11px] font-bold text-slate-400 shrink-0">
                          {{ n.createdOnUtc | relativeTime }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Notification Guide Modal -->
    @if (showGuide()) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6"
           role="dialog"
           aria-modal="true"
           [attr.aria-label]="'NOTIFICATIONS.GUIDE_TITLE' | translate"
           (click)="closeGuide()">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"></div>

        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
             (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="flex items-center justify-between gap-4 p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-[#0a8f96]/5 to-transparent">
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-12 h-12 shrink-0 rounded-2xl bg-[#0a8f96] text-white flex items-center justify-center shadow-md">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-xl md:text-2xl font-black text-slate-900">{{ 'NOTIFICATIONS.GUIDE_TITLE' | translate }}</h2>
                <p class="text-sm text-slate-500 font-bold">{{ 'NOTIFICATIONS.GUIDE_DESC' | translate }}</p>
              </div>
            </div>
            <button (click)="closeGuide()" class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0">
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="overflow-y-auto flex-1 p-6 md:p-8 space-y-5">
            @for (type of guideTypesList; track type.key) {
              <div class="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     [class]="getGuideIconBg(type.icon)">
                  @switch (type.icon) {
                    @case ('message') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                    }
                    @case ('check') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    }
                    @case ('wallet') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"/>
                      </svg>
                    }
                    @case ('alert') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                      </svg>
                    }
                    @case ('cancel') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    }
                    @case ('home') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                      </svg>
                    }
                    @case ('refund') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25l6-6m0 0l-6-6m6 6H4.5"/>
                      </svg>
                    }
                    @case ('block') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                    }
                  }
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-extrabold text-slate-900 text-sm">{{ 'NOTIFICATIONS.GUIDE_TYPES.' + type.key + '.TITLE' | translate }}</h3>
                  <p class="text-xs text-slate-500 font-bold mt-0.5">{{ 'NOTIFICATIONS.GUIDE_TYPES.' + type.key + '.BADGE' | translate }}</p>
                  <p class="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{{ 'NOTIFICATIONS.GUIDE_TYPES.' + type.key + '.DESC' | translate }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="p-6 md:p-8 border-t border-slate-100">
            <button (click)="closeGuide()" class="w-full py-4 rounded-2xl bg-[#0a8f96] hover:bg-[#076b70] text-white font-black text-sm transition-all shadow-lg shadow-[#0a8f96]/20 hover:shadow-xl active:scale-[0.98] cursor-pointer">
              {{ 'NOTIFICATIONS.GUIDE_GOT_IT' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications = signal<AppNotification[]>([]);
  loading = signal(false);

  // Swipe gesture variables
  swipeData = new Map<string, { startX: number; currentX: number; isSwiping: boolean }>();
  activeSwipeId = signal<string | null>(null);
  removingIds = signal<Set<string>>(new Set());

  // Push Permission State
  pushPermissionStatus = signal<string>('default');

  // Notification Guide Modal
  showGuide = signal(false);

  // Group expanded state
  private _expandedGroups = signal<Set<string>>(new Set());

  // Guide types ordered list
  readonly guideTypesList: Array<{ key: string; icon: string }> = [
    { key: 'NewMessage', icon: 'message' },
    { key: 'BookingConfirmed', icon: 'check' },
    { key: 'PaymentCompleted', icon: 'wallet' },
    { key: 'PaymentFailed', icon: 'alert' },
    { key: 'BookingConfirmedManual', icon: 'check' },
    { key: 'BookingCancelledByAgent', icon: 'cancel' },
    { key: 'BookingCancelledByBuyer', icon: 'cancel' },
    { key: 'NewBookingRequest', icon: 'home' },
    { key: 'RefundApproved', icon: 'refund' },
    { key: 'RefundRejected', icon: 'block' }
  ];

  // Infinite Scroll Observer
  private observer: IntersectionObserver | null = null;

  // Conversation map for enriching NewMessage notifications
  private convMap = new Map<string, Conversation>();

  // Auth service for current user context
  private auth = inject(AuthService);

  constructor(
    private profileService: ProfileService, 
    private notifService: NotificationSignalRService, 
    private conversationService: ConversationService,
    private router: Router,
    private translate: TranslateService,
    private toast: ToastService
  ) {
  }
  
  async ngOnInit() { 
    this.checkPushPermission();
    await this.loadNotifications();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showGuide()) {
      this.closeGuide();
    }
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
  }

  async loadNotifications(append = false) {
    this.loading.set(true);
    try {
      const [res, conversations] = await Promise.all([
        this.profileService.getNotifications(),
        this.conversationService.getAll().catch(() => [])
      ]);

      let items: AppNotification[] = [];

      if (res) {
        if (Array.isArray(res)) {
          items = res;
        } else {
          items = (res as any).items || (res as any).Items || [];
        }
      }

      // Build a map of conversationId → Conversation for quick lookup
      this.convMap = new Map(conversations.map(c => [c.id, c]));

      // Enrich each NewMessage notification with real sender + message preview
      items = items.map(n => {
        if (n.type === 'NewMessage' && n.referenceId) {
          const conv = this.convMap.get(n.referenceId);
          if (conv) {
            // Determine sender name (the other party in the conversation)
            const currentUserId = this.auth.userId();
            let senderName = '';
            if (conv.buyerUserId === currentUserId) {
              senderName = conv.agentDisplayName || this.translate.instant('MESSAGES.AGENT');
            } else {
              senderName = conv.buyerDisplayName || this.translate.instant('MESSAGES.BUYER');
            }

            // Get message content (prefer lastMessageContent over generic body)
            let content = conv.lastMessageContent || n.body || '';
            if (content.startsWith('[PROPS:') || content.startsWith('[PROP:') || content.startsWith('[TRANSCRIPT:')) {
              content = this.translate.instant('NOTIFICATIONS.SHARED_PROPERTY');
            }

            return {
              ...n,
              title: senderName,
              body: content
            };
          }
        }
        return n;
      });

      if (append) {
        this.notifications.update(current => [...current, ...items]);
      } else {
        this.notifications.set(items);
      }
      
      // Sync with SignalR service
      if (!append) {
        this.notifService.setNotifications(items);
      }
    } catch (err: any) {
      const extracted = extractApiError(err, this.translate);
      if (extracted) { this.toast.error(extracted); return; }
      console.error('Failed to load notifications in component:', err);
    } finally {
      this.loading.set(false);
    }
  }

  goToProperties() {
    this.router.navigate(['/properties']);
  }

  openGuide() {
    this.showGuide.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeGuide() {
    this.showGuide.set(false);
    document.body.style.overflow = '';
  }

  getGuideIconBg(icon: string): string {
    const map: Record<string, string> = {
      message: 'bg-blue-50 text-blue-600',
      check: 'bg-emerald-50 text-emerald-600',
      wallet: 'bg-emerald-50 text-emerald-600',
      alert: 'bg-red-50 text-red-600',
      cancel: 'bg-slate-100 text-slate-500',
      home: 'bg-blue-50 text-blue-600',
      refund: 'bg-emerald-50 text-emerald-600',
      block: 'bg-amber-50 text-amber-600'
    };
    return map[icon] || 'bg-slate-50 text-slate-500';
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

    // Navigate for NewMessage type (referenceId is the conversationId)
    if (n.type === 'NewMessage' && n.referenceId) {
      this.router.navigate(['/conversations', n.referenceId], {
        queryParams: { scrollToBottom: 'true' }
      });
      return;
    }

    if (!n.referenceId || !n.referenceType) {
      return;
    }

    switch (n.referenceType) {
      case 'Property':
        this.router.navigate(['/properties', n.referenceId]);
        break;
      case 'Booking':
      case 'Payment':
        this.router.navigate(['/bookings', n.referenceId]);
        break;
      case 'Message':
        this.router.navigate(['/conversations', n.referenceId], {
          queryParams: { scrollToBottom: 'true' }
        });
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
    
    if (diffX > 80) {
      const n = this.notifications().find(x => x.id === id);
      if (n && !n.isRead) {
        await this.markRead(n);
      }
    }
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

  // Group by type
  groupedNotifications = computed<NotificationGroup[]>(() => {
    const list = this.notifications();
    if (list.length === 0) return [];

    const typeMap = new Map<string, AppNotification[]>();
    for (const n of list) {
      const arr = typeMap.get(n.type) || [];
      arr.push(n);
      typeMap.set(n.type, arr);
    }

    const typeOrder = ['NewMessage', 'PaymentUpdate'];
    const groups: NotificationGroup[] = [];

    // Process known types first (in order)
    for (const type of typeOrder) {
      const items = typeMap.get(type);
      if (!items) continue;
      typeMap.delete(type);
      groups.push(this.buildGroup(type, items));
    }

    // Process any remaining unknown types
    for (const [type, items] of typeMap) {
      groups.push(this.buildGroup(type, items));
    }

    return groups;
  });

  private buildGroup(type: string, items: AppNotification[]): NotificationGroup {
    const labelMap: Record<string, string> = {
      NewMessage: 'NOTIFICATIONS.TYPE_NEW_MESSAGE',
      PaymentUpdate: 'NOTIFICATIONS.TYPE_PAYMENT_UPDATE',
    };

    const unreadItems = items.filter(n => !n.isRead);
    const latestUnread = unreadItems.length > 0 ? unreadItems[0] : null;

    return {
      type,
      labelKey: labelMap[type] || type,
      items,
      expanded: this._expandedGroups().has(type),
      latestUnread,
      unreadCount: unreadItems.length,
    };
  }

  isGroupExpanded(type: string): boolean {
    return this._expandedGroups().has(type);
  }

  toggleGroup(type: string) {
    this._expandedGroups.update(set => {
      const newSet = new Set(set);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }
}
