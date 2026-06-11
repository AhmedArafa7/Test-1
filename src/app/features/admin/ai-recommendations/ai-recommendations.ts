import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { NgClass, DecimalPipe, CommonModule } from '@angular/common';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { AdminService } from '../services/admin.service';
import { RecommendationRequestAdmin } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ai-recommendations-admin',
  standalone: true,
  imports: [LoadingSpinnerComponent, LocalizedDatePipe, NgClass, DecimalPipe, TranslateModule, CommonModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-10">
        <div class="ltr:text-left rtl:text-right">
          <h1 class="text-3xl font-black text-gray-900 flex items-center gap-4 mb-2">
            {{ 'ADMIN.AI_RECOMMENDATIONS.TITLE' | translate }}
          </h1>
          <p class="text-gray-400 font-bold text-sm">{{ 'ADMIN.AI_RECOMMENDATIONS.SUBTITLE' | translate }}</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button (click)="loadPage(page())" class="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-[#0a8f96] transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          <div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100/50">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span class="text-xs font-black text-indigo-600 uppercase tracking-tighter">{{ 'ADMIN.AI_RECOMMENDATIONS.ENGINE_OPTIMIZED' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ltr:text-left rtl:text-right">
        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AI_RECOMMENDATIONS.STATS.TOTAL_RECS' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ totalRecs() }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AI_RECOMMENDATIONS.STATS.SUCCESS_RATE' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ successRate() | number:'1.1-1' }}%</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AI_RECOMMENDATIONS.STATS.AVG_RESULTS' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ avgResults() | number:'1.1-1' }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.AI_RECOMMENDATIONS.STATS.TOTAL_EVENTS' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ eventsCount() }}</p>
        </div>
      </div>

      <!-- Table Section -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <app-loading-spinner />
        </div>
      } @else {
        <div class="admin-table-container rounded-[32px] !border-none shadow-sm overflow-hidden bg-white">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="ltr:text-left rtl:text-right w-[20%]">{{ 'ADMIN.AI_RECOMMENDATIONS.TABLE.USER' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.AI_RECOMMENDATIONS.TABLE.SOURCE_TYPE' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.AI_RECOMMENDATIONS.TABLE.GENERATION_SPEED' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.AI_RECOMMENDATIONS.TABLE.STATUS' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.AI_RECOMMENDATIONS.TABLE.RESULTS' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[10%]">{{ 'ADMIN.AI_RECOMMENDATIONS.TABLE.DATE' | translate }}</th>
                <th class="text-center w-[10%]">{{ 'ADMIN.AI_RECOMMENDATIONS.TABLE.DETAILS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (r of filteredItems(); track r.id) {
                <tr class="group">
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-900 font-black text-xs truncate max-w-[120px]">{{ r.requestedByUserId }}</p>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black border border-indigo-100/50 uppercase tracking-tighter">{{ r.sourceEntityType }}</span>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-900 font-black text-xs tabular-nums">
                      {{ getProcessingTime(r) }}
                    </p>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" [ngClass]="{
                      'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-100': r.status === 'Completed',
                      'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 border border-orange-100': r.status === 'Pending',
                      'bg-gradient-to-br from-red-100 to-red-50 text-red-600 border border-red-100': r.status === 'Failed'
                    }">{{ 'ADMIN.AI_RECOMMENDATIONS.STATUS.' + r.status.toUpperCase() | translate }}</span>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-900 font-black text-xs">{{ 'ADMIN.AI_RECOMMENDATIONS.RESULTS_REQUESTED' | translate:{count: r.topN} }}</p>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-400 font-bold text-[10px]">{{ r.requestedAt | localizedDate:'yyyy/M/d h:mm a' }}</p>
                  </td>
                  <td class="text-center">
                    <button (click)="viewDetails(r)" class="p-2 text-gray-300 hover:text-[#0a8f96] transition-colors" [title]="'ADMIN.AI_RECOMMENDATIONS.TABLE.DETAILS' | translate">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          <!-- Pagination -->
          <div class="p-8 border-t border-gray-50 flex items-center justify-between bg-white">
            <p class="text-xs font-bold text-gray-400">
              {{ 'ADMIN.AI_RECOMMENDATIONS.PAGINATION_SHOW' | translate:{count: filteredItems().length, total: totalCount()} }}
            </p>
            <div class="flex items-center gap-1">
              <button (click)="page() > 1 && loadPage(page() - 1)" [disabled]="page() === 1" class="pagination-modern-item ltr:rotate-180" [ngClass]="page() === 1 ? 'opacity-30 cursor-not-allowed' : 'pagination-modern-inactive hover:bg-gray-100'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>

              @for (p of [].constructor(totalPages()); track $index) {
                @if ($index + 1 === page()) {
                  <button class="pagination-modern-item pagination-modern-active">{{ $index + 1 }}</button>
                } @else if ($index + 1 <= 3 || $index + 1 >= totalPages() - 2 || ($index + 1 >= page() - 1 && $index + 1 <= page() + 1)) {
                  <button (click)="loadPage($index + 1)" class="pagination-modern-item pagination-modern-inactive">{{ $index + 1 }}</button>
                } @else if ($index + 1 === 4 || $index + 1 === totalPages() - 3) {
                  <span class="px-2 text-gray-300">...</span>
                }
              }

              <button (click)="page() < totalPages() && loadPage(page() + 1)" [disabled]="page() === totalPages()" class="pagination-modern-item ltr:rotate-180" [ngClass]="page() === totalPages() ? 'opacity-30 cursor-not-allowed' : 'pagination-modern-inactive hover:bg-gray-100'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- AI Recommendation Details Modal (outside animate-fade-in to keep fixed positioning) -->
      @if (selectedRequest()) {
        <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" (click)="selectedRequest.set(null)"></div>
          <div class="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10 ltr:text-left rtl:text-right">
              <div>
                <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.TITLE' | translate }}</h3>
                <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.SUBTITLE' | translate }}</p>
              </div>
              <button (click)="selectedRequest.set(null)" class="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 ltr:text-left rtl:text-right">
              <!-- Context Info -->
              <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-gray-400 uppercase">{{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.SOURCE_ID' | translate }}</p>
                  <p class="text-sm font-black text-gray-900 tabular-nums select-all">{{ selectedRequest()?.sourceEntityId || ('ADMIN.AI_RECOMMENDATIONS.MODAL.NOT_AVAILABLE' | translate) }}</p>
                </div>
                <div class="flex items-center justify-between border-t border-gray-50 pt-6">
                  <p class="text-[10px] font-black text-gray-400 uppercase">{{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.SOURCE_TYPE' | translate }}</p>
                  <p class="text-sm font-black text-[#0a8f96]">{{ selectedRequest()?.sourceEntityType }}</p>
                </div>
              </div>

              <!-- Technical Tracking -->
              <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-gray-400 uppercase">{{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.CORRELATION_ID' | translate }}</p>
                  <p class="text-[11px] font-mono font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-lg select-all">{{ selectedRequest()?.correlationId || ('ADMIN.AI_RECOMMENDATIONS.MODAL.NOT_AVAILABLE' | translate) }}</p>
                </div>
              </div>

              <!-- Performance Summary -->
              <div class="bg-indigo-900 rounded-[32px] p-8 text-white flex justify-between items-center ltr:flex-row rtl:flex-row">
                <div class="ltr:text-left rtl:text-right">
                  <p class="text-xs font-bold text-indigo-300 mb-1">{{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.TOTAL_SPEED' | translate }}</p>
                  <h4 class="text-3xl font-black text-white">{{ getProcessingTime(selectedRequest()!) }}</h4>
                </div>
                <div class="ltr:text-right rtl:text-left">
                  <p class="text-[10px] font-black uppercase text-indigo-400 mb-1">{{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.RECS_COUNT' | translate }}</p>
                  <p class="text-sm font-black">{{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.ITEMS_REQUESTED' | translate:{count: selectedRequest()?.topN} }}</p>
                </div>
              </div>
            </div>

            <div class="p-8 border-t border-gray-50 bg-white flex justify-end">
              <button (click)="selectedRequest.set(null)" class="px-10 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black transition-all active:scale-95">
                {{ 'ADMIN.AI_RECOMMENDATIONS.MODAL.CLOSE' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AiRecommendationsComponent implements OnInit {
  items = signal<RecommendationRequestAdmin[]>([]);
  filteredItems = computed(() => {
    const term = this.adminService.globalSearchTerm()?.toLowerCase();
    if (!term) return this.items();
    return this.items().filter(r => 
      (r.requestedByUserId?.toLowerCase() || '').includes(term) || 
      (r.sourceEntityType?.toLowerCase() || '').includes(term) ||
      (r.status?.toLowerCase() || '').includes(term)
    );
  });
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);
  selectedRequest = signal<RecommendationRequestAdmin | null>(null);

  // Stats
  totalRecs = computed(() => this.filteredItems().length);
  successRate = computed(() => {
    const list = this.filteredItems();
    return list.length > 0 ? (list.filter(i => i.status === 'Completed').length / list.length) * 100 : 0;
  });
  eventsCount = computed(() => this.filteredItems().reduce((acc, curr) => acc + curr.outboxEventCount, 0));
  avgResults = computed(() => {
    const list = this.filteredItems();
    return list.length > 0 ? list.reduce((acc, curr) => acc + curr.topN, 0) / list.length : 0;
  });

  private adminService = inject(AdminService);
  private translate = inject(TranslateService);

  async ngOnInit() {
    await this.loadPage(1);
  }

  async loadPage(p: number) {
    this.loading.set(true);
    this.page.set(p);
    try {
      const r = await this.adminService.getRecommendationRequests(p);
      this.items.set(r.items);
      this.totalPages.set(r.totalPages);
      this.totalCount.set(r.totalCount);
    } catch {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  viewDetails(request: RecommendationRequestAdmin) {
    this.selectedRequest.set(request);
  }

  getProcessingTime(r: RecommendationRequestAdmin): string {
    if (!r.resolvedAt) return '...';
    const start = new Date(r.requestedAt).getTime();
    const end = new Date(r.resolvedAt).getTime();
    const diff = end - start;
    return diff > 1000 
      ? `${(diff / 1000).toFixed(2)} ${this.translate.instant('ADMIN.AI_RECOMMENDATIONS.LAG.SEC')}` 
      : `${diff} ${this.translate.instant('ADMIN.AI_RECOMMENDATIONS.LAG.MS')}`;
  }
}
