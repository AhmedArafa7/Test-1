import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AdminService } from '../services/admin.service';
import { AuditLog, DomainEventLog } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [LoadingSpinnerComponent, LocalizedDatePipe, DecimalPipe, TranslateModule, CommonModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-10">
        <div class="ltr:text-left rtl:text-right">
          <h1 class="text-3xl font-black text-gray-900 flex items-center gap-4 mb-2">
            {{ (isDomainEvents() ? 'ADMIN.AUDIT_LOGS.DOMAIN_EVENTS_TITLE' : 'ADMIN.AUDIT_LOGS.SYSTEM_LOGS_TITLE') | translate }}
          </h1>
          <p class="text-gray-400 font-bold text-sm">
            {{ (isDomainEvents() ? 'ADMIN.AUDIT_LOGS.DOMAIN_EVENTS_SUBTITLE' : 'ADMIN.AUDIT_LOGS.SYSTEM_LOGS_SUBTITLE') | translate }}
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <button (click)="loadData(1)" class="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-[#0a8f96] transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      <!-- Stats Cards (Only for Audit Logs) -->
      @if (!isDomainEvents()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ltr:text-left rtl:text-right">
          <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </div>
            </div>
            <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AUDIT_LOGS.STATS.TOTAL_OPS' | translate }}</p>
            <p class="text-3xl font-black text-gray-900 tabular-nums">{{ totalCount() | number }}</p>
          </div>

          <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </div>
              <span class="badge-trend badge-trend-neutral">{{ 'ADMIN.AUDIT_LOGS.STATS.INSTANT' | translate }}</span>
            </div>
            <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AUDIT_LOGS.STATS.UPDATES' | translate }}</p>
            <p class="text-3xl font-black text-gray-900 tabular-nums">{{ updatesCount() | number }}</p>
          </div>

          <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </div>
              <span class="badge-trend badge-trend-down">{{ 'ADMIN.AUDIT_LOGS.STATS.LIVE' | translate }}</span>
            </div>
            <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AUDIT_LOGS.STATS.DELETIONS' | translate }}</p>
            <p class="text-3xl font-black text-gray-900 tabular-nums">{{ deletionsCount() | number }}</p>
          </div>

          <div class="admin-card p-8 group border-orange-100 bg-orange-50/10">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-black">{{ 'ADMIN.AUDIT_LOGS.STATS.ACTIVE' | translate }}</span>
            </div>
            <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AUDIT_LOGS.STATS.CREATIONS' | translate }}</p>
            <p class="text-3xl font-black text-gray-900 tabular-nums">{{ creationsCount() | number }}</p>
          </div>
        </div>
      }

      <!-- Table Section -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <app-loading-spinner />
          <p class="text-gray-400 font-bold mt-4">{{ 'ADMIN.AUDIT_LOGS.LOADING' | translate }}</p>
        </div>
      } @else {
        <div class="admin-table-container rounded-[32px] !border-none shadow-sm overflow-hidden bg-white">
          <table class="admin-table">
            <thead>
              <tr>
                @if (isDomainEvents()) {
                  <th class="w-[15%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.TIME' | translate }}</th>
                  <th class="w-[25%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.EVENT_TYPE' | translate }}</th>
                  <th class="w-[25%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.ENTITY_AFFECTED' | translate }}</th>
                  <th class="w-[15%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.SYNC_TIME' | translate }}</th>
                  <th class="w-[20%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.STATUS' | translate }}</th>
                } @else {
                  <th class="w-[20%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.DATE' | translate }}</th>
                  <th class="w-[25%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.USER' | translate }}</th>
                  <th class="w-[15%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.ACTION' | translate }}</th>
                  <th class="w-[25%] ltr:text-left rtl:text-right">{{ 'ADMIN.AUDIT_LOGS.TABLE.ENTITY' | translate }}</th>
                  <th class="w-[15%] text-center">{{ 'ADMIN.AUDIT_LOGS.TABLE.DETAILS' | translate }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @if (isDomainEvents()) {
                @for (e of domainEvents(); track e.id) {
                  <tr class="group">
                    <td class="ltr:text-left rtl:text-right">
                      <p class="text-gray-900 font-bold text-xs">{{ e.occurredOnUtc | localizedDate:'yyyy/M/d' }}</p>
                      <p class="text-[10px] text-gray-400 mt-1 font-bold">{{ e.occurredOnUtc | localizedDate:'h:mm:ss a' }}</p>
                    </td>
                    <td class="ltr:text-left rtl:text-right">
                      <p class="text-[#0a8f96] font-black text-xs">{{ e.eventType }}</p>
                    </td>
                    <td class="ltr:text-left rtl:text-right">
                      <p class="text-gray-900 font-black text-xs">{{ e.aggregateType }}</p>
                      <p class="text-[10px] text-gray-400 mt-1 font-bold">({{ e.aggregateId.substring(0,8) }})</p>
                    </td>
                    <td class="ltr:text-left rtl:text-right">
                      <p class="text-gray-900 font-black text-xs tabular-nums">
                        {{ getSyncLag(e) }}
                      </p>
                    </td>
                    <td class="ltr:text-left rtl:text-right">
                      <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" [ngClass]="{
                        'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-100': e.isPublished,
                        'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 border border-orange-100': !e.isPublished
                      }">
                        {{ (e.isPublished ? 'ADMIN.AUDIT_LOGS.STATUS.PUBLISHED' : 'ADMIN.AUDIT_LOGS.STATUS.PENDING') | translate }}
                      </span>
                    </td>
                  </tr>
                }
              } @else {
                @for (l of auditLogs(); track l.id) {
                  <tr class="group">
                    <td class="ltr:text-left rtl:text-right">
                      <p class="text-gray-900 font-bold text-xs">{{ l.occurredOnUtc | localizedDate:'yyyy/M/d' }}</p>
                      <p class="text-[10px] text-gray-400 mt-1 font-bold">{{ l.occurredOnUtc | localizedDate:'h:mm a' }}</p>
                    </td>
                    <td class="ltr:text-left rtl:text-right">
                      <p class="text-gray-700 font-bold text-xs truncate">
                        {{ l.userId ? '...' + l.userId.substring(l.userId.length - 12) : ('ADMIN.AUDIT_LOGS.UNKNOWN_USER' | translate) }}
                      </p>
                    </td>
                    <td class="ltr:text-left rtl:text-right">
                      <span class="badge-action" [ngClass]="{
                        'badge-action-created': l.action === 'Created',
                        'badge-action-updated': l.action === 'Updated',
                        'badge-action-deleted': l.action === 'Deleted'
                      }">
                        {{ (l.action === 'Created' ? 'ADMIN.AUDIT_LOGS.ACTIONS.CREATED' : l.action === 'Updated' ? 'ADMIN.AUDIT_LOGS.ACTIONS.UPDATED' : l.action === 'Deleted' ? 'ADMIN.AUDIT_LOGS.ACTIONS.DELETED' : l.action) | translate }}
                      </span>
                    </td>
                    <td class="ltr:text-left rtl:text-right">
                      <p class="text-gray-900 font-black text-xs">{{ l.entityName }}</p>
                      <p class="text-[10px] text-gray-400 mt-1 font-bold">({{ l.entityId.substring(0,8) }})</p>
                    </td>
                    <td class="text-center">
                      <button (click)="viewDetails(l)" class="p-2 text-gray-300 hover:text-[#0a8f96] transition-colors" [title]="'ADMIN.AUDIT_LOGS.TABLE.DETAILS' | translate">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
          
          <!-- Pagination -->
          <div class="p-8 border-t border-gray-50 flex items-center justify-between bg-white">
            <p class="text-xs font-bold text-gray-400">
              {{ 'ADMIN.AUDIT_LOGS.PAGINATION_SHOW' | translate:{count: (isDomainEvents() ? domainEvents() : auditLogs()).length, total: totalCount()} }}
            </p>
            <div class="flex items-center gap-1">
              <button 
                (click)="page() > 1 && loadData(page() - 1)"
                [disabled]="page() === 1"
                class="pagination-modern-item ltr:rotate-180"
                [ngClass]="page() === 1 ? 'opacity-30 cursor-not-allowed' : 'pagination-modern-inactive hover:bg-gray-100'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>

              @for (p of [].constructor(totalPages()); track $index) {
                @if ($index + 1 === page()) {
                  <button class="pagination-modern-item pagination-modern-active">{{ $index + 1 }}</button>
                } @else if ($index + 1 <= 3 || $index + 1 >= totalPages() - 2 || ($index + 1 >= page() - 1 && $index + 1 <= page() + 1)) {
                  <button (click)="loadData($index + 1)" class="pagination-modern-item pagination-modern-inactive">{{ $index + 1 }}</button>
                } @else if ($index + 1 === 4 || $index + 1 === totalPages() - 3) {
                  <span class="px-2 text-gray-300">...</span>
                }
              }

              <button 
                (click)="page() < totalPages() && loadData(page() + 1)"
                [disabled]="page() === totalPages()"
                class="pagination-modern-item ltr:rotate-180"
                [ngClass]="page() === totalPages() ? 'opacity-30 cursor-not-allowed' : 'pagination-modern-inactive hover:bg-gray-100'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Details Modal -->
      @if (selectedLog()) {
        <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" (click)="selectedLog.set(null)"></div>
          <div class="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div class="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10 ltr:text-left rtl:text-right">
              <div>
                <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'ADMIN.AUDIT_LOGS.MODAL.TITLE' | translate }}</h3>
                <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{{ 'ADMIN.AUDIT_LOGS.MODAL.SUBTITLE' | translate }}</p>
              </div>
              <button (click)="selectedLog.set(null)" class="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 ltr:text-left rtl:text-right">
              <!-- Meta Info -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p class="text-[10px] font-black text-gray-400 uppercase mb-2">{{ 'ADMIN.AUDIT_LOGS.MODAL.USER' | translate }}</p>
                  <p class="text-sm font-black text-gray-900 truncate">{{ selectedLog()?.userId || ('ADMIN.AUDIT_LOGS.MODAL.SYSTEM_BOT' | translate) }}</p>
                </div>
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p class="text-[10px] font-black text-gray-400 uppercase mb-2">{{ 'ADMIN.AUDIT_LOGS.MODAL.IP' | translate }}</p>
                  <p class="text-sm font-black text-[#0a8f96]">{{ selectedLog()?.ipAddress || ('ADMIN.AUDIT_LOGS.MODAL.NOT_AVAILABLE' | translate) }}</p>
                </div>
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p class="text-[10px] font-black text-gray-400 uppercase mb-2">{{ 'ADMIN.AUDIT_LOGS.MODAL.DATE' | translate }}</p>
                  <p class="text-sm font-black text-gray-900">{{ selectedLog()?.occurredOnUtc | localizedDate:'yyyy/M/d - h:mm:ss a' }}</p>
                </div>
              </div>

              <!-- Changes Comparison -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 ltr:text-left rtl:text-right">
                <div dir="ltr">
                  <h4 class="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 ltr:flex-row rtl:flex-row-reverse">
                    <span class="w-2 h-2 rounded-full bg-red-400"></span>
                    {{ 'ADMIN.AUDIT_LOGS.MODAL.OLD_VALUES' | translate }}
                  </h4>
                  <div class="bg-gray-900 rounded-3xl p-6 overflow-x-auto min-h-[200px]">
                    <pre class="text-blue-300 text-xs font-mono leading-relaxed">{{ formatJson(selectedLog()?.oldValues) }}</pre>
                  </div>
                </div>
                <div dir="ltr">
                  <h4 class="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 ltr:flex-row rtl:flex-row-reverse">
                    <span class="w-2 h-2 rounded-full bg-green-400"></span>
                    {{ 'ADMIN.AUDIT_LOGS.MODAL.NEW_VALUES' | translate }}
                  </h4>
                  <div class="bg-gray-900 rounded-3xl p-6 overflow-x-auto min-h-[200px]">
                    <pre class="text-green-300 text-xs font-mono leading-relaxed">{{ formatJson(selectedLog()?.newValues) }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-8 border-t border-gray-50 bg-white sticky bottom-0 z-10 flex justify-end">
              <button (click)="selectedLog.set(null)" class="px-10 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black shadow-xl shadow-gray-900/10 transition-all active:scale-95">
                {{ 'ADMIN.AUDIT_LOGS.MODAL.CLOSE' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AuditLogsComponent implements OnInit {
  loading = signal(true);
  auditLogs = signal<AuditLog[]>([]);
  domainEvents = signal<DomainEventLog[]>([]);
  totalCount = signal(0);
  page = signal(1);
  totalPages = signal(1);
  selectedLog = signal<AuditLog | null>(null);

  isDomainEvents = signal(false);

  // Dynamic stats
  updatesCount = signal(0);
  deletionsCount = signal(0);
  creationsCount = signal(0);

  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  async ngOnInit() {
    this.route.url.subscribe(async url => {
      this.isDomainEvents.set(url.some(segment => segment.path === 'domain-events'));
      await this.loadData(1);
    });
  }

  async loadData(p: number) {
    this.loading.set(true);
    this.page.set(p);
    try {
      if (this.isDomainEvents()) {
        const r = await this.adminService.getDomainEventLogs(p);
        this.domainEvents.set(r.items);
        this.totalPages.set(r.totalPages);
        this.totalCount.set(r.totalCount || r.items.length);
      } else {
        const r = await this.adminService.getAuditLogs(p);
        this.auditLogs.set(r.items);
        this.totalPages.set(r.totalPages);
        this.totalCount.set(r.totalCount || r.items.length);

        this.updatesCount.set(r.items.filter(l => l.action === 'Updated').length);
        this.creationsCount.set(r.items.filter(l => l.action === 'Created').length);
        this.deletionsCount.set(r.items.filter(l => l.action === 'Deleted').length);
      }
    } catch (error) {
      console.error('Failed to load logs', error);
      this.auditLogs.set([]);
      this.domainEvents.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  viewDetails(log: AuditLog) {
    this.selectedLog.set(log);
  }

  getSyncLag(e: DomainEventLog): string {
    if (!e.isPublished || !e.publishedOnUtc) return '—';
    const start = new Date(e.occurredOnUtc).getTime();
    const end = new Date(e.publishedOnUtc).getTime();
    const diff = end - start;
    if (diff < 0) return `0 ${this.translate.instant('ADMIN.AUDIT_LOGS.LAG.MS')}`;
    return diff > 1000 
      ? `${(diff / 1000).toFixed(2)} ${this.translate.instant('ADMIN.AUDIT_LOGS.LAG.SEC')}` 
      : `${diff} ${this.translate.instant('ADMIN.AUDIT_LOGS.LAG.MS')}`;
  }

  formatJson(val: string | undefined | null): string {
    if (!val) return this.translate.instant('ADMIN.AUDIT_LOGS.MODAL.NO_DATA');
    try {
      const obj = JSON.parse(val);
      return JSON.stringify(obj, null, 2);
    } catch {
      return val;
    }
  }
}
