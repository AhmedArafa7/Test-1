import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet, CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationSignalRService } from '../../../core/services/notification-signalr.service';
import { AdminService } from '../../../features/admin/services/admin.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="admin-layout flex font-sans">
      <!-- Sidebar (Desktop) -->
      <aside class="admin-sidebar shrink-0 hidden lg:flex">
        <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
      </aside>

      <!-- Sidebar (Mobile Overlay) -->
      @if (sidebarOpen()) {
        <aside class="fixed ltr:left-0 rtl:right-0 top-0 bottom-0 w-80 bg-white z-[100] flex flex-col shadow-2xl animate-slide-in-right lg:hidden">
          <ng-container *ngTemplateOutlet="sidebarContent"></ng-container>
        </aside>
        <div (click)="sidebarOpen.set(false)" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[90] animate-fade-in lg:hidden"></div>
      }

      <!-- Sidebar Template -->
      <ng-template #sidebarContent>
        <div class="flex flex-col h-full">
          <!-- Logo Section -->
          <div class="p-8 mb-4">
            <a routerLink="/" class="flex flex-col gap-1.5 items-start group">
              <span class="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#12b5bd] to-[#0a8f96] bg-clip-text text-transparent">Baytology</span>
              <span class="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em]">{{ 'ADMIN.LAYOUT.BADGE' | translate }}</span>
            </a>
          </div>

          <!-- Navigation Links -->
          <nav class="flex-1 px-4 space-y-2">
            <a routerLink="/admin" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active" (click)="sidebarOpen.set(false)" class="admin-sidebar-link group">
              <div class="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-[#12b5bd] group-hover:bg-[#0a8f96]/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2-0 01-2-2v-2z"/></svg>
              </div>
              <span>{{ 'ADMIN.LAYOUT.MENU.DASHBOARD' | translate }}</span>
            </a>
            <a routerLink="/admin/users" routerLinkActive="active" (click)="sidebarOpen.set(false)" class="admin-sidebar-link group">
              <div class="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-[#12b5bd] group-hover:bg-[#0a8f96]/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              </div>
              <span>{{ 'ADMIN.LAYOUT.MENU.USERS' | translate }}</span>
            </a>
            <a routerLink="/admin/agents" routerLinkActive="active" (click)="sidebarOpen.set(false)" class="admin-sidebar-link group">
              <div class="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-[#12b5bd] group-hover:bg-[#0a8f96]/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <span>{{ 'ADMIN.LAYOUT.MENU.AGENTS' | translate }}</span>
            </a>
            <a routerLink="/admin/payments" routerLinkActive="active" (click)="sidebarOpen.set(false)" class="admin-sidebar-link group">
              <div class="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-[#12b5bd] group-hover:bg-[#0a8f96]/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <span>{{ 'ADMIN.LAYOUT.MENU.FINANCE' | translate }}</span>
            </a>
            <a routerLink="/admin/refunds" routerLinkActive="active" (click)="sidebarOpen.set(false)" class="admin-sidebar-link group">
              <div class="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-[#12b5bd] group-hover:bg-[#0a8f96]/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"/></svg>
              </div>
              <span>{{ 'ADMIN.LAYOUT.MENU.REFUNDS' | translate }}</span>
            </a>
            <a routerLink="/admin/ai/search" routerLinkActive="active" (click)="sidebarOpen.set(false)" class="admin-sidebar-link group">
              <div class="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-[#12b5bd] group-hover:bg-[#0a8f96]/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span>{{ 'ADMIN.LAYOUT.MENU.AI_SEARCH' | translate }}</span>
            </a>
            <a routerLink="/admin/ai/recommendations" routerLinkActive="active" (click)="sidebarOpen.set(false)" class="admin-sidebar-link group">
              <div class="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-[#12b5bd] group-hover:bg-[#0a8f96]/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              </div>
              <span>{{ 'ADMIN.LAYOUT.MENU.AI_RECOM' | translate }}</span>
            </a>
            <a routerLink="/admin/audit-logs" routerLinkActive="active" (click)="sidebarOpen.set(false)" class="admin-sidebar-link group">
              <div class="p-2 rounded-lg bg-white/5 text-gray-500 group-hover:text-[#12b5bd] group-hover:bg-[#0a8f96]/10 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <span>{{ 'ADMIN.LAYOUT.MENU.AUDIT' | translate }}</span>
            </a>
          </nav>

          <!-- Footer Actions -->
          <div class="p-6 border-t border-white/5 mt-auto space-y-3">
            <button routerLink="/faq" class="btn-support w-full cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>{{ 'ADMIN.LAYOUT.SUPPORT' | translate }}</span>
            </button>
            <button (click)="logout()" class="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 text-red-600 hover:bg-red-100 transition-all font-black text-sm group">
               <span class="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">{{ 'ADMIN.LAYOUT.LOGOUT' | translate }}</span>
               <svg class="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </div>
      </ng-template>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        <!-- Top Bar -->
        <header class="admin-top-bar px-10 shrink-0">
          <div class="flex items-center gap-6">
            <!-- Profile Info -->
            <div class="flex items-center gap-4 ltr:pr-6 rtl:pl-6 ltr:border-r rtl:border-l border-gray-100">
              <div class="relative">
                <div class="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-white flex items-center justify-center overflow-hidden">
                  @if (auth.userAvatar() && auth.userAvatar()!.length > 20) {
                    <img [src]="auth.userAvatar()" (error)="auth.userAvatar.set(null)" class="w-full h-full object-contain img-circle b-tr b-2x">
                  } @else {
                    <svg class="w-6 h-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  }
                </div>
                <div class="absolute -bottom-0.5 ltr:-right-0.5 rtl:-left-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-black text-gray-900 leading-none">
                  {{ auth.currentUser()?.displayName || (auth.currentUser()?.email?.split('@')?.[0]) || ('ADMIN.LAYOUT.ADMIN_TITLE' | translate) }}
                </p>
                <p class="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-tighter">
                  {{ auth.currentUser()?.roles?.includes('Admin') ? ('ADMIN.LAYOUT.ADMIN_TITLE' | translate) : ('ADMIN.LAYOUT.SUPERVISOR' | translate) }}
                </p>
              </div>
            </div>

            <!-- Icons -->
            <div class="flex items-center gap-1">
              <button routerLink="/notifications" class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#0a8f96] transition-colors relative">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                @if (notificationService.unreadCount() > 0) {
                  <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                }
              </button>
              <button routerLink="/settings" class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#0a8f96] transition-colors cursor-pointer" [title]="'SETTINGS.TITLE' | translate"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
              <button routerLink="/faq" class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#0a8f96] transition-colors cursor-pointer" [title]="'FOOTER.HELP_CENTER' | translate"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></button>
            </div>
          </div>

          <div class="flex-1 flex items-center justify-center">
            <div class="admin-search-wrapper w-[450px]">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" [ngModel]="adminService.globalSearchTerm()" (ngModelChange)="adminService.globalSearchTerm.set($event)" [placeholder]="'ADMIN.LAYOUT.SEARCH_PLACEHOLDER' | translate" class="admin-search-input">
            </div>
          </div>

          <div class="flex items-center justify-end ltr:pr-6 rtl:pl-6">
            <div class="status-indicator bg-white/50 border border-gray-100 shadow-sm px-6 py-2.5 rounded-2xl">
              <span class="status-dot"></span>
              {{ 'ADMIN.LAYOUT.SYSTEM_HEALTH' | translate }}
            </div>
          </div>
        </header>

        <!-- Main Content Scroll -->
        <main class="flex-1 overflow-y-auto p-12 bg-transparent">
          <div class="max-w-7xl mx-auto">
            <router-outlet />
          </div>
        </main>
      </div>

      <!-- Mobile Controls (Hidden on Desktop) -->
      <button (click)="sidebarOpen.set(!sidebarOpen())" class="hidden max-lg:flex fab-admin">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  `,
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);
  public auth = inject(AuthService);
  public notificationService = inject(NotificationSignalRService);
  public adminService = inject(AdminService);

  async logout() {
    await this.auth.logout();
  }
}
