import { Component, signal, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
import { ConversationService } from '../../conversations/services/conversation.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, PaginationComponent, LocalizedDatePipe, EmptyStateComponent, TranslateModule, CommonModule],
  template: `
    <div class="min-h-screen bg-[#f8fafc] font-sans pt-24 md:pt-28 pb-16 px-4 md:px-8">
      <div class="max-w-[1400px] mx-auto">
        
        <!-- Top Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 w-full">
          <div class="ltr:text-left rtl:text-right">
            <h1 class="text-3xl md:text-[40px] font-black text-gray-900 tracking-tight mb-2">
              {{ (auth.isAgent() ? 'BOOKINGS.AGENT_TITLE' : 'BOOKINGS.TITLE') | translate }}
            </h1>
            <p class="text-slate-500 font-bold text-sm md:text-base">
              {{ (auth.isAgent() ? 'BOOKINGS.AGENT_SUBTITLE' : 'BOOKINGS.SUBTITLE_COUNT') | translate:{ count: totalCount() } }}
            </p>
          </div>
          
          <!-- Filter Switcher (Pills) -->
          <div class="flex items-center gap-2 bg-[#f1f5f9] p-1.5 rounded-full border border-slate-100 shadow-sm shrink-0">
            <button (click)="setStatusFilter('All')"
                    [class]="statusFilter() === 'All' ? 'bg-[#076b70] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'"
                    class="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer">
              {{ 'BOOKINGS.FILTER_ALL' | translate }}
            </button>
            <button (click)="setStatusFilter('Pending')"
                    [class]="statusFilter() === 'Pending' ? 'bg-[#076b70] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'"
                    class="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer">
              {{ 'BOOKINGS.STATUSES.Pending' | translate }}
            </button>
            <button (click)="setStatusFilter('Confirmed')"
                    [class]="statusFilter() === 'Confirmed' ? 'bg-[#076b70] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'"
                    class="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer">
              {{ 'BOOKINGS.STATUSES.Confirmed' | translate }}
            </button>
            <button (click)="setStatusFilter('Cancelled')"
                    [class]="statusFilter() === 'Cancelled' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-transparent'"
                    class="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer">
              {{ 'BOOKINGS.CANCELLED' | translate }}
            </button>
          </div>
        </div>

        <!-- Main Grid Content -->
        <div class="grid grid-cols-12 gap-8">
          
          <!-- Left Column: Statistics & Calendar Sync -->
          <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            <!-- Stats Card -->
            <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8">
              <h3 class="text-xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-6 ltr:text-left rtl:text-right">
                {{ 'BOOKINGS.MONTH_STATS' | translate }}
              </h3>
              
              <div class="space-y-6">
                <!-- Total Requests -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div class="ltr:text-left rtl:text-right">
                      <p class="text-sm font-bold text-slate-900">{{ 'BOOKINGS.STATS.TOTAL_REQUESTS' | translate }}</p>
                    </div>
                  </div>
                  <span class="text-2xl font-black text-slate-900 tabular-nums">{{ totalRequestsCount() }}</span>
                </div>

                <!-- Pending Requests -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div class="ltr:text-left rtl:text-right">
                      <p class="text-sm font-bold text-slate-900">{{ 'BOOKINGS.STATS.PENDING_F' | translate }}</p>
                    </div>
                  </div>
                  <span class="text-2xl font-black text-amber-600 tabular-nums">{{ pendingRequestsCount() }}</span>
                </div>

                <!-- Confirmed Requests -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div class="ltr:text-left rtl:text-right">
                      <p class="text-sm font-bold text-slate-900">{{ 'BOOKINGS.STATS.CONFIRMED_F' | translate }}</p>
                    </div>
                  </div>
                  <span class="text-2xl font-black text-emerald-600 tabular-nums">{{ confirmedRequestsCount() }}</span>
                </div>

                <!-- Cancelled Requests -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div class="ltr:text-left rtl:text-right">
                      <p class="text-sm font-bold text-slate-900">{{ 'BOOKINGS.STATS.CANCELLED_REJECTED' | translate }}</p>
                    </div>
                  </div>
                  <span class="text-2xl font-black text-rose-600 tabular-nums">{{ cancelledRequestsCount() }}</span>
                </div>
              </div>
            </div>

            <!-- Calendar Sync Card -->
            <!-- <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8 flex flex-col items-center text-center">
              <div class="w-16 h-16 bg-[#076b70]/5 text-[#076b70] rounded-2xl flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              
              <h4 class="text-lg font-black text-slate-800 mb-2">مزامنة التقويم</h4>
              <p class="text-slate-400 font-bold text-xs md:text-sm max-w-xs leading-relaxed mb-6">
                تأكد من تحديث التوافر عبر جميع المنصات لتجنب الحجوزات المزدوجة.
              </p>
              
              <button (click)="syncCalendar()" 
                      [disabled]="syncing()"
                      class="w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black rounded-xl text-xs shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2">
                @if (syncing()) {
                  <div class="w-4 h-4 border-2 border-[#076b70]/30 border-t-[#076b70] rounded-full animate-spin"></div>
                  جاري المزامنة...
                } @else {
                  مزامنة الآن
                }
              </button>
            </div> -->
          </div>

          <!-- Right Column: Booking Requests List -->
          <div class="col-span-12 lg:col-span-8">
            @if (loading()) {
              <div class="flex justify-center py-32">
                <app-loading-spinner [message]="'BOOKINGS.LOADING' | translate" />
              </div>
            }
            @else if (filteredBookings().length === 0) {
              <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
                <app-empty-state 
                  [title]="(auth.isAgent() ? 'BOOKINGS.AGENT_EMPTY_TITLE' : 'BOOKINGS.EMPTY_TITLE') | translate" 
                  [message]="(auth.isAgent() ? 'BOOKINGS.AGENT_EMPTY_MSG' : 'BOOKINGS.EMPTY_MSG') | translate"
                  [actionText]="auth.isAgent() ? '' : ('BOOKINGS.BROWSE_BTN' | translate)"
                  [actionRoute]="auth.isAgent() ? '' : '/properties'">
                  <div icon class="w-12 h-12 text-[#076b70]">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </app-empty-state>
              </div>
            }
            @else {
              <div class="flex flex-col gap-6">
                @for (b of filteredBookings(); track b.id) {
                  <div [class]="b.status === 'Cancelled' ? 'bg-slate-50/40 border-slate-200/50 opacity-70' : 'bg-white border-slate-100'"
                       class="border rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-[0_10px_35px_rgba(7,107,112,0.06)] transition-all duration-300 group flex flex-col md:flex-row relative">
                    
                    <!-- Left-side content -->
                    <div class="p-6 md:p-8 flex-1 flex flex-col justify-between ltr:text-left rtl:text-right">
                      <div>
                        <!-- Badge and Title -->
                        <div class="flex items-center gap-3 mb-3">
                          <span [class]="b.status === 'Pending' ? 'bg-amber-50 text-amber-600' : b.status === 'Confirmed' || b.status === 'Completed' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-500'" 
                                class="px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase">
                            {{ translateStatus(b.status) | translate }}
                          </span>
                        </div>

                        <h2 [class]="b.status === 'Cancelled' ? 'text-slate-500 font-extrabold line-through' : 'text-slate-900 group-hover:text-[#076b70]'"
                            class="text-xl md:text-2xl font-black transition-colors leading-tight mb-3">
                          {{ b.propertyTitle }}
                        </h2>
                        
                        <p class="text-xs font-bold text-slate-400 mb-6 flex items-center gap-1.5 ltr:justify-start rtl:justify-end">
                          {{ 'BOOKINGS.REQUEST_FROM' | translate }} {{ auth.isAgent() ? (b.buyerName || ('BOOKINGS.DEFAULT_BUYER_NAME' | translate)) : ('BOOKINGS.RESPONSIBLE_AGENT' | translate) }}
                        </p>

                        <!-- Details grid -->
                        <div class="grid grid-cols-2 gap-6 py-4 border-t border-slate-100 mb-6">
                          <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'BOOKINGS.ARRIVAL_DATE' | translate }}</p>
                            <p class="text-sm font-black text-slate-900 tabular-nums">
                              {{ b.startDate | localizedDate:'yyyy/MM/dd' }}
                            </p>
                          </div>
                          <div>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ 'BOOKINGS.DURATION' | translate }}</p>
                            <p class="text-sm font-black text-slate-900 tabular-nums">
                              {{ getNightsCount(b) }} {{ 'BOOKINGS.NIGHTS_LABEL' | translate }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Actions footer -->
                      <div class="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-50 w-full">
                        @if (auth.isAgent() && b.status === 'Pending') {
                          <button (click)="confirmBooking(b)"
                                  class="flex-1 md:flex-none px-6 py-3 bg-[#076b70] hover:bg-[#055054] text-white rounded-xl text-xs font-black shadow-lg shadow-[#076b70]/15 hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                            </svg>
                            {{ 'BOOKINGS.ACCEPT_BTN' | translate }}
                          </button>
                          <button (click)="cancelBooking(b)"
                                  class="flex-1 md:flex-none px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl text-xs font-black transition-all duration-200 active:scale-[0.98] cursor-pointer">
                            {{ 'BOOKINGS.REJECT_BTN' | translate }}
                          </button>
                        }
                        @else if (b.status === 'Cancelled') {
                          @if (auth.isBuyer()) {
                            <a [routerLink]="['/bookings/new']" [queryParams]="{ propertyId: b.propertyId, oldBookingId: b.id }"
                               class="flex-1 md:flex-none px-6 py-3 bg-[#076b70] hover:bg-[#055054] text-white rounded-xl text-xs font-black shadow-lg shadow-[#076b70]/15 hover:shadow-xl transition-all duration-200 text-center active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H16m0 0V1"/>
                              </svg>
                              {{ 'BOOKINGS.RESCHEDULE' | translate }}
                            </a>
                          }
                          <a [routerLink]="['/bookings', b.id]"
                             class="flex-1 md:flex-none px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all duration-200 text-center active:scale-[0.98] cursor-pointer">
                            {{ 'BOOKINGS.REVIEW_CANCEL_DETAILS' | translate }}
                          </a>
                        }
                        @else {
                          <button (click)="messageUser(b)"
                                  class="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            {{ 'BOOKINGS.MESSAGE_AGENT' | translate }}
                          </button>

                          <a [routerLink]="['/bookings', b.id]"
                             class="flex-1 md:flex-none px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100 rounded-xl text-xs font-black transition-all duration-200 text-center active:scale-[0.98] cursor-pointer">
                            {{ 'BOOKINGS.DETAILS_BTN' | translate }}
                          </a>
                        }
                      </div>
                    </div>

                    <!-- Right-side image -->
                    <div class="w-full md:w-[260px] h-[220px] md:h-auto min-h-[220px] relative overflow-hidden shrink-0 bg-slate-50">
                      <img [src]="getImageUrl(b)" 
                           [alt]="b.propertyTitle" 
                           [class]="b.status === 'Cancelled' ? 'grayscale opacity-75' : 'group-hover:scale-102'"
                           class="w-full h-full object-cover transition-all duration-500" 
                           (error)="onImageError($event, b)">
                      @if (b.status === 'Pending') {
                        <span class="bg-[#076b70] text-white text-[10px] font-black tracking-wider uppercase px-4 py-1.5 rounded-bl-xl absolute top-0 right-0 z-10 shadow-sm">
                          {{ 'BOOKINGS.NEW_BADGE' | translate }}
                        </span>
                      }
                    </div>

                  </div>
                }
              </div>
              
              <!-- Pagination -->
              <div class="mt-12 flex justify-center">
                <app-pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="loadPage($event)" />
              </div>
            }
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class BookingListComponent implements OnInit {
  bookings = signal<BookingListItem[]>([]);
  loading = signal(true);
  page = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);
  statusFilter = signal<'All' | 'Pending' | 'Confirmed' | 'Upcoming' | 'Previous' | 'Cancelled'>('All');
  propertyImages = signal<Map<string, string>>(new Map());

  constructor(
    private bookingService: BookingService,
    public auth: AuthService,
    private toast: ToastService,
    private propertyService: PropertyService,
    private localImageService: LocalImageService,
    private router: Router,
    private conversationService: ConversationService,
    private translate: TranslateService
  ) {}

  totalRequestsCount() {
    return this.totalCount();
  }

  pendingRequestsCount() {
    return this.bookings().filter(b => b.status === 'Pending').length;
  }

  confirmedRequestsCount() {
    return this.bookings().filter(b => b.status === 'Confirmed' || b.status === 'Completed').length;
  }

  cancelledRequestsCount() {
    return this.bookings().filter(b => b.status === 'Cancelled').length;
  }

  getNightsCount(b: BookingListItem): number {
    if (!b.startDate || !b.endDate) return 7;
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 7;
  }

  syncing = signal(false);

  syncCalendar() {
    this.syncing.set(true);
    setTimeout(() => {
      this.syncing.set(false);
      this.toast.success(this.translate.instant('BOOKINGS.MESSAGES.SYNC_SUCCESS'));
    }, 1500);
  }

  messageUser(b: BookingListItem) {
    this.router.navigate(['/conversations']);
  }

  getImageUrl(b: BookingListItem): string {
    const cached = this.propertyImages().get(b.propertyId);
    if (cached) return cached;
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

      const uniqueIds = [...new Set(r.items.map(b => b.propertyId))];
      const imgMap = new Map<string, string>();
      const missingIds = uniqueIds.filter(pid => !this.localImageService.getThumbnail(pid));

      await Promise.allSettled(missingIds.map(async (pid) => {
        try {
          const prop = await this.propertyService.getById(pid);
          if (prop.images && prop.images.length > 0) {
            const primary = prop.images.find(i => i.isPrimary);
            const url = primary ? primary.url : prop.images[0].url;
            const finalUrl = getPropertyImageUrl(url, prop.title);
            imgMap.set(pid, finalUrl);
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
      if (filter === 'All') return true;
      if (filter === 'Pending') return b.status === 'Pending';
      if (filter === 'Confirmed') return b.status === 'Confirmed' || b.status === 'Completed';

      const endTime = new Date(b.endDate).getTime();
      if (filter === 'Upcoming') return b.status !== 'Cancelled' && endTime >= now;
      if (filter === 'Previous') return b.status !== 'Cancelled' && endTime < now;
      if (filter === 'Cancelled') return b.status === 'Cancelled';
      return true;
    });
  }

  setStatusFilter(status: 'All' | 'Pending' | 'Confirmed' | 'Upcoming' | 'Previous' | 'Cancelled') { 
    this.statusFilter.set(status); 
  }

  translateStatus(status: string): string {
    return `BOOKINGS.STATUSES.${status}`;
  }

  async confirmBooking(booking: BookingListItem) {
    try {
      await this.bookingService.updateStatus(booking.id, { status: BookingStatus.Confirmed });
      this.toast.success(this.translate.instant('BOOKINGS.MESSAGES.CONFIRM_SUCCESS'));
      await this.loadPage(this.page());
    } catch {
      this.toast.error(this.translate.instant('BOOKINGS.MESSAGES.CONFIRM_ERROR'));
    }
  }

  async cancelBooking(booking: BookingListItem) {
    try {
      await this.bookingService.updateStatus(booking.id, { status: BookingStatus.Cancelled });
      this.toast.success(this.translate.instant('BOOKINGS.MESSAGES.REJECT_SUCCESS'));
      await this.loadPage(this.page());
    } catch {
      this.toast.error(this.translate.instant('BOOKINGS.MESSAGES.REJECT_ERROR'));
    }
  }
}
