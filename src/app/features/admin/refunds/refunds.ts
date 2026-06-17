import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { AdminService } from '../services/admin.service';
import { RefundRequestAdmin } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { extractApiError } from '../../../core/utils/api-error';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-refunds',
  standalone: true,
  imports: [LoadingSpinnerComponent, LocalizedDatePipe, CurrencyEgpPipe, DecimalPipe, TranslateModule, CommonModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-10">
        <div class="ltr:text-left rtl:text-right">
          <h1 class="text-3xl font-black text-gray-900 flex items-center gap-4 mb-2">
            {{ 'ADMIN.REFUNDS.TITLE' | translate }}
          </h1>
          <p class="text-gray-400 font-bold text-sm">{{ 'ADMIN.REFUNDS.SUBTITLE' | translate }}</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button (click)="loadPage(1)" class="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-[#0a8f96] transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ltr:text-left rtl:text-right">
        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-neutral">{{ 'ADMIN.REFUNDS.STATS.URGENT' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.REFUNDS.STATS.PENDING_REVIEWS' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ pendingCount() }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-up">{{ 'ADMIN.REFUNDS.STATS.FIXED' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.REFUNDS.STATS.TOTAL_REFUNDED' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ totalRefunded() | currencyEgp }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-down">{{ 'ADMIN.REFUNDS.STATS.REJECT' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.REFUNDS.STATS.REJECTION_RATE' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ rejectionRate() | number:'1.1-1' }}%</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <span class="badge-trend badge-trend-up">{{ 'ADMIN.REFUNDS.STATS.TOTAL' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.REFUNDS.STATS.TOTAL_REFUNDS' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ filteredRefunds().length }}</p>
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
                <th class="ltr:text-left rtl:text-right w-[20%]">{{ 'ADMIN.REFUNDS.TABLE.REQUESTER' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.REFUNDS.TABLE.AMOUNT' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[25%]">{{ 'ADMIN.REFUNDS.TABLE.REASON' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.REFUNDS.TABLE.STATUS' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.REFUNDS.TABLE.DATE' | translate }}</th>
                <th class="text-center w-[10%]">{{ 'ADMIN.REFUNDS.TABLE.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (r of filteredRefunds(); track r.id) {
                <tr class="group">
                  <td class="ltr:text-left rtl:text-right">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0a8f96]/15 to-[#0a8f96]/5 flex items-center justify-center text-[#0a8f96] shadow-sm text-[10px] font-black uppercase">
                        {{ r.requestedBy.substring(0, 2) }}
                      </div>
                      <p class="text-gray-900 font-black text-sm truncate max-w-[120px]">{{ r.requestedBy }}</p>
                    </div>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-900 font-black text-sm">{{ r.amount | currencyEgp }}</p>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-400 font-bold text-xs max-w-xs truncate" [title]="r.reason">{{ r.reason || '—' }}</p>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" [ngClass]="{
                      'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-100': r.status === 'Approved' || r.status === 'Processed',
                      'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 border border-orange-100': r.status === 'Pending',
                      'bg-gradient-to-br from-red-100 to-red-50 text-red-600 border border-red-100': r.status === 'Rejected'
                    }">{{ 'ADMIN.REFUNDS.STATUS.' + r.status.toUpperCase() | translate }}</span>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-900 font-bold text-[11px]">{{ r.createdOnUtc | localizedDate:'yyyy/M/d' }}</p>
                    <p class="text-[9px] text-gray-400 mt-1 font-bold">{{ r.createdOnUtc | localizedDate:'h:mm a' }}</p>
                  </td>
                  <td class="text-center">
                    <div class="flex items-center justify-center gap-2">
                      @if (r.status === 'Pending') {
                        <button (click)="review(r.id, true)" class="px-3 py-1.5 rounded-lg bg-green-500 text-white text-[10px] font-black hover:bg-green-600 transition-all shadow-sm">
                          {{ 'ADMIN.REFUNDS.ACTIONS.APPROVE' | translate }}
                        </button>
                        <button (click)="review(r.id, false)" class="px-3 py-1.5 rounded-lg bg-gradient-to-br from-red-100 to-red-50 text-red-600 text-[10px] font-black border border-red-100 hover:bg-red-100 transition-all">
                          {{ 'ADMIN.REFUNDS.ACTIONS.REJECT' | translate }}
                        </button>
                      } @else {
                        <button (click)="viewDetails(r)" class="p-2 text-gray-300 hover:text-[#0a8f96] transition-colors" [title]="'ADMIN.REFUNDS.ACTIONS.DETAILS' | translate">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
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
            <p class="text-xs font-bold text-gray-400">{{ 'ADMIN.REFUNDS.PAGINATION_SHOW' | translate:{count: filteredRefunds().length} }}</p>
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
    </div>

      <!-- Refund Details Modal -->
      @if (selectedRefund()) {
        <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" (click)="selectedRefund.set(null)"></div>
          <div class="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div class="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10 ltr:text-left rtl:text-right">
              <div>
                <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'ADMIN.REFUNDS.MODAL.TITLE' | translate }}</h3>
                <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{{ 'ADMIN.REFUNDS.MODAL.SUBTITLE' | translate }}</p>
              </div>
              <button (click)="selectedRefund.set(null)" class="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 ltr:text-left rtl:text-right">
              <!-- Audit Trail -->
              <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-gray-400 uppercase">{{ 'ADMIN.REFUNDS.MODAL.REVIEWED_BY' | translate }}</p>
                  <p class="text-sm font-black text-gray-900">{{ selectedRefund()?.reviewedBy || ('ADMIN.REFUNDS.MODAL.SYSTEM_BOT' | translate) }}</p>
                </div>
                <div class="flex items-center justify-between border-t border-gray-50 pt-6">
                  <p class="text-[10px] font-black text-gray-400 uppercase">{{ 'ADMIN.REFUNDS.MODAL.REVIEWED_DATE' | translate }}</p>
                  <p class="text-sm font-black text-[#0a8f96]">{{ selectedRefund()?.reviewedOnUtc ? (selectedRefund()?.reviewedOnUtc | localizedDate:'yyyy/M/d - h:mm a') : ('ADMIN.REFUNDS.MODAL.NOT_AVAILABLE' | translate) }}</p>
                </div>
              </div>

              <!-- Context Info -->
              <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm ltr:text-left rtl:text-right">
                <div class="space-y-4">
                  <p class="text-[10px] font-black text-gray-400 uppercase">{{ 'ADMIN.REFUNDS.MODAL.ORIGINAL_PAYMENT_ID' | translate }}</p>
                  <p class="text-[11px] font-mono font-bold text-gray-500 bg-gray-50 p-3 rounded-xl select-all">{{ selectedRefund()?.paymentId }}</p>
                </div>
              </div>

              <!-- Amount Summary -->
              <div class="bg-gray-900 rounded-[32px] p-8 text-white flex justify-between items-center ltr:flex-row rtl:flex-row">
                <div class="ltr:text-left rtl:text-right">
                  <p class="text-xs font-bold text-gray-400 mb-1">{{ 'ADMIN.REFUNDS.MODAL.REQUESTED_AMOUNT' | translate }}</p>
                  <h4 class="text-3xl font-black text-orange-400">{{ selectedRefund()?.amount | currencyEgp }}</h4>
                </div>
                <div class="ltr:text-right rtl:text-left">
                  <p class="text-[10px] font-black uppercase text-gray-500 mb-1">{{ 'ADMIN.REFUNDS.MODAL.ORDER_STATUS' | translate }}</p>
                  <p class="text-sm font-black">{{ 'ADMIN.REFUNDS.STATUS.' + (selectedRefund()?.status?.toUpperCase() || '') | translate }}</p>
                </div>
              </div>
            </div>

            <div class="p-8 border-t border-gray-50 bg-white flex justify-end">
              <button (click)="selectedRefund.set(null)" class="px-10 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black transition-all active:scale-95">
                {{ 'ADMIN.REFUNDS.MODAL.CLOSE' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
  `,
})
export class RefundsComponent implements OnInit {
  refunds = signal<RefundRequestAdmin[]>([]);
  filteredRefunds = computed(() => {
    const term = this.adminService.globalSearchTerm()?.toLowerCase();
    if (!term) return this.refunds();
    return this.refunds().filter(r => 
      (r.requestedBy?.toLowerCase() || '').includes(term) || 
      (r.reason?.toLowerCase() || '').includes(term) ||
      (r.status?.toLowerCase() || '').includes(term) ||
      (r.amount.toString()).includes(term)
    );
  });
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);
  selectedRefund = signal<RefundRequestAdmin | null>(null);

  // Stats
  pendingCount = computed(() => this.filteredRefunds().filter(i => i.status === 'Pending').length);
  totalRefunded = computed(() => this.filteredRefunds().filter(i => i.status === 'Approved' || i.status === 'Processed').reduce((acc, curr) => acc + curr.amount, 0));
  rejectionRate = computed(() => {
    const list = this.filteredRefunds();
    return list.length > 0 ? (list.filter(i => i.status === 'Rejected').length / list.length) * 100 : 0;
  });

  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  async ngOnInit() {
    await this.loadPage(1);
  }

  async loadPage(p: number) {
    this.loading.set(true);
    this.page.set(p);
    try {
      const r = await this.adminService.getRefunds(p);
      this.refunds.set(r.items);
      this.totalPages.set(r.totalPages);
    } catch {
      this.refunds.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async review(id: string, approve: boolean) {
    try {
      await this.adminService.reviewRefund(id, { approve });
      this.toast.success(approve ? this.translate.instant('ADMIN.REFUNDS.ACTIONS.SUCCESS_APPROVE') : this.translate.instant('ADMIN.REFUNDS.ACTIONS.SUCCESS_REJECT'));
      this.loadPage(this.page());
    } catch (e: any) {
      const extracted = extractApiError(e, this.translate);
      if (extracted) { this.toast.error(extracted); return; }
      this.toast.error(this.translate.instant('ADMIN.REFUNDS.ACTIONS.FAILED'));
    }
  }

  viewDetails(refund: RefundRequestAdmin) {
    this.selectedRefund.set(refund);
  }
}
