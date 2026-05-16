import { Component, signal, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';

import { AuthService } from '../../../core/auth/auth.service';
import { BookingService } from '../services/booking.service';
import { BookingListItem, BookingStatus } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ToastService } from '../../../core/services/toast.service';
import { PropertyService } from '../../properties/services/property.service';
import { LocalImageService } from '../../../core/services/local-image.service';
import { buildPropertyPlaceholder, getPropertyImageUrl } from '../../../core/utils/media';
import { Router } from '@angular/router';
import { ConversationService } from '../../conversations/services/conversation.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, PaginationComponent, LocalizedDatePipe, EmptyStateComponent, TranslateModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans py-20 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div class="ltr:text-left rtl:text-right">
            <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">{{ (auth.isAgent() ? 'BOOKINGS.AGENT_TITLE' : 'BOOKINGS.TITLE') | translate }}</h1>
            <p class="text-gray-500 font-bold text-sm">{{ (auth.isAgent() ? 'BOOKINGS.AGENT_SUBTITLE' : 'BOOKINGS.SUBTITLE_COUNT') | translate:{ count: totalCount() } }}</p>
          </div>
          <div class="flex items-center gap-2 bg-white p-1.5 rounded-[24px] border border-gray-100 shadow-sm">
            <button (click)="setStatusFilter('Upcoming')" [class]="statusFilter() === 'Upcoming' ? 'text-[#0a8f96] bg-[#0a8f96]/5' : 'text-gray-400 hover:text-gray-900'" class="px-8 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all">{{ 'BOOKINGS.UPCOMING' | translate }} ({{ getFilteredCount('Upcoming') }})</button>
            <button (click)="setStatusFilter('Previous')" [class]="statusFilter() === 'Previous' ? 'text-[#0a8f96] bg-[#0a8f96]/5' : 'text-gray-400 hover:text-gray-900'" class="px-8 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all">{{ 'BOOKINGS.PREVIOUS' | translate }}</button>
            <button (click)="setStatusFilter('Cancelled')" [class]="statusFilter() === 'Cancelled' ? 'text-[#0a8f96] bg-[#0a8f96]/5' : 'text-gray-400 hover:text-gray-900'" class="px-8 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all">{{ 'BOOKINGS.CANCELLED' | translate }}</button>
          </div>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-32"><app-loading-spinner [message]="'BOOKINGS.LOADING' | translate" /></div>
        }
        @else if (bookings().length === 0) {
          <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <app-empty-state 
              [title]="(auth.isAgent() ? 'BOOKINGS.AGENT_EMPTY_TITLE' : 'BOOKINGS.EMPTY_TITLE') | translate" 
              [message]="(auth.isAgent() ? 'BOOKINGS.AGENT_EMPTY_MSG' : 'BOOKINGS.EMPTY_MSG') | translate"
              [actionText]="auth.isAgent() ? '' : ('BOOKINGS.BROWSE_BTN' | translate)"
              [actionRoute]="auth.isAgent() ? '' : '/properties'">
              <div icon class="w-12 h-12 text-[#0a8f96]">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
            </app-empty-state>
          </div>
        }
        @else {
          <div class="grid grid-cols-1 gap-10">
            @for (b of filteredBookings(); track b.id) {
              <div class="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#0a8f96]/5 transition-all duration-500 group flex flex-col lg:flex-row">
                <div class="w-full lg:w-[380px] h-[320px] relative overflow-hidden shrink-0 bg-gray-50">
                  <div class="absolute top-6 ltr:left-6 rtl:right-6 z-10">
                    <span class="bg-white/95 backdrop-blur-md text-gray-900 text-[9px] font-black tracking-[0.2em] uppercase px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full" [class.bg-[#0a8f96]]="b.status === 'Confirmed' || b.status === 'Completed'" [class.bg-yellow-500]="b.status === 'Pending'" [class.bg-red-500]="b.status !== 'Confirmed' && b.status !== 'Pending'"></span>
                      {{ translateStatus(b.status) | translate }}
                    </span>
                  </div>
                  <img [src]="getImageUrl(b)" [alt]="b.propertyTitle" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" (error)="onImageError($event, b)">
                </div>
                <div class="p-10 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 class="text-2xl font-black text-gray-900 group-hover:text-[#0a8f96] transition-colors leading-tight mb-6 ltr:text-left rtl:text-right">{{ b.propertyTitle }}</h2>
                    <p class="text-xs font-bold text-gray-400 flex items-center gap-1.5 mb-8 ltr:justify-start rtl:justify-end">
                      <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ 'BOOKINGS.ID_LABEL' | translate }}: <span class="tabular-nums">{{ b.propertyId.substring(0, 8) }}</span>
                    </p>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                      <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                        <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ 'BOOKINGS.TOUR_DATE' | translate }}</p>
                        <p class="text-[13px] font-black text-gray-900 tabular-nums">{{ b.startDate | localizedDate:'yyyy/MM/dd' }}</p>
                      </div>
                      <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                        <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ 'BOOKINGS.START_TIME' | translate }}</p>
                        <p class="text-[13px] font-black text-gray-900 tabular-nums">{{ b.startDate | localizedDate:'shortTime' }}</p>
                      </div>
                      <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                        <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ 'BOOKINGS.END_TIME' | translate }}</p>
                        <p class="text-[13px] font-black text-gray-900 tabular-nums">{{ b.endDate | localizedDate:'shortTime' }}</p>
                      </div>
                      <div class="bg-gray-50 p-4 rounded-2xl border border-[#0a8f96]/10">
                        <p class="text-[8px] font-black text-[#0a8f96] uppercase tracking-widest mb-1">{{ 'BOOKINGS.REQUEST_DATE' | translate }}</p>
                        <p class="text-[13px] font-black text-gray-900 tabular-nums">{{ b.createdOnUtc | localizedDate:'yyyy/MM/dd' }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-50">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-gray-50 flex items-center justify-center overflow-hidden">
                        <!-- [BACKEND_SYNC_PENDING]: Real names/avatars not yet in list DTO -->
                        <div class="w-full h-full flex items-center justify-center bg-[#0a8f96]/5 text-[#0a8f96] font-black text-xs">
                          {{ b.propertyTitle.substring(0, 1) }}
                        </div>
                        <!--
                        @if (auth.isAgent()) {
                          @if (b.buyerAvatarUrl && b.buyerAvatarUrl.length > 20) {
                            <img [src]="b.buyerAvatarUrl" class="w-full h-full object-cover">
                          } @else {
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 text-blue-500 font-black text-xs">{{ b.buyerName?.substring(0, 1) || 'ع' }}</div>
                          }
                        } @else {
                          @if (b.agentAvatarUrl && b.agentAvatarUrl.length > 20) {
                            <img [src]="b.agentAvatarUrl" class="w-full h-full object-cover">
                          } @else {
                            <div class="w-full h-full flex items-center justify-center bg-[#0a8f96]/5 text-[#0a8f96] font-black text-xs">{{ b.agentName?.substring(0, 1) || 'و' }}</div>
                          }
                        }
                        -->
                      </div>
                      <div class="ltr:text-left rtl:text-right">
                        <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ (auth.isAgent() ? 'BOOKINGS.RESPONSIBLE_BUYER' : 'BOOKINGS.RESPONSIBLE_AGENT') | translate }}</p>
                        <div class="flex items-center gap-2">
                          <p class="text-sm font-black text-[#0a8f96]">{{ (auth.isAgent() ? 'BOOKINGS.ROLE_BUYER' : 'BOOKINGS.ROLE_AGENT') | translate }}</p>
                          <span class="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                          <span class="text-[10px] font-bold text-gray-400 tabular-nums">{{ 'BOOKINGS.ID_LABEL' | translate }}: {{ b.id.substring(0, 8) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-4 w-full md:w-auto">
                      @if (auth.isAgent() && b.status === 'Pending') {
                        <button (click)="confirmBooking(b)" class="flex-1 md:flex-none px-8 py-4 bg-[#0a8f96] hover:bg-[#076b70] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#0a8f96]/20 transition-all active:scale-[0.98] flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                          {{ 'BOOKINGS.CONFIRM_BTN' | translate }}
                        </button>
                        <button (click)="cancelBooking(b)" class="flex-1 md:flex-none px-8 py-4 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl text-xs font-black transition-all active:scale-[0.98]">{{ 'BOOKINGS.REJECT_BTN' | translate }}</button>
                      }
                      <a [routerLink]="['/bookings', b.id]" class="flex-1 md:flex-none px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl text-xs font-black shadow-xl shadow-gray-900/10 transition-all text-center active:scale-[0.98]">{{ 'BOOKINGS.DETAILS_BTN' | translate }}</a>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          <div class="mt-16 flex justify-center">
            <app-pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="loadPage($event)" />
          </div>
        }
      </div>
    </div>
  `,
})
export class BookingListComponent implements OnInit {
  bookings = signal<BookingListItem[]>([]);
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);
  statusFilter = signal<'Upcoming' | 'Previous' | 'Cancelled'>('Upcoming');
  propertyImages = signal<Map<string, string>>(new Map());

  constructor(
    private bookingService: BookingService,
    public auth: AuthService,
    private toast: ToastService,
    private propertyService: PropertyService,
    private localImageService: LocalImageService,
    private router: Router,
    private conversationService: ConversationService
  ) {}

  getImageUrl(b: BookingListItem): string {
    const cached = this.propertyImages().get(b.propertyId);
    if (cached) return cached;
    // Check localStorage thumbnail cache
    const thumb = this.localImageService.getThumbnail(b.propertyId);
    if (thumb) return thumb;
    return buildPropertyPlaceholder(b.propertyTitle);
  }

  onImageError(event: Event, b: BookingListItem) {
    const img = event.target as HTMLImageElement;
    img.src = buildPropertyPlaceholder(b.propertyTitle);
  }

  async ngOnInit() { await this.loadPage(1); }

  async loadPage(p: number) {
    this.loading.set(true);
    this.page.set(p);
    try {
      const r = await this.bookingService.getMyBookings(p);
      this.bookings.set(r.items);
      this.totalPages.set(r.totalPages);
      this.totalCount.set(r.totalCount);

      // Fetch real images from property details API ONLY for IDs not in local cache
      const uniqueIds = [...new Set(r.items.map(b => b.propertyId))];
      const imgMap = new Map<string, string>();
      
      // Filter out IDs we already have in local cache
      const missingIds = uniqueIds.filter(pid => !this.localImageService.getThumbnail(pid));

      await Promise.allSettled(missingIds.map(async (pid) => {
        try {
          const prop = await this.propertyService.getById(pid);
          if (prop.images && prop.images.length > 0) {
            const primary = prop.images.find(i => i.isPrimary);
            const url = primary ? primary.url : prop.images[0].url;
            const finalUrl = getPropertyImageUrl(url, prop.title);
            imgMap.set(pid, finalUrl);
            // Save to local cache for future use
            this.localImageService.saveThumbnail(pid, finalUrl);
          }
        } catch {}
      }));
      this.propertyImages.set(imgMap);
    } catch {} finally {
      this.loading.set(false);
    }
  }

  filteredBookings() {
    const all = this.bookings();
    const filter = this.statusFilter();
    const now = Date.now();
    return all.filter(b => {
      const endTime = new Date(b.endDate).getTime();
      if (filter === 'Upcoming') return b.status !== 'Cancelled' && endTime >= now;
      if (filter === 'Previous') return b.status !== 'Cancelled' && endTime < now;
      if (filter === 'Cancelled') return b.status === 'Cancelled';
      return true;
    });
  }

  getFilteredCount(status: 'Upcoming' | 'Previous' | 'Cancelled') {
    const now = Date.now();
    return this.bookings().filter(b => {
      const endTime = new Date(b.endDate).getTime();
      if (status === 'Upcoming') return b.status !== 'Cancelled' && endTime >= now;
      if (status === 'Previous') return b.status !== 'Cancelled' && endTime < now;
      if (status === 'Cancelled') return b.status === 'Cancelled';
      return true;
    }).length;
  }

  setStatusFilter(status: 'Upcoming' | 'Previous' | 'Cancelled') { this.statusFilter.set(status); }

  async reschedule(booking: BookingListItem) {
    this.router.navigate(['/bookings/new'], { 
      queryParams: { 
        propertyId: booking.propertyId,
        oldBookingId: booking.id 
      } 
    });
  }

  translateStatus(status: string): string {
    return `BOOKINGS.STATUSES.${status}`;
  }

  async confirmBooking(booking: BookingListItem) {
    try {
      await this.bookingService.updateStatus(booking.id, { status: BookingStatus.Confirmed });
      this.toast.success('تم تأكيد الحجز بنجاح');
      await this.loadPage(this.page());
    } catch {
      this.toast.error('فشل تأكيد الحجز');
    }
  }

  async cancelBooking(booking: BookingListItem) {
    try {
      await this.bookingService.updateStatus(booking.id, { status: BookingStatus.Cancelled });
      this.toast.success('تم رفض الحجز');
      await this.loadPage(this.page());
    } catch {
      this.toast.error('فشل رفض الحجز');
    }
  }
}
