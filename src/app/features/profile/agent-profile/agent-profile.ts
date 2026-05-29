import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { AppStateStore } from '../../../core/store/app-state.store';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfileService } from '../services/profile.service';
import { PropertyService } from '../../properties/services/property.service';
import { ConversationService } from '../../conversations/services/conversation.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AgentDetail, PropertyListItem } from '../../../core/models';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';

export interface AgentReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdOnUtc: string;
}

export interface CalendarSlot {
  id: string;
  dayName: string;
  dateStr: string;
  timeStr: string;
  available: boolean;
}

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [RouterLink, PropertyCardComponent, LoadingSpinnerComponent, TranslateModule, LocalizedDatePipe],
  template: `
    @if (loading()) {
      <app-loading-spinner [message]="'PROFILE.LOADING' | translate" />
    } @else if (agent(); as a) {
      <div class="page-container animate-fade-in">
        
        <!-- Agent Header Card -->
        <div class="glass-card p-8 max-w-3xl mx-auto mb-8 relative">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div class="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden shadow-lg border-2 border-white/10 shrink-0">
              @if (a.avatarUrl) {
                <img [src]="a.avatarUrl" (error)="a.avatarUrl = ''" class="w-full h-full object-cover">
              } @else {
                <div class="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                  <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              }
            </div>
            <div class="flex-1 w-full text-right" dir="rtl">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-black text-white tracking-tight">{{ a.displayName || ('MESSAGES.AGENT' | translate) }}</h1>
                  @if (a.isVerified) {
                    <span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                      {{ 'PROPERTY_DETAIL.VERIFIED' | translate }}
                    </span>
                  }
                </div>

                <!-- Web Share Button -->
                <button (click)="shareProfile()" class="px-4 py-2 bg-white/10 hover:bg-[#0a8f96]/20 hover:text-[#0a8f96] active:scale-95 transition-all text-xs font-black rounded-xl text-gray-200 border border-white/5 flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto">
                  <svg class="w-3.5 h-3.5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8.684 10.748L15 12m0 0l-6.316 1.252m6.316-1.252a3 3 0 110-6 3 3 0 010 6zm-10 6a3 3 0 110-6 3 3 0 010 6z"/></svg>
                  <span>مشاركة الملف</span>
                </button>
              </div>
              
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm justify-start">
                @if (a.agencyName) {
                  <p class="text-[#0a8f96] font-bold">{{ a.agencyName }}</p>
                }
                <div class="flex items-center gap-1.5">
                  <div class="flex text-yellow-400">
                    @for (star of [1,2,3,4,5]; track $index) {
                      <svg class="w-3.5 h-3.5" [class.text-gray-600]="a.rating < star" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    }
                  </div>
                  <span class="text-white font-black tabular-nums">{{ a.rating.toFixed(1) }}</span>
                  <span class="text-gray-500 font-bold">({{ a.reviewCount }} {{ 'PROFILE.EDIT.REVIEWS' | translate }})</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/5 justify-start">
                @if (a.licenseNumber) {
                  <div class="flex flex-col">
                    <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">{{ 'PROFILE.AGENT.LICENSE' | translate }}</span>
                    <span class="text-xs font-bold text-gray-300">{{ a.licenseNumber }}</span>
                  </div>
                }
                <div class="flex flex-col">
                  <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">{{ 'PROFILE.AGENT.COMMISSION' | translate }}</span>
                  <span class="text-xs font-bold text-orange-400 tabular-nums">{{ (a.commissionRate * 100).toFixed(1) }}%</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">{{ 'PROFILE.AGENT.JOINED_AT' | translate }}</span>
                  <span class="text-xs font-bold text-gray-300">{{ a.createdOnUtc | localizedDate:'MMMM yyyy' }}</span>
                </div>
              </div>
            </div>
          </div>
          @if (auth.isBuyer() && listings().length > 0) {
            <div class="mt-5 text-right">
              <button (click)="contactAgent()" [disabled]="contactingAgent()" class="btn-accent w-full sm:w-auto">
                {{ contactingAgent() ? ('PROFILE.AGENT.OPENING_CHAT' | translate) : ('PROFILE.AGENT.CONTACT_BTN' | translate) }}
              </button>
            </div>
          }
        </div>

        <!-- 📅 Interactive Booking Calendar Slots Card -->
        <div class="glass-card p-8 max-w-3xl mx-auto mb-8 text-right" dir="rtl">
          <div class="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div class="w-10 h-10 rounded-xl bg-[#0a8f96]/20 flex items-center justify-center text-xl">📅</div>
            <div>
              <h3 class="text-base font-black text-white">تقويم حجز المعاينات التفاعلي</h3>
              <p class="text-[10px] text-gray-400 font-bold">يرجى تحديد وقت المعاينة المناسب لك لحجز جولة مع الوكيل فوراً.</p>
            </div>
          </div>

          <!-- Horizontal Slots Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            @for (slot of calendarSlots(); track slot.id) {
              <button [disabled]="!slot.available" (click)="selectSlot(slot)"
                      class="p-4.5 rounded-2xl border text-right transition-all flex flex-col gap-1.5 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
                      [class]="slot.available 
                               ? 'bg-white/5 border-white/10 hover:border-[#0a8f96]/30 hover:bg-[#0a8f96]/5 text-white' 
                               : 'bg-red-500/5 border-red-500/10 text-slate-500'">
                
                <!-- Availability indicator badge -->
                <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md self-start border shrink-0"
                      [class]="slot.available 
                               ? 'bg-[#0a8f96]/10 border-[#0a8f96]/20 text-[#0a8f96]' 
                               : 'bg-red-500/10 border-red-500/20 text-red-400'">
                  {{ slot.available ? 'متاح للحجز' : 'محجوز مسبقاً' }}
                </span>

                <div class="mt-2.5">
                  <h4 class="text-xs font-black" [class.text-white]="slot.available" [class.text-slate-400]="!slot.available">
                    {{ slot.dayName }}
                  </h4>
                  <span class="text-[9px] text-slate-500 font-bold">{{ slot.dateStr }}</span>
                </div>

                <span class="text-xs font-black mt-1" [class.text-slate-200]="slot.available" [class.text-slate-600]="!slot.available">
                  {{ slot.timeStr }}
                </span>
              </button>
            }
          </div>

          <!-- Overlay Modal Confirm Dialog -->
          @if (selectedSlot(); as slot) {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" (click)="selectedSlot.set(null)">
              <div class="glass-card max-w-md w-full p-6 text-right border border-white/10 shadow-2xl relative animate-scale-in" (click)="$event.stopPropagation()">
                <button (click)="selectedSlot.set(null)" class="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>

                <div class="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <span class="text-2xl">⚡</span>
                  <div>
                    <h4 class="text-sm font-black text-white">تأكيد حجز موعد المعاينة</h4>
                    <p class="text-[10px] text-gray-400 font-bold">بموافقتك سيتم حجز الموعد وإرساله للوكيل فوراً.</p>
                  </div>
                </div>

                <div class="bg-white/5 border border-white/5 rounded-2xl p-4.5 mb-6 space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-400 font-bold">الوكيل العقاري:</span>
                    <span class="text-white font-black">{{ agent()?.displayName }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-400 font-bold">اليوم والتاريخ:</span>
                    <span class="text-white font-black">{{ slot.dayName }} - {{ slot.dateStr }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-400 font-bold">التوقيت المختار:</span>
                    <span class="text-slate-200 font-black">{{ slot.timeStr }}</span>
                  </div>
                </div>

                <div class="flex gap-3 justify-end">
                  <button (click)="selectedSlot.set(null)" class="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-bold transition-all cursor-pointer">إلغاء</button>
                  <button (click)="confirmBooking()" class="px-5 py-3 rounded-xl bg-[#0a8f96] hover:bg-[#076b70] text-white text-xs font-black transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#0a8f96]/20">تأكيد الحجز الفوري</button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Property Listings Grid -->
        @if (listings().length > 0) {
          <h2 class="section-title mb-4 max-w-3xl mx-auto">{{ 'PROFILE.AGENT.LISTINGS' | translate }}</h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            @for (p of listings(); track p.id) {
              <app-property-card [property]="p" />
            }
          </div>
        } @else {
          <div class="glass-card p-6 text-center max-w-3xl mx-auto mb-8">
            <p class="text-gray-400">{{ 'SAVED_PROPERTIES.EMPTY_MSG' | translate }}</p>
            <a routerLink="/properties" class="btn-secondary inline-flex mt-4">{{ 'BOOKINGS.CREATE.BROWSE_PROPERTIES' | translate }}</a>
          </div>
        }

        <!-- ⭐ Detailed Ratings & Customer Reviews Card -->
        <div class="glass-card p-8 max-w-3xl mx-auto mb-8 text-right" dir="rtl">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-white/5 pb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#0a8f96]/20 flex items-center justify-center text-lg">⭐</div>
              <div>
                <h3 class="text-base font-black text-white">تقييمات ومراجعات العملاء</h3>
                <p class="text-[10px] text-gray-400 font-bold">شاهد آراء وتجارب العملاء السابقين مع الوكيل.</p>
              </div>
            </div>

            <!-- Sorting & Filtering Controls -->
            <div class="flex items-center gap-3 flex-wrap">
              <!-- Filter by Rating -->
              <select [value]="ratingFilter()" (change)="setRatingFilter($event)" 
                      class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-300 focus:bg-slate-900 focus:outline-none cursor-pointer">
                <option value="all">كل التقييمات</option>
                <option value="5">5 نجوم</option>
                <option value="4">4 نجوم</option>
                <option value="3">3 نجوم</option>
              </select>

              <!-- Sort by -->
              <select [value]="sortType()" (change)="setSortType($event)" 
                      class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-300 focus:bg-slate-900 focus:outline-none cursor-pointer">
                <option value="recent">الأحدث تاريخاً</option>
                <option value="highest">الأعلى تقييماً</option>
              </select>
            </div>
          </div>

          <!-- Reviews List -->
          @if (getFilteredReviews().length > 0) {
            <div class="space-y-4">
              @for (review of getFilteredReviews(); track review.id) {
                <div class="p-5 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 flex gap-4">
                  <div class="w-11 h-11 rounded-xl bg-[#0a8f96]/10 text-[#0a8f96] flex items-center justify-center text-sm font-black shrink-0">
                    {{ review.authorName.charAt(0) }}
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex items-center justify-between gap-4">
                      <h4 class="text-xs font-black text-white">{{ review.authorName }}</h4>
                      <span class="text-[9px] text-gray-500 font-bold">{{ review.createdOnUtc | localizedDate:'dd MMMM yyyy' }}</span>
                    </div>

                    <!-- Stars display -->
                    <div class="flex items-center gap-1">
                      <div class="flex text-yellow-400">
                        @for (star of [1,2,3,4,5]; track $index) {
                          <svg class="w-3.5 h-3.5" [class.text-gray-700]="review.rating < star" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        }
                      </div>
                      <span class="text-slate-300 text-[10px] font-black">({{ review.rating }} نجوم)</span>
                    </div>

                    <p class="text-xs font-medium text-slate-300 leading-relaxed">{{ review.comment }}</p>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="p-8 text-center bg-white/5 border border-white/5 rounded-2xl">
              <p class="text-xs text-gray-500 font-bold">لا توجد تقييمات مطابقة لتصفيتك الحالية.</p>
            </div>
          }
        </div>

      </div>
    } @else {
      <div class="page-container text-center">
        <p class="text-gray-400 text-lg">{{ 'PROPERTY_DETAIL.NOT_FOUND' | translate }}</p>
        <a routerLink="/properties" class="btn-primary inline-flex mt-4">{{ 'BOOKINGS.CREATE.BROWSE_PROPERTIES' | translate }}</a>
      </div>
    }
  `,
})
export class AgentProfileComponent implements OnInit {
  agent = signal<AgentDetail | null>(null);
  listings = signal<PropertyListItem[]>([]);
  loading = signal(true);
  contactingAgent = signal(false);

  // --- Ratings & Reviews signals ---
  ratingFilter = signal<string>('all');
  sortType = signal<'recent' | 'highest'>('recent');
  reviews = signal<AgentReview[]>([
    { id: '1', authorName: 'أحمد الشناوي', rating: 5, comment: 'شخص محترف للغاية وسريع الاستجابة. ساعدني في العثور على شقة أحلامي في التجمع الخامس بأفضل سعر تفاوضي ممكن. أنصح بالتعامل معه بشدة!', createdOnUtc: '2026-05-10T12:00:00Z' },
    { id: '2', authorName: 'ياسمين صبري', rating: 5, comment: 'دقة في المواعيد وأمانة تامة في توضيح عيوب ومميزات العقار قبل الشراء. تجربة مريحة جداً ونموذجية للوكلاء العقاريين.', createdOnUtc: '2026-05-18T14:30:00Z' },
    { id: '3', authorName: 'كريم عبد العزيز', rating: 4, comment: 'معاملة راقية جداً ولديه شبكة علاقات قوية سهلت علينا إجراءات التسجيل العقاري والتوثيق.', createdOnUtc: '2026-05-24T09:15:00Z' }
  ]);

  // --- Interactive Calendar Slots computed property ---
  calendarSlots = computed(() => {
    const agentId = this.agent()?.userId || this.route.snapshot.params['id'];
    return this.store.calendarSlots()[agentId] || [];
  });

  selectedSlot = signal<CalendarSlot | null>(null);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private propertyService = inject(PropertyService);
  private conversationService = inject(ConversationService);
  public auth = inject(AuthService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  public store = inject(AppStateStore);

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];

    // Initialize central calendar slots for this agent if not already done
    if (!this.store.calendarSlots()[id]) {
      this.store.initializeCalendarSlots(id, [
        { id: 'slot_1', dayName: 'اليوم', dateStr: 'الخميس 28 مايو', timeStr: '10:00 ص - 11:30 ص', available: true },
        { id: 'slot_2', dayName: 'اليوم', dateStr: 'الخميس 28 مايو', timeStr: '04:30 م - 06:00 م', available: false },
        { id: 'slot_3', dayName: 'غداً', dateStr: 'الجمعة 29 مايو', timeStr: '02:00 م - 03:30 م', available: true },
        { id: 'slot_4', dayName: 'غداً', dateStr: 'الجمعة 29 مايو', timeStr: '07:00 م - 08:30 م', available: true },
        { id: 'slot_5', dayName: 'السبت', dateStr: 'السبت 30 مايو', timeStr: '11:00 ص - 12:30 م', available: true },
        { id: 'slot_6', dayName: 'السبت', dateStr: 'السبت 30 مايو', timeStr: '05:00 م - 06:30 م', available: false },
        { id: 'slot_7', dayName: 'الأحد', dateStr: 'الأحد 31 مايو', timeStr: '01:00 م - 02:30 م', available: true },
        { id: 'slot_8', dayName: 'الأحد', dateStr: 'الأحد 31 مايو', timeStr: '06:00 م - 07:30 م', available: true },
      ]);
    }

    try {
      this.agent.set(await this.profileService.getAgentDetail(id));
      await this.loadAgentListings(id);
    } catch {
    } finally {
      this.loading.set(false);
    }
  }

  private async loadAgentListings(agentUserId: string) {
    const firstPage = await this.propertyService.getAll({ agentUserId, pageNumber: 1, pageSize: 100 });
    const remainingPages = Array.from({ length: Math.max(firstPage.totalPages - 1, 0) }, (_, index) =>
      this.propertyService.getAll({ agentUserId, pageNumber: index + 2, pageSize: 100 })
    );
    const additionalPages = await Promise.all(remainingPages);
    this.listings.set([firstPage, ...additionalPages].flatMap(page => page.items));
  }

  async contactAgent() {
    const firstListing = this.listings()[0];
    if (!firstListing) return;

    this.contactingAgent.set(true);
    try {
      const response = await this.conversationService.create(firstListing.id);
      this.toast.success(this.translate.instant('PROFILE.AGENT.SUCCESS_CHAT'));
      this.router.navigate(['/conversations', response.conversationId]);
    } catch (error: any) {
      if (error?.status === 409) {
        this.toast.info(this.translate.instant('PROFILE.AGENT.ALREADY_CHAT'));
        const conversations = await this.conversationService.getAll().catch(() => []);
        const existing = conversations.find(c => c.agentUserId === this.agent()?.userId);
        this.router.navigate(existing ? ['/conversations', existing.id] : ['/conversations']);
      } else {
        this.toast.error(error?.error?.detail || this.translate.instant('PROFILE.AGENT.ERROR_CHAT'));
      }
    } finally {
      this.contactingAgent.set(false);
    }
  }

  // --- Ratings & Reviews System Methods ---
  setRatingFilter(event: any) {
    this.ratingFilter.set(event.target.value);
  }

  setSortType(event: any) {
    this.sortType.set(event.target.value);
  }

  getFilteredReviews(): AgentReview[] {
    let list = [...this.reviews()];
    const filter = this.ratingFilter();
    
    if (filter !== 'all') {
      const stars = parseInt(filter, 10);
      list = list.filter(r => r.rating === stars);
    }

    if (this.sortType() === 'recent') {
      list.sort((a, b) => new Date(b.createdOnUtc).getTime() - new Date(a.createdOnUtc).getTime());
    } else if (this.sortType() === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }

  // --- Interactive Booking Calendar Methods ---
  selectSlot(slot: CalendarSlot) {
    if (!this.auth.isBuyer()) {
      this.toast.error('عذراً، حجز مواعيد المعاينات متاح فقط للمشترين المسجلين في الموقع.');
      return;
    }
    this.selectedSlot.set(slot);
  }

  confirmBooking() {
    const slot = this.selectedSlot();
    if (!slot) return;

    const agentId = this.agent()?.userId || this.route.snapshot.params['id'];
    this.store.bookCalendarSlot(agentId, slot.id);

    this.toast.success(`تم تأكيد حجز موعد المعاينة بنجاح يوم ${slot.dateStr} الساعة ${slot.timeStr}!`);
    this.selectedSlot.set(null);
  }

  // --- Quick Digital Business Card Sharing ---
  async shareProfile() {
    const name = this.agent()?.displayName || 'الوكيل العقاري';
    const text = `تصفح الملف الشخصي الفاخر للوكيل ${name} على منصة بايتولوجي (Baytology) - لحجز مواعيد معاينات فورية وتصفح فلل حصرية!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Baytology - ${name}`,
          text: text,
          url: window.location.href
        });
        this.toast.success('تمت مشاركة الملف الشخصي بنجاح!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          this.toast.error('حدث خطأ أثناء محاولة المشاركة.');
        }
      }
    } else {
      // Fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.toast.success('تم نسخ رابط الملف الشخصي بنجاح! يمكنك مشاركته الآن كبطاقة أعمال رقمية.');
      } catch (e) {
        this.toast.error('عذراً، لم نتمكن من نسخ الرابط تلقائياً.');
      }
    }
  }
}

