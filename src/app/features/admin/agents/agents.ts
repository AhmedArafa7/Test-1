import { Component, OnInit, signal, inject } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AdminAgent } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-agents',
  standalone: true,
  imports: [LoadingSpinnerComponent, DecimalPipe, TranslateModule, CommonModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-10">
        <div class="ltr:text-left rtl:text-right">
          <h1 class="text-3xl font-black text-gray-900 flex items-center gap-4 mb-2">
            {{ 'ADMIN.AGENTS.TITLE' | translate }}
          </h1>
          <p class="text-gray-400 font-bold text-sm">{{ 'ADMIN.AGENTS.SUBTITLE' | translate }}</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button (click)="loadAgents()" class="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-[#0a8f96] transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ltr:text-left rtl:text-right">
        <!-- Total Agents -->
        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-up">{{ 'ADMIN.AGENTS.STATS.TREND_TOTAL' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AGENTS.STATS.TOTAL' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ agents().length }}</p>
        </div>

        <!-- Verified Agents -->
        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <span class="badge-trend badge-trend-up">{{ 'ADMIN.AGENTS.STATS.TREND_VERIFIED' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AGENTS.STATS.VERIFIED' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ verifiedAgentsCount() }}</p>
        </div>

        <!-- Pending Review -->
        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-neutral">{{ 'ADMIN.AGENTS.STATS.TREND_PENDING' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AGENTS.STATS.PENDING' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ pendingAgentsCount() }}</p>
        </div>

        <!-- Avg Rating -->
        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.107-3.41z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <span class="badge-trend badge-trend-up">{{ 'ADMIN.AGENTS.STATS.TREND_RATING' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AGENTS.STATS.AVG_RATING' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ avgRating() | number:'1.1-1' }}</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <app-loading-spinner />
          <p class="text-gray-400 font-bold mt-4">{{ 'ADMIN.AGENTS.LOADING' | translate }}</p>
        </div>
      } @else {
        <div class="admin-table-container rounded-[32px] !border-none shadow-sm overflow-hidden bg-white">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="w-[20%] ltr:text-left rtl:text-right">{{ 'ADMIN.AGENTS.TABLE.NAME' | translate }}</th>
                <th class="w-[15%] ltr:text-left rtl:text-right">{{ 'ADMIN.AGENTS.TABLE.AGENCY' | translate }}</th>
                <th class="w-[15%] ltr:text-left rtl:text-right">{{ 'ADMIN.AGENTS.TABLE.COMMISSION' | translate }}</th>
                <th class="w-[15%] ltr:text-left rtl:text-right">{{ 'ADMIN.AGENTS.TABLE.RATING' | translate }}</th>
                <th class="w-[10%] ltr:text-left rtl:text-right">{{ 'ADMIN.AGENTS.TABLE.STATUS' | translate }}</th>
                <th class="w-[15%] text-center">{{ 'ADMIN.AGENTS.TABLE.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (agent of agents(); track agent.userId; let i = $index) {
                <tr class="group">
                  <td class="ltr:text-left rtl:text-right">
                    <div class="flex items-center gap-4">
                      <div class="admin-avatar shrink-0" [style.background]="['#eff6ff', '#f0f9f9', '#fdf2f8', '#f0fdf4'][i % 4]" 
                           [style.color]="['#2563eb', '#0a8f96', '#db2777', '#16a34a'][i % 4]">
                        {{ (agent.displayName || agent.email || agent.userId).substring(0, 2).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-black text-gray-900 leading-tight truncate">{{ agent.displayName || ('ADMIN.AGENTS.TABLE.NO_NAME' | translate) }}</p>
                        <p class="text-[11px] font-bold text-gray-400 mt-1 truncate">{{ agent.email || agent.userId }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="font-black text-gray-700 leading-tight truncate">{{ agent.agencyName || ('ADMIN.AGENTS.TABLE.INDEPENDENT' | translate) }}</p>
                    <p class="text-[10px] font-bold text-[#0a8f96] mt-0.5 uppercase tracking-tighter">
                      {{ 'ADMIN.AGENTS.TABLE.LICENSE' | translate }}: {{ agent.licenseNumber || ('ADMIN.AGENTS.TABLE.NOT_AVAILABLE' | translate) }}
                    </p>
                  </td>
                  <td>
                    <span class="font-black text-gray-900 tabular-nums">{{ agent.commissionRate * 100 | number:'1.0-1' }}%</span>
                  </td>
                  <td>
                    <div class="flex flex-col gap-1">
                      <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-700 font-black text-xs border border-yellow-100 w-fit">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        {{ agent.rating.toFixed(1) }}
                      </div>
                      <p class="text-[10px] font-bold text-gray-400 ltr:pl-1 rtl:pr-1">
                        ({{ agent.reviewCount }} {{ 'ADMIN.AGENTS.TABLE.REVIEWS' | translate }})
                      </p>
                    </div>
                  </td>
                  <td>
                    <span [class]="agent.isVerified ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-100' : 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 border border-orange-100'" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                      {{ (agent.isVerified ? 'ADMIN.AGENTS.STATUS.ACTIVE' : 'ADMIN.AGENTS.STATUS.PENDING') | translate }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center justify-center gap-3">
                      @if (!agent.isVerified) {
                        <button (click)="verify(agent.userId)" class="text-[10px] font-black bg-[#0a8f96] text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all">
                          {{ 'ADMIN.AGENTS.ACTIONS.VERIFY' | translate }}
                        </button>
                      } @else {
                        <button class="p-2 text-gray-300 hover:text-[#0a8f96] transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                        <button class="p-2 text-gray-300 hover:text-red-500 transition-colors">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          <!-- Pagination -->
          <div class="p-8 border-t border-gray-50 flex items-center justify-between bg-white">
            <p class="text-xs font-bold text-gray-400">
              {{ 'ADMIN.AGENTS.PAGINATION_SHOW' | translate:{count: agents().length} }}
            </p>
            <div class="flex items-center gap-1">
              <button class="pagination-modern-item pagination-modern-inactive hover:bg-gray-50 rtl:rotate-180"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
              <button class="pagination-modern-item pagination-modern-active">1</button>
              <button class="pagination-modern-item pagination-modern-inactive hover:bg-gray-50 rtl:rotate-180"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
            </div>
          </div>
        </div>
      }
    </div>

  `,
})
export class AgentsComponent implements OnInit {
  agents = signal<AdminAgent[]>([]);
  loading = signal(true);
  verifiedAgentsCount = signal(0);
  pendingAgentsCount = signal(0);
  avgRating = signal(0);

  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  async ngOnInit() {
    await this.loadAgents();
  }

  async loadAgents() {
    this.loading.set(true);
    try {
      const res = await this.adminService.getAgents();
      this.agents.set(res);
      this.verifiedAgentsCount.set(res.filter(a => a.isVerified).length);
      this.pendingAgentsCount.set(res.filter(a => !a.isVerified).length);
      const totalRating = res.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      this.avgRating.set(res.length > 0 ? totalRating / res.length : 0);
    } catch {
      this.toast.error(this.translate.instant('ADMIN.AGENTS.TOAST.LOAD_ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  async verify(id: string) {
    try {
      await this.adminService.verifyAgent(id);
      this.toast.success(this.translate.instant('ADMIN.AGENTS.TOAST.VERIFY_SUCCESS'));
      await this.loadAgents();
    } catch (error: any) {
      this.toast.error(error?.error?.detail || this.translate.instant('ADMIN.AGENTS.TOAST.ACTION_ERROR'));
    }
  }
}
