import { Component, signal, OnInit, inject } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { AdminService } from '../services/admin.service';
import { PaymentAdmin } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [LoadingSpinnerComponent, CurrencyEgpPipe, LocalizedDatePipe, DecimalPipe, TranslateModule, CommonModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-10">
        <div class="ltr:text-left rtl:text-right">
          <h1 class="text-3xl font-black text-gray-900 flex items-center gap-4 mb-2">
            {{ 'ADMIN.PAYMENTS.TITLE' | translate }}
          </h1>
          <p class="text-gray-400 font-bold text-sm">{{ 'ADMIN.PAYMENTS.SUBTITLE' | translate }}</p>
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
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0a8f96]/15 to-[#0a8f96]/5 flex items-center justify-center text-[#0a8f96] shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.PAYMENTS.STATS.TOTAL_REVENUE' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ totalRevenue() | currencyEgp }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-neutral">{{ 'ADMIN.PAYMENTS.STATS.PENDING' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.PAYMENTS.STATS.PENDING_PAYMENTS' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ pendingCount() }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-up">{{ 'ADMIN.PAYMENTS.STATS.PROFIT' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.PAYMENTS.STATS.NET_PROFIT' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ netProfit() | currencyEgp }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
            <span class="badge-trend badge-trend-up">{{ 'ADMIN.PAYMENTS.STATS.GROWTH' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.PAYMENTS.STATS.CONVERSION_RATE' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ successRate() | number:'1.1-1' }}%</p>
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
                <th class="ltr:text-left rtl:text-right w-[20%]">{{ 'ADMIN.PAYMENTS.TABLE.PROPERTY' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.PAYMENTS.TABLE.TOTAL_AMOUNT' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.PAYMENTS.TABLE.NET_PLATFORM' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.PAYMENTS.TABLE.PURPOSE' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[15%]">{{ 'ADMIN.PAYMENTS.TABLE.STATUS' | translate }}</th>
                <th class="ltr:text-left rtl:text-right w-[10%]">{{ 'ADMIN.PAYMENTS.TABLE.DATE' | translate }}</th>
                <th class="text-center w-[10%]">{{ 'ADMIN.PAYMENTS.TABLE.DETAILS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (p of payments(); track p.id) {
                <tr class="group">
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-900 font-black text-xs truncate max-w-[180px]">{{ p.propertyTitle }}</p>
                    <p class="text-[9px] text-gray-400 mt-0.5 font-bold">ID: {{ p.propertyId.substring(0,8) }}</p>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-900 font-black text-sm">{{ p.amount | currencyEgp }}</p>
                    <p class="text-[10px] text-gray-400 font-bold">{{ p.currency }}</p>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-[#0a8f96] font-black text-sm">{{ p.netAmount | currencyEgp }}</p>
                    <p class="text-[9px] text-gray-400 font-bold">{{ 'ADMIN.PAYMENTS.TABLE.COMMISSION' | translate:{amount: (p.commission | currencyEgp)} }}</p>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <span class="px-3 py-1 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-black border border-gray-100/50 uppercase">
                      {{ 'ADMIN.PAYMENTS.PURPOSES.' + p.purpose.toUpperCase() | translate }}
                    </span>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <span class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" [ngClass]="{
                      'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 border border-orange-100': p.status === 'Pending',
                      'bg-blue-50 text-blue-600 border border-blue-100': p.status === 'Escrow',
                      'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-100': p.status === 'Completed',
                      'bg-slate-50 text-slate-600 border border-slate-100': p.status === 'Refunded',
                      'bg-gradient-to-br from-red-100 to-red-50 text-red-600 border border-red-100': p.status === 'Failed'
                    }">{{ 'ADMIN.PAYMENTS.STATUS.' + p.status.toUpperCase() | translate }}</span>
                  </td>
                  <td class="ltr:text-left rtl:text-right">
                    <p class="text-gray-900 font-bold text-[11px]">{{ p.createdOnUtc | localizedDate:'yyyy/M/d' }}</p>
                    <p class="text-[9px] text-gray-400 mt-1 font-bold">{{ p.createdOnUtc | localizedDate:'h:mm a' }}</p>
                  </td>
                  <td class="text-center">
                    <button (click)="viewDetails(p)" class="p-2 text-gray-300 hover:text-[#0a8f96] transition-colors" [title]="'ADMIN.PAYMENTS.TABLE.DETAILS' | translate">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          <!-- Pagination -->
          <div class="p-8 border-t border-gray-50 flex items-center justify-between bg-white">
            <p class="text-xs font-bold text-gray-400">{{ 'ADMIN.PAYMENTS.PAGINATION_SHOW' | translate:{count: payments().length, total: totalCount()} }}</p>
            <div class="flex items-center gap-1">
              <button (click)="page() > 1 && loadPage(page() - 1)" [disabled]="page() === 1" class="pagination-modern-item ltr:rotate-180" [ngClass]="page() === 1 ? 'opacity-30 cursor-not-allowed' : 'pagination-modern-inactive hover:bg-gray-100'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
              <button class="pagination-modern-item pagination-modern-active">{{ page() }}</button>
              <button (click)="page() < totalPages() && loadPage(page() + 1)" [disabled]="page() === totalPages()" class="pagination-modern-item ltr:rotate-180" [ngClass]="page() === totalPages() ? 'opacity-30 cursor-not-allowed' : 'pagination-modern-inactive hover:bg-gray-100'">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Payment Details Modal -->
      @if (selectedPayment()) {
        <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" (click)="selectedPayment.set(null)"></div>
          <div class="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div class="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10 ltr:text-left rtl:text-right">
              <div>
                <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'ADMIN.PAYMENTS.MODAL.TITLE' | translate }}</h3>
                <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{{ 'ADMIN.PAYMENTS.MODAL.SUBTITLE' | translate }}</p>
              </div>
              <button (click)="selectedPayment.set(null)" class="w-12 h-12 flex items-center justify-center hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 ltr:text-left rtl:text-right">
              <!-- Gateway Info -->
              <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-black text-gray-400 uppercase">{{ 'ADMIN.PAYMENTS.MODAL.GATEWAY_REF' | translate }}</p>
                  <p class="text-sm font-black text-[#0a8f96] tabular-nums select-all">{{ selectedPayment()?.latestGatewayReference || ('ADMIN.PAYMENTS.MODAL.NO_REF' | translate) }}</p>
                </div>
                <div class="flex items-center justify-between border-t border-gray-50 pt-6">
                  <p class="text-[10px] font-black text-gray-400 uppercase">{{ 'ADMIN.PAYMENTS.MODAL.BANK_STATUS' | translate }}</p>
                  <p class="text-sm font-black text-gray-900">{{ selectedPayment()?.latestTransactionStatus || ('ADMIN.PAYMENTS.MODAL.NOT_AVAILABLE' | translate) }}</p>
                </div>
              </div>

              <!-- Parties Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 ltr:text-left rtl:text-right">
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p class="text-[10px] font-black text-gray-400 uppercase mb-2">{{ 'ADMIN.PAYMENTS.MODAL.PAYER_ID' | translate }}</p>
                  <p class="text-[11px] font-bold text-gray-700 truncate select-all">{{ selectedPayment()?.payerId }}</p>
                </div>
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p class="text-[10px] font-black text-gray-400 uppercase mb-2">{{ 'ADMIN.PAYMENTS.MODAL.PAYEE_ID' | translate }}</p>
                  <p class="text-[11px] font-bold text-gray-700 truncate select-all">{{ selectedPayment()?.payeeId }}</p>
                </div>
              </div>

              <!-- Financial Summary -->
              <div class="bg-gray-900 rounded-[32px] p-8 text-white ltr:text-left rtl:text-right">
                <div class="flex justify-between items-center mb-6">
                  <p class="text-xs font-bold text-gray-400">{{ 'ADMIN.PAYMENTS.MODAL.TOTAL_TRANS' | translate }}</p>
                  <p class="text-xl font-black">{{ selectedPayment()?.amount | currencyEgp }}</p>
                </div>
                <div class="flex justify-between items-center mb-6 text-orange-400">
                  <p class="text-xs font-bold">{{ 'ADMIN.PAYMENTS.MODAL.PLATFORM_COMMISSION' | translate }}</p>
                  <p class="text-lg font-black">- {{ selectedPayment()?.commission | currencyEgp }}</p>
                </div>
                <div class="h-px bg-white/10 my-6"></div>
                <div class="flex justify-between items-center text-green-400">
                  <p class="text-xs font-bold">{{ 'ADMIN.PAYMENTS.MODAL.NET_PROFIT' | translate }}</p>
                  <p class="text-2xl font-black">{{ selectedPayment()?.netAmount | currencyEgp }}</p>
                </div>
              </div>
            </div>

            <div class="p-8 border-t border-gray-50 bg-white flex justify-end">
              <button (click)="selectedPayment.set(null)" class="px-10 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black transition-all active:scale-95">
                {{ 'ADMIN.PAYMENTS.MODAL.CLOSE' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class PaymentsComponent implements OnInit {
  payments = signal<PaymentAdmin[]>([]);
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);
  selectedPayment = signal<PaymentAdmin | null>(null);

  // Stats
  totalRevenue = signal(0);
  pendingCount = signal(0);
  netProfit = signal(0);
  successRate = signal(0);

  private adminService = inject(AdminService);

  async ngOnInit() {
    await this.loadPage(1);
  }

  async loadPage(p: number) {
    this.loading.set(true);
    this.page.set(p);
    try {
      const r = await this.adminService.getPayments(p);
      this.payments.set(r.items);
      this.totalPages.set(r.totalPages);
      this.totalCount.set(r.totalCount);
      
      // Calculate stats from successful payments only (Completed + Escrow)
      const successful = r.items.filter(i => i.status === 'Completed' || i.status === 'Escrow');
      this.totalRevenue.set(successful.reduce((acc, curr) => acc + curr.amount, 0));
      this.pendingCount.set(r.items.filter(i => i.status === 'Pending').length);
      this.netProfit.set(successful.reduce((acc, curr) => acc + curr.netAmount, 0));
      this.successRate.set(r.items.length > 0 ? (successful.length / r.items.length) * 100 : 0);
    } catch {
      this.payments.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  viewDetails(payment: PaymentAdmin) {
    this.selectedPayment.set(payment);
  }
}
