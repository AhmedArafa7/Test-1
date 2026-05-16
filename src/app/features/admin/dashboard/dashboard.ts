import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule],
  template: `
    <div class="animate-fade-in">
      <!-- Premium Greeting Section -->
      <div class="flex items-center justify-between mb-16 ltr:text-left rtl:text-right">
        <div>
          <h1 class="text-4xl font-black text-gray-900 mb-3 tracking-tighter leading-tight">
            {{ 'ADMIN.DASHBOARD.WELCOME' | translate }} <span class="text-[#0a8f96]">{{ 'ADMIN.DASHBOARD.ADMIN_TITLE' | translate }}</span>
          </h1>
          <p class="text-gray-400 font-bold text-lg tracking-tight max-w-2xl leading-relaxed">
            {{ 'ADMIN.DASHBOARD.SUBTITLE' | translate }}
          </p>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex flex-col ltr:items-start rtl:items-end">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ 'ADMIN.DASHBOARD.SYSTEM_STATUS' | translate }}</span>
            <div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-50 border border-green-100/50">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="text-xs font-black text-green-600">{{ 'ADMIN.DASHBOARD.SYSTEM_HEALTH' | translate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Luxury Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 ltr:text-left rtl:text-right">
        <!-- Card: Users -->
        <div class="admin-card p-10 group hover:border-[#0a8f96]/30 transition-all duration-500">
          <div class="flex items-start justify-between mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{{ 'ADMIN.DASHBOARD.STATS.USERS' | translate }}</p>
          <p class="text-4xl font-black text-gray-900 tabular-nums">{{ usersCount() }}</p>
        </div>

        <!-- Card: Agents -->
        <div class="admin-card p-10 group hover:border-[#0a8f96]/30 transition-all duration-500">
          <div class="flex items-start justify-between mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a8f96]/15 to-[#0a8f96]/5 flex items-center justify-center text-[#0a8f96] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <span class="badge-trend badge-trend-neutral">{{ 'ADMIN.DASHBOARD.STATS.LIVE' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{{ 'ADMIN.DASHBOARD.STATS.AGENTS' | translate }}</p>
          <p class="text-4xl font-black text-gray-900 tabular-nums">{{ agentsCount() }}</p>
        </div>

        <!-- Card: Verified -->
        <div class="admin-card p-10 group hover:border-[#0a8f96]/30 transition-all duration-500">
          <div class="flex items-start justify-between mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <span class="badge-trend" [class.badge-trend-up]="verifiedPercentage() > 0" [class.badge-trend-neutral]="verifiedPercentage() === 0">
              {{ verifiedPercentage() }}%
            </span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{{ 'ADMIN.DASHBOARD.STATS.VERIFIED' | translate }}</p>
          <p class="text-4xl font-black text-gray-900 tabular-nums">{{ verifiedCount() }}</p>
        </div>

        <!-- Card: Alerts -->
        <div class="admin-card p-10 group border-orange-100 bg-orange-50/5">
          <div class="flex items-start justify-between mb-8">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-200 to-orange-50 flex items-center justify-center text-orange-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <span class="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter">{{ 'ADMIN.DASHBOARD.STATS.ACTION_REQUIRED' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{{ 'ADMIN.DASHBOARD.STATS.PENDING' | translate }}</p>
          <p class="text-4xl font-black text-gray-900 tabular-nums">{{ pendingCount() }}</p>
        </div>
      </div>

      <!-- Quick Actions Matrix -->
      <div class="mb-16 ltr:text-left rtl:text-right">
        <div class="flex items-center justify-between mb-10">
          <h2 class="text-2xl font-black text-gray-900 flex items-center gap-4">
            <span class="w-2.5 h-10 bg-[#0a8f96] rounded-full"></span>
            {{ 'ADMIN.DASHBOARD.OPERATIONS.TITLE' | translate }}
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- User Management -->
          <a routerLink="/admin/users" class="admin-card group p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0a8f96]/10 border-none bg-white">
            <div class="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-[#0a8f96]/5 ltr:rounded-bl-[100px] rtl:rounded-br-[100px] transition-all duration-500 group-hover:w-40 group-hover:h-40"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#0a8f96] group-hover:text-white transition-all duration-500 mb-8">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-3 group-hover:text-[#0a8f96] transition-colors">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.USERS.TITLE' | translate }}
              </h3>
              <p class="text-sm font-bold text-gray-400 leading-relaxed">{{ 'ADMIN.DASHBOARD.OPERATIONS.USERS.DESC' | translate }}</p>
              <div class="mt-8 flex items-center gap-2 text-[11px] font-black text-[#0a8f96] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.USERS.ACTION' | translate }} <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          </a>

          <!-- Agent Management -->
          <a routerLink="/admin/agents" class="admin-card group p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0a8f96]/10 border-none bg-white">
            <div class="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-orange-500/5 ltr:rounded-bl-[100px] rtl:rounded-br-[100px] transition-all duration-500 group-hover:w-40 group-hover:h-40"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 mb-8">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.AGENTS.TITLE' | translate }}
              </h3>
              <p class="text-sm font-bold text-gray-400 leading-relaxed">{{ 'ADMIN.DASHBOARD.OPERATIONS.AGENTS.DESC' | translate }}</p>
              <div class="mt-8 flex items-center gap-2 text-[11px] font-black text-orange-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.AGENTS.ACTION' | translate }} <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          </a>

          <!-- Financial Management -->
          <a routerLink="/admin/payments" class="admin-card group p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0a8f96]/10 border-none bg-white">
            <div class="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-blue-500/5 ltr:rounded-bl-[100px] rtl:rounded-br-[100px] transition-all duration-500 group-hover:w-40 group-hover:h-40"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 mb-8">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-500 transition-colors">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.FINANCE.TITLE' | translate }}
              </h3>
              <p class="text-sm font-bold text-gray-400 leading-relaxed">{{ 'ADMIN.DASHBOARD.OPERATIONS.FINANCE.DESC' | translate }}</p>
              <div class="mt-8 flex items-center gap-2 text-[11px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.FINANCE.ACTION' | translate }} <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          </a>

          <!-- AI & System -->
          <a routerLink="/admin/ai/search" class="admin-card group p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0a8f96]/10 border-none bg-white">
            <div class="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-purple-500/5 ltr:rounded-bl-[100px] rtl:rounded-br-[100px] transition-all duration-500 group-hover:w-40 group-hover:h-40"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 mb-8">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-3 group-hover:text-purple-500 transition-colors">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.AI.TITLE' | translate }}
              </h3>
              <p class="text-sm font-bold text-gray-400 leading-relaxed">{{ 'ADMIN.DASHBOARD.OPERATIONS.AI.DESC' | translate }}</p>
              <div class="mt-8 flex items-center gap-2 text-[11px] font-black text-purple-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.AI.ACTION' | translate }} <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          </a>

          <!-- Audit Logs -->
          <a routerLink="/admin/audit-logs" class="admin-card group p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0a8f96]/10 border-none bg-white">
            <div class="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-red-500/5 ltr:rounded-bl-[100px] rtl:rounded-br-[100px] transition-all duration-500 group-hover:w-40 group-hover:h-40"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 mb-8">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-3 group-hover:text-red-500 transition-colors">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.AUDIT.TITLE' | translate }}
              </h3>
              <p class="text-sm font-bold text-gray-400 leading-relaxed">{{ 'ADMIN.DASHBOARD.OPERATIONS.AUDIT.DESC' | translate }}</p>
              <div class="mt-8 flex items-center gap-2 text-[11px] font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.AUDIT.ACTION' | translate }} <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          </a>

          <!-- Refund Management -->
          <a routerLink="/admin/refunds" class="admin-card group p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0a8f96]/10 border-none bg-white">
            <div class="absolute top-0 ltr:right-0 rtl:left-0 w-32 h-32 bg-orange-500/5 ltr:rounded-bl-[100px] rtl:rounded-br-[100px] transition-all duration-500 group-hover:w-40 group-hover:h-40"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 mb-8">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4 2 4-2 4 2z"/></svg>
              </div>
              <h3 class="text-xl font-black text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.REFUNDS.TITLE' | translate }}
              </h3>
              <p class="text-sm font-bold text-gray-400 leading-relaxed">{{ 'ADMIN.DASHBOARD.OPERATIONS.REFUNDS.DESC' | translate }}</p>
              <div class="mt-8 flex items-center gap-2 text-[11px] font-black text-orange-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 transform ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0">
                {{ 'ADMIN.DASHBOARD.OPERATIONS.REFUNDS.ACTION' | translate }} <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  usersCount = signal(0);
  agentsCount = signal(0);
  verifiedCount = signal(0);
  pendingCount = signal(0);
  verifiedPercentage = signal(0);

  private adminService = inject(AdminService);

  async ngOnInit() {
    try {
      const [users, agents] = await Promise.all([
        this.adminService.getUsers().catch(() => []),
        this.adminService.getAgents().catch(() => []),
      ]);
      
      this.usersCount.set(users.length);
      this.agentsCount.set(agents.length);
      this.verifiedCount.set(agents.filter(a => a.isVerified).length);
      this.pendingCount.set(agents.filter(a => !a.isVerified).length);
      
      const vPercent = agents.length > 0 ? Math.round((this.verifiedCount() / agents.length) * 100) : 0;
      this.verifiedPercentage.set(vPercent);
    } catch {
      this.usersCount.set(0);
      this.agentsCount.set(0);
      this.verifiedCount.set(0);
      this.pendingCount.set(0);
    }
  }
}
