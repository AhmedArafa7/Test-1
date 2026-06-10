import { Component, HostListener, computed, signal, effect, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../core/auth/auth.service';
import { NotificationSignalRService } from '../../../core/services/notification-signalr.service';
import { LanguageService } from '../../../core/services/language.service';
import { ChatSignalRService } from '../../../core/services/chat-signalr.service';
import { ConversationService } from '../../../features/conversations/services/conversation.service';
import { Conversation } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <nav class="sticky top-[3px] z-[100] bg-white/70 backdrop-blur-2xl border-b border-[#0a8f96]/10"> <!--shadow-[0_4px_30px_rgba(10,143,150,0.08)]">-->
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="flex items-center justify-between h-[72px]">
          
          <!-- Left: Logo -->
          <div class="flex items-center gap-12">
            <a routerLink="/" class="flex items-center gap-3 group transition-all">
              <img src="/Baytology_image.png" alt="Baytology" class="h-17 w-36 object-cover object-center transition-all group-hover:scale-105 group-hover:drop-shadow-md">
            </a>

            <!-- Center: Main Nav Links (Luxury Style) -->
            <div class="hidden lg:flex items-center gap-1">
              @if (!auth.isAgent()) {
                <a routerLink="/properties" routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5" 
                   [routerLinkActiveOptions]="{exact: true}"
                   class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'NAV.BROWSE' | translate }}</a>
              }

              @if (auth.isAuthenticated()) {
                @if (!auth.isAgent()) {
                  <a routerLink="/ai/search" routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5" 
                     [routerLinkActiveOptions]="{exact: true}"
                     class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'NAV.AI_SEARCH' | translate }}</a>
                  <a routerLink="/ai/chatbot" routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5" 
                     [routerLinkActiveOptions]="{exact: true}"
                     class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'NAV.ASSISTANT' | translate }}</a>
                }
                
                @if (auth.isAgent()) {
                  <a routerLink="/properties/new" routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5" 
                     [routerLinkActiveOptions]="{exact: true}"
                     class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'NAV.ADD_PROPERTY' | translate }}</a>
                  <a routerLink="/availability" routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5"
                     [routerLinkActiveOptions]="{exact: true}"
                     class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'AVAILABILITY.TITLE' | translate }}</a>
                  <a routerLink="/trash" routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5"
                     [routerLinkActiveOptions]="{exact: true}"
                     class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'NAV.TRASH' | translate }}</a>
                }
                
                @if (auth.isBuyer() || auth.isAgent()) {
                  <a routerLink="/bookings" routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5" 
                     [routerLinkActiveOptions]="{exact: true}"
                     class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'NAV.BOOKINGS' | translate }}</a>
                  <a routerLink="/conversations" 
                     (click)="clearUnreadMessagesDot()"
                     routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5" 
                     [routerLinkActiveOptions]="{exact: true}"
                     class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all flex items-center gap-2">
                    <span>{{ 'NAV.MESSAGES' | translate }}</span>
                    @if (unreadMessagesCount() > 0) {
                      <span class="bg-[#0a8f96] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center shadow-sm tabular-nums animate-pulse shrink-0">
                        {{ unreadMessagesCount() > 9 ? '9+' : unreadMessagesCount() }}
                      </span>
                    }
                  </a>
                }
                
                @if (auth.isAdmin()) {
                  <a routerLink="/admin" routerLinkActive="!text-[#0a8f96] !bg-[#0a8f96]/5" class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'NAV.ADMIN_PANEL' | translate }}</a>
                }
              }
            </div>
          </div>

          <!-- Right: User Actions -->
          <div class="flex items-center gap-3">
            <!-- Language Switcher -->
            <button (click)="lang.toggleLanguage()" 
                    class="w-11 h-11 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#0a8f96] transition-all font-black text-[10px] tracking-wider uppercase">
              {{ lang.currentLang() === 'ar' ? 'EN' : 'AR' }}
            </button>

            @if (auth.isAuthenticated()) {
              <!-- Notifications -->
              <a routerLink="/notifications" class="relative w-11 h-11 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-gray-400 hover:text-[#0a8f96] transition-all group">
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                @if (notificationService.unreadCount() > 0) {
                  <span class="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white">
                    {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
                  </span>
                }
              </a>

              <!-- Profile -->
              <div class="relative" data-profile-menu>
                <button (click)="toggleProfileMenu($event)" class="flex items-center gap-2.5 p-1 px-3 bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 transition-all group ">
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden border border-white ring-1 ring-gray-100 ">
                    @if (auth.userAvatar() && (auth.userAvatar()?.length || 0) > 20) {
                      <img [src]="auth.userAvatar()" (error)="auth.userAvatar.set(null)" class="w-full h-full object-contain img-circle b-tr b-2x">
                    } @else {
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    }
                  </div>
                  <span class="text-sm font-bold text-gray-700 hidden sm:block">{{ displayIdentity() }}</span>
                  <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (menuOpen) {
                  <div class="absolute end-0 top-full mt-60 w-64 bg-white rounded-2xl shadow-xl py-3 border border-gray-100 animate-slide-up overflow-hidden z-[110]">
                    <div class="px-5 py-4 border-b border-gray-50 text-start">
                      <p class="text-[10px] text-[#0a8f96] font-black uppercase tracking-widest">{{ roleLabel() | translate }}</p>
                      <p class="text-sm font-bold text-gray-900 truncate mt-0.5">{{ displayIdentity() }}</p>
                    </div>
                    
                    <div class="p-2 space-y-0.5">
                      <a routerLink="/profile" (click)="closeProfileMenu()" class="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0a8f96] rounded-xl transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        <span class="flex-1 text-start">{{ 'NAV.PROFILE' | translate }}</span>
                      </a>
                      
                      @if (auth.isAgent()) {
                        <a routerLink="/properties" [queryParams]="{ agentUserId: auth.userId() }" (click)="closeProfileMenu()" class="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0a8f96] rounded-xl transition-all">
                          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                          <span class="flex-1 text-start">{{ 'NAV.MY_PROPERTIES' | translate }}</span>
                        </a>
                        <a routerLink="/availability" (click)="closeProfileMenu()" class="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0a8f96] rounded-xl transition-all">
                          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <span class="flex-1 text-start">{{ 'AVAILABILITY.TITLE' | translate }}</span>
                        </a>
                      }

                      @if (auth.isBuyer()) {
                        <a routerLink="/saved" (click)="closeProfileMenu()" class="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0a8f96] rounded-xl transition-all">
                          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                          <span class="flex-1 text-start">{{ 'NAV.SAVED' | translate }}</span>
                        </a>
                      }

                      <a routerLink="/settings" (click)="closeProfileMenu()" class="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#0a8f96] rounded-xl transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span class="flex-1 text-start">{{ 'NAV.SETTINGS' | translate }}</span>
                      </a>

                      <div class="h-px bg-gray-50 my-2 mx-3"></div>
                      
                      <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-black text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        <span class="flex-1 text-start uppercase tracking-widest">{{ 'NAV.LOGOUT' | translate }}</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="flex items-center gap-2">
                <a routerLink="/auth/login" class="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">{{ 'NAV.LOGIN' | translate }}</a>
                <a routerLink="/auth/register" class="px-7 py-2.5 rounded-full text-sm font-black text-white bg-[#0a8f96] hover:bg-[#076b70] shadow-lg shadow-[#0a8f96]/20 transition-all active:scale-95">{{ 'NAV.GET_STARTED' | translate }}</a>
              </div>
            }

            <!-- Mobile Toggle -->
            <button (click)="mobileOpen = !mobileOpen" class="lg:hidden relative w-11 h-11 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 active:scale-90 transition-all">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path [attr.d]="mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
              </svg>
              @if (unreadMessagesCount() > 0) {
                <span class="absolute -top-0.5 -end-0.5 bg-[#0a8f96] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white">
                  {{ unreadMessagesCount() > 9 ? '9+' : unreadMessagesCount() }}
                </span>
              }
            </button>
          </div>
        </div>

        @if (mobileOpen) {
          <div class="lg:hidden py-6 border-t border-gray-100 animate-fade-in space-y-2">
            @if (!auth.isAgent()) {
              <a routerLink="/properties" (click)="mobileOpen = false" class="block p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold">{{ 'NAV.BROWSE' | translate }}</a>
            }
            @if (auth.isAuthenticated()) {
              @if (!auth.isAgent()) {
                <a routerLink="/ai/search" (click)="mobileOpen = false" class="block p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold">{{ 'NAV.AI_SEARCH' | translate }}</a>
                <a routerLink="/ai/chatbot" (click)="mobileOpen = false" class="block p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold">{{ 'NAV.ASSISTANT' | translate }}</a>
              }
              @if (auth.isBuyer() || auth.isAgent()) {
                <a routerLink="/bookings" (click)="mobileOpen = false" class="block p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold">{{ 'NAV.BOOKINGS' | translate }}</a>
                <a routerLink="/conversations" 
                   (click)="mobileOpen = false; clearUnreadMessagesDot()" 
                   class="p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold flex items-center justify-between">
                  <span>{{ 'NAV.MESSAGES' | translate }}</span>
                  @if (unreadMessagesCount() > 0) {
                    <span class="bg-[#0a8f96] text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center shadow-sm tabular-nums animate-pulse shrink-0">
                      {{ unreadMessagesCount() > 9 ? '9+' : unreadMessagesCount() }}
                    </span>
                  }
                </a>
                <a routerLink="/notifications" (click)="mobileOpen = false" class="block p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold flex items-center justify-between">
                  <span>{{ 'NOTIFICATIONS.TITLE' | translate }}</span>
                  @if (notificationService.unreadCount() > 0) {
                    <span class="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center shadow-sm tabular-nums animate-pulse">
                      {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
                    </span>
                  }
                </a>
              }
              @if (auth.isAgent()) {
                <a routerLink="/properties/new" (click)="mobileOpen = false" class="block p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold">{{ 'NAV.ADD_PROPERTY' | translate }}</a>
                <a routerLink="/availability" (click)="mobileOpen = false" class="block p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold">{{ 'AVAILABILITY.TITLE' | translate }}</a>
              }
              <a routerLink="/profile" (click)="mobileOpen = false" class="block p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold">{{ 'NAV.PROFILE' | translate }}</a>
              <button (click)="logout(); mobileOpen = false" class="w-full p-4 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 text-red-500 font-black text-start">{{ 'NAV.LOGOUT' | translate }}</button>
            }
          </div>
        }
      </div>
    </nav>

    <!-- Message Notification Popup -->
    @if (messagePopup()) {
      <div class="fixed bottom-6 end-6 z-[200] animate-slide-up"
           [class.start-6]="lang.currentLang() === 'ar'"
           [class.end-6]="lang.currentLang() !== 'ar'">
        <button (click)="onPopupClick()"
                class="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-[340px] w-full text-start hover:shadow-3xl transition-all group cursor-pointer">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-[#0a8f96]/10 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black text-[#0a8f96] uppercase tracking-wider">{{ messagePopup()!.senderName }}</p>
              <p class="text-sm font-bold text-gray-700 mt-0.5 line-clamp-2">{{ messagePopup()!.content }}</p>
            </div>
            <button (click)="dismissPopup(); $event.stopPropagation()"
                    class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all shrink-0">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </button>
      </div>
    }
  `,
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  mobileOpen = false;
  unreadMessagesCount = signal(0);
  messagePopup = signal<{ senderName: string; content: string; conversationId: string } | null>(null);
  private popupTimer: ReturnType<typeof setTimeout> | null = null;
  private conversationsCache = signal<Conversation[]>([]);

  private chatSignalR = inject(ChatSignalRService);
  private conversationService = inject(ConversationService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  displayIdentity = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '';
    return user.displayName?.trim() || user.email;
  });

  initials = computed(() => {
    const source = this.displayIdentity().trim();
    if (!source) return '?';
    const words = source.split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return source.slice(0, 2).toUpperCase();
  });

  roleLabel = computed(() => {
    const roles = this.auth.userRoles();
    if (roles.includes('Admin')) return 'NAV.ROLES.ADMIN';
    if (roles.includes('Agent')) return 'NAV.ROLES.AGENT';
    if (roles.includes('Buyer')) return 'NAV.ROLES.BUYER';
    return 'NAV.ROLES.USER';
  });

  constructor(
    public auth: AuthService,
    public notificationService: NotificationSignalRService,
    public lang: LanguageService
  ) {
    effect(() => {
      const msg = this.chatSignalR.incomingMessage();
      if (msg) {
        const isIncoming = msg.senderId !== this.auth.userId();
        if (isIncoming) {
          this.showMessagePopup(msg);
        }
        setTimeout(() => this.updateUnreadStatus(), 150);
      }
    });
  }

  ngOnInit() {
    this.updateUnreadStatus();

    // Load unread message count from API if no localStorage cache exists
    const cachedCounts = localStorage.getItem('baytology_unread_counts');
    if (!cachedCounts || cachedCounts === '{}') {
      this.loadUnreadConversationsCount();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateUnreadStatus();
    });
  }

  private async loadUnreadConversationsCount() {
    try {
      const conversations = await this.conversationService.getAll();
      let total = 0;
      const counts: Record<string, number> = {};

      // Read last viewed timestamps (same key structure as chat-room.ts)
      const lastViewedRaw = localStorage.getItem('baytology_last_viewed') || '{}';
      const lastViewed: Record<string, string> = JSON.parse(lastViewedRaw);

      for (const conv of conversations) {
        // Skip conversations where I am the last sender (my own messages are not "unread")
        const effectiveSenderId = conv.lastMessageSenderId;
        if (effectiveSenderId === this.auth.userId()) continue;

        // Must have content to be considered unread
        if (!conv.lastMessageContent) continue;

        const lastViewTime = lastViewed[conv.id];
        if (lastViewTime) {
          // User has viewed this conversation before — check timestamps
          const lastMsgMs = new Date(conv.lastMessageAt || 0).getTime();
          const viewMs = new Date(lastViewTime).getTime();
          if (lastMsgMs > viewMs + 2000) {
            total++;
            const key = conv.agentUserId === this.auth.userId()
              ? `buyer_${conv.buyerUserId}`
              : `agent_${conv.agentUserId}`;
            counts[key] = (counts[key] || 0) + 1;
          }
        } else {
          // Never viewed this conversation before AND it has content → unread
          total++;
          const key = conv.agentUserId === this.auth.userId()
            ? `buyer_${conv.buyerUserId}`
            : `agent_${conv.agentUserId}`;
          counts[key] = (counts[key] || 0) + 1;
        }
      }

      if (total > 0) {
        localStorage.setItem('baytology_unread_counts', JSON.stringify(counts));
      }
      this.updateUnreadStatus();
    } catch {
      // Silent fallback
    }
  }

  updateUnreadStatus() {
    try {
      const unreadCountsRaw = localStorage.getItem('baytology_unread_counts') || '{}';
      const unreadCounts = JSON.parse(unreadCountsRaw);
      const total = Object.values(unreadCounts).reduce((a: any, b: any) => a + b, 0) as number;
      
      const currentRoute = window.location.pathname;
      if (currentRoute.includes('/conversations')) {
        this.unreadMessagesCount.set(0);
      } else {
        this.unreadMessagesCount.set(total);
      }
    } catch {
      this.unreadMessagesCount.set(0);
    }
  }

  clearUnreadMessagesDot() {
    this.unreadMessagesCount.set(0);
  }

  private async showMessagePopup(msg: any) {
    if (this.popupTimer) clearTimeout(this.popupTimer);

    const conversationId = msg.conversationId;
    let senderName = this.translate.instant('CHAT.NEW_MESSAGE');

    const cached = this.conversationsCache().find(c => c.id === conversationId);
    if (cached) {
      senderName = this.resolveSenderName(cached, msg.senderId);
    } else {
      try {
        const conversations = await this.conversationService.getAll();
        this.conversationsCache.set(conversations);
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
          senderName = this.resolveSenderName(conv, msg.senderId);
        }
      } catch {}
    }

    this.messagePopup.set({ senderName, content: msg.content, conversationId });

    this.popupTimer = setTimeout(() => {
      this.messagePopup.set(null);
    }, 5000);
  }

  private resolveSenderName(conversation: Conversation, senderId: string): string {
    if (conversation.agentUserId === senderId && conversation.agentDisplayName) {
      return conversation.agentDisplayName;
    }
    if (conversation.buyerUserId === senderId && conversation.buyerDisplayName) {
      return conversation.buyerDisplayName;
    }
    return this.translate.instant('CHAT.NEW_MESSAGE');
  }

  onPopupClick() {
    const popup = this.messagePopup();
    if (popup) {
      this.router.navigate(['/conversations', popup.conversationId]);
      this.dismissPopup();
    }
  }

  dismissPopup() {
    if (this.popupTimer) clearTimeout(this.popupTimer);
    this.messagePopup.set(null);
  }

  ngOnDestroy() {
    if (this.popupTimer) clearTimeout(this.popupTimer);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-profile-menu]')) this.menuOpen = false;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  closeProfileMenu() { this.menuOpen = false; }

  async logout() {
    this.menuOpen = false;
    await this.auth.logout();
  }
}
