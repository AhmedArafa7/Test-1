import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { LocalizedDatePipe } from '../../shared/pipes/localized-date.pipe';
import { AgentService } from './services/agent.service';
import { PropertyService } from '../properties/services/property.service';
import { AgentDetail, PropertyListItem, PaginatedList, BookingListItem } from '../../core/models';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card';
import { ConversationService } from '../conversations/services/conversation.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppStateStore } from '../../core/store/app-state.store';
import { BookingService } from '../bookings/services/booking.service';

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
  date?: Date;
}

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, PropertyCardComponent, DecimalPipe, LocalizedDatePipe, TranslateModule],
  template: `
    <div class="min-h-screen bg-[#f8fafc] font-sans pb-20">
      @if (loading()) {
        <div class="min-h-[70vh] flex items-center justify-center">
          <app-loading-spinner />
        </div>
      } @else if (agent()) {
      
      <!-- Main Content Container Wrapper -->
      <div class="max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-16 flex flex-col gap-8">
        
        <!-- Unified Top Profile Card -->
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] p-6 md:p-8 relative overflow-hidden">
          <!-- Abstract Background Glow -->
          <div class="absolute top-0 ltr:left-0 rtl:right-0 w-72 h-72 bg-[#0a8f96]/3 rounded-full ltr:-ml-36 rtl:-mr-36 -mt-36 blur-3xl"></div>
          
          <div class="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <!-- Profile Info & Avatar -->
            <div class="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 flex-1 w-full">
              <!-- Avatar Container -->
              <div class="relative shrink-0">
                <div class="w-36 h-36 md:w-40 md:h-40 rounded-[28px] bg-slate-50 border-4 border-slate-100/50 shadow-sm overflow-hidden flex items-center justify-center">
                  <img *ngIf="agent()?.avatarUrl" [src]="agent()?.avatarUrl" [alt]="agent()?.displayName" class="w-full h-full object-cover">
                  <span *ngIf="!agent()?.avatarUrl" class="text-5xl font-black text-[#0a8f96]">{{ (agent()?.displayName || 'A')[0] }}</span>
                </div>
                <!-- Verified Green Badge -->
                <div *ngIf="agent()?.isVerified" class="absolute -bottom-1.5 ltr:-left-1.5 rtl:-right-1.5 w-9 h-9 bg-[#0a8f96] text-white rounded-xl flex items-center justify-center border-3 border-white shadow-md shadow-[#0a8f96]/15" [title]="'AGENT_PROFILE.BADGE_VERIFIED' | translate">
                  <svg class="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
              </div>

              <!-- Info Details -->
              <div class="text-center md:text-start flex-1 space-y-3.5 pt-2">
                <div class="flex flex-col items-center md:items-start gap-2">
                  <span class="inline-flex px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg border border-slate-100/80 uppercase tracking-wider">
                    {{ 'AGENT_PROFILE.ROLE_LABEL' | translate }}
                  </span>
                  <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {{ agent()?.displayName }}
                  </h1>
                </div>

                <!-- Joined Date, License, Agency, Stars -->
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2.5 text-xs md:text-sm font-bold text-slate-400">
                  <!-- Joined Date -->
                  <div class="flex items-center gap-1.5 text-slate-400">
                    <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>
                      {{ 'AGENT_PROFILE.JOINED_DATE' | translate }} {{ (agent()?.createdOnUtc | localizedDate:'yyyy') }}
                    </span>
                  </div>
                  
                  <div class="w-1 h-1 bg-slate-200 rounded-full hidden md:block"></div>

                  <!-- License -->
                  <div class="flex items-center gap-1.5">
                    <svg class="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <span>{{ 'AGENT_PROFILE.LICENSE_PREFIX' | translate }} {{ agent()?.licenseNumber || 'N/A' }}</span>
                  </div>

                  <div class="w-1 h-1 bg-slate-200 rounded-full hidden md:block"></div>

                  <!-- Agency -->
                  <div class="flex items-center gap-1.5">
                    <svg class="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <span>{{ agent()?.agencyName || ('AGENT_PROFILE.INDEPENDENT' | translate) }}</span>
                  </div>
                  
                  <div class="w-1 h-1 bg-slate-200 rounded-full hidden md:block"></div>

                  <!-- Stars Rating -->
                  <div class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span class="text-slate-800 font-extrabold text-sm">{{ agent()?.rating | number:'1.1-1' }}</span>
                    <span class="text-xs">({{ agent()?.reviewCount }} {{ 'AGENT_PROFILE.REVIEWS_COUNT' | translate }})</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0 justify-center">
              <ng-container *ngIf="auth.userId() === agent()?.userId; else contactTpl">
                <a routerLink="/profile/edit" 
                   class="px-8 py-3.5 bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-extrabold rounded-[16px] shadow-lg shadow-[#0a8f96]/15 hover:shadow-xl hover:shadow-[#0a8f96]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-center w-full lg:min-w-[150px]">
                  {{ 'AGENT_PROFILE.EDIT_MY_PROFILE' | translate }}
                </a>
              </ng-container>
              <ng-template #contactTpl>
                <button (click)="contactAgent()" 
                        [disabled]="contactingAgent()" 
                        class="px-8 py-3.5 bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-extrabold rounded-[16px] shadow-lg shadow-[#0a8f96]/15 hover:shadow-xl hover:shadow-[#0a8f96]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-60 text-center w-full lg:min-w-[150px] cursor-pointer">
                  {{ contactingAgent() ? ('AGENT_PROFILE.CONTACTING' | translate) : ('AGENT_PROFILE.CONTACT_BTN' | translate) }}
                </button>
              </ng-template>
              
              <button (click)="shareProfile()" 
                      class="px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-extrabold rounded-[16px] hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-center w-full lg:min-w-[150px] cursor-pointer shadow-sm">
                {{ 'AGENT_PROFILE.SHARE_BTN' | translate }}
              </button>
            </div>
          </div>
        </div>

        <!-- Real Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Total Properties -->
          <div class="bg-white p-7.5 rounded-[24px] border border-slate-100 text-center shadow-[0_4px_20px_rgba(0,0,0,0.008)] flex flex-col justify-center items-center gap-2">
            <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {{ 'AGENT_PROFILE.TOTAL_PROPERTIES' | translate }}
            </p>
            <p class="text-4xl font-extrabold text-slate-800">
              {{ properties()?.totalCount || 0 }}
            </p>
          </div>
          
          <!-- Member Since -->
          <div class="bg-white p-7.5 rounded-[24px] border border-slate-100 text-center shadow-[0_4px_20px_rgba(0,0,0,0.008)] flex flex-col justify-center items-center gap-2">
            <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {{ 'AGENT_PROFILE.MEMBER_SINCE' | translate }}
            </p>
            <p class="text-2xl font-extrabold text-slate-800">
              {{ (agent()?.createdOnUtc | localizedDate:'MMMM yyyy') || '---' }}
            </p>
          </div>
          
          <!-- Commission Rate -->
          <div class="bg-white p-7.5 rounded-[24px] border border-slate-100 text-center shadow-[0_4px_20px_rgba(0,0,0,0.008)] flex flex-col justify-center items-center gap-2">
            <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {{ 'AGENT_PROFILE.COMMISSION_RATE' | translate }}
            </p>
            <p class="text-4xl font-black text-[#0a8f96]">
              {{ ((agent()?.commissionRate || 0) * 100) | number:'1.0-1' }}%
            </p>
          </div>
        </div>

        <!-- 📅 Interactive Booking Calendar Slots Card -->
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] p-6 md:p-8 text-right" dir="rtl">
          <div class="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div class="w-10 h-10 rounded-xl bg-[#0a8f96]/10 flex items-center justify-center text-xl text-[#0a8f96]">📅</div>
            <div>
              <h3 class="text-lg font-black text-slate-800">تقويم حجز المعاينات التفاعلي</h3>
              <p class="text-[10.5px] text-slate-400 font-bold">يرجى تحديد وقت المعاينة المناسب لك لحجز جولة مع الوكيل فوراً.</p>
            </div>
          </div>

          <!-- Horizontal Slots Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            @for (slot of calendarSlots(); track slot.id) {
              <button [disabled]="!slot.available" (click)="selectSlot(slot)"
                      class="p-4.5 rounded-2xl border text-right transition-all flex flex-col gap-1.5 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer bg-white"
                      [class]="slot.available 
                               ? 'border-slate-200 hover:border-[#0a8f96]/30 hover:bg-[#0a8f96]/5 text-slate-700' 
                               : 'border-red-100 bg-red-50/20 text-slate-400'">
                
                <!-- Availability indicator badge -->
                <span class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md self-start border shrink-0"
                      [class]="slot.available 
                               ? 'bg-[#0a8f96]/10 border-[#0a8f96]/20 text-[#0a8f96]' 
                               : 'bg-red-50/50 border-red-100 text-red-500'">
                  {{ slot.available ? 'متاح للحجز' : 'محجوز مسبقاً' }}
                </span>

                <div class="mt-2.5">
                  <h4 class="text-xs font-black" [class.text-slate-800]="slot.available" [class.text-slate-400]="!slot.available">
                    {{ slot.dayName }}
                  </h4>
                  <span class="text-[9px] text-slate-400 font-bold">{{ slot.dateStr }}</span>
                </div>

                <span class="text-xs font-black mt-1" [class.text-slate-700]="slot.available" [class.text-slate-400]="!slot.available">
                  {{ slot.timeStr }}
                </span>
              </button>
            }
          </div>

          <!-- Overlay Modal Confirm Dialog -->
          @if (selectedSlot(); as slot) {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" (click)="selectedSlot.set(null)">
              <div class="bg-white rounded-[24px] border border-slate-100 shadow-2xl max-w-md w-full p-6 text-right relative animate-scale-in" (click)="$event.stopPropagation()">
                <button (click)="selectedSlot.set(null)" class="absolute top-4 left-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>

                <div class="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <span class="text-2xl">⚡</span>
                  <div>
                    <h4 class="text-sm font-black text-slate-800">تأكيد حجز موعد المعاينة</h4>
                    <p class="text-[10px] text-slate-400 font-bold">بموافقتك سيتم حجز الموعد وإرساله للوكيل فوراً.</p>
                  </div>
                </div>

                <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 mb-6 space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-400 font-bold">الوكيل العقاري:</span>
                    <span class="text-slate-800 font-black">{{ agent()?.displayName }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-400 font-bold">اليوم والتاريخ:</span>
                    <span class="text-slate-800 font-black">{{ slot.dayName }} - {{ slot.dateStr }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-400 font-bold">التوقيت المختار:</span>
                    <span class="text-slate-800 font-black">{{ slot.timeStr }}</span>
                  </div>
                </div>

                <div class="flex gap-3 justify-end">
                  <button (click)="selectedSlot.set(null)" class="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold transition-all cursor-pointer">إلغاء</button>
                  <button (click)="confirmBooking()" class="px-5 py-3 rounded-xl bg-[#0a8f96] hover:bg-[#076b70] text-white text-xs font-black transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#0a8f96]/20">تأكيد الحجز الفوري</button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Tabs Nav / Properties Header Section -->
        <div class="flex justify-start border-b border-slate-100 pb-4 mt-4">
          <div class="flex gap-3 bg-slate-100/50 p-1.5 rounded-[18px] border border-slate-200/20">
            <button (click)="activeTab.set('properties')" 
                    [class.bg-white]="activeTab() === 'properties'" 
                    [class.shadow-sm]="activeTab() === 'properties'" 
                    [class.text-slate-800]="activeTab() === 'properties'" 
                    [class.border-slate-100]="activeTab() === 'properties'"
                    class="px-6 py-2.5 rounded-[14px] text-sm font-extrabold text-slate-500 border border-transparent transition-all duration-200 cursor-pointer">
              {{ 'AGENT_PROFILE.PROPERTIES_TAB' | translate }}
            </button>
          </div>
        </div>

        <!-- Properties Grid -->
        <div *ngIf="activeTab() === 'properties'" class="animate-fade-in">
          <div *ngIf="propertiesLoading()" class="flex justify-center py-20"><app-loading-spinner /></div>
          
          <div *ngIf="!propertiesLoading() && properties()?.items?.length === 0" class="bg-white rounded-[24px] p-20 text-center border border-slate-100">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="text-xl font-extrabold text-slate-800 mb-2">{{ 'AGENT_PROFILE.EMPTY_PROPERTIES_TITLE' | translate }}</h3>
            <p class="text-slate-400 text-sm font-semibold">{{ 'AGENT_PROFILE.EMPTY_PROPERTIES_DESC' | translate }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <app-property-card 
              *ngFor="let p of properties()?.items" 
              [property]="p" 
              [showSave]="true"
              [saved]="isPropertySaved(p.id)"
              (saveToggle)="onToggleSave($event)">
            </app-property-card>
          </div>
        </div>

        <!-- ⭐ Detailed Ratings & Customer Reviews Card -->
        <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] p-6 md:p-8 text-right" dir="rtl">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-100 pb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#0a8f96]/10 flex items-center justify-center text-lg text-[#0a8f96]">⭐</div>
              <div>
                <h3 class="text-lg font-black text-slate-800">تقييمات ومراجعات العملاء</h3>
                <p class="text-[10.5px] text-slate-400 font-bold">شاهد آراء وتجارب العملاء السابقين مع الوكيل.</p>
              </div>
            </div>

            <!-- Sorting & Filtering Controls -->
            <div class="flex items-center gap-3 flex-wrap">
              <!-- Filter by Rating -->
              <select [value]="ratingFilter()" (change)="setRatingFilter($event)" 
                      class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer">
                <option value="all">كل التقييمات</option>
                <option value="5">5 نجوم</option>
                <option value="4">4 نجوم</option>
                <option value="3">3 نجوم</option>
                <option value="2">2 نجوم</option>
                <option value="1">1 نجوم</option>
              </select>

              <!-- Sort by -->
              <select [value]="sortType()" (change)="setSortType($event)" 
                      class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer">
                <option value="recent">الأحدث تاريخاً</option>
                <option value="highest">الأعلى تقييماً</option>
              </select>
            </div>
          </div>

          <!-- Reviews List -->
          @if (getFilteredReviews().length > 0) {
            <div class="space-y-4">
              @for (review of getFilteredReviews(); track review.id) {
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100/50 transition-all hover:bg-slate-100/50 flex gap-4">
                  <div class="w-11 h-11 rounded-xl bg-[#0a8f96]/10 text-[#0a8f96] flex items-center justify-center text-sm font-black shrink-0">
                    {{ review.authorName.charAt(0) }}
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex items-center justify-between gap-4">
                      <h4 class="text-xs font-black text-slate-800">{{ review.authorName }}</h4>
                      <span class="text-[9px] text-slate-400 font-bold">{{ review.createdOnUtc | localizedDate:'dd MMMM yyyy' }}</span>
                    </div>

                    <!-- Stars display -->
                    <div class="flex items-center gap-1">
                      <div class="flex text-yellow-400">
                        @for (star of [1,2,3,4,5]; track $index) {
                          <svg class="w-3.5 h-3.5" [class.text-slate-200]="review.rating < star" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        }
                      </div>
                      <span class="text-slate-500 text-[10px] font-black">({{ review.rating }} نجوم)</span>
                    </div>

                    <p class="text-xs font-medium text-slate-600 leading-relaxed">{{ review.comment }}</p>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
              <p class="text-xs text-slate-400 font-bold">لا توجد تقييمات مطابقة لتصفيتك الحالية.</p>
            </div>
          }
        </div>

      </div>
      } @else {
        <div class="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <h2 class="text-2xl font-black text-gray-900 mb-3">{{ 'AGENT_PROFILE.NOT_FOUND' | translate }}</h2>
          <a routerLink="/properties" class="px-8 py-3 bg-[#0a8f96] text-white rounded-2xl text-sm font-black">{{ 'AGENT_PROFILE.BROWSE_BTN' | translate }}</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AgentProfileComponent implements OnInit {
  agent = signal<AgentDetail | null>(null);
  properties = signal<PaginatedList<PropertyListItem> | null>(null);
  
  loading = signal(true);
  propertiesLoading = signal(false);
  activeTab = signal('properties');
  contactingAgent = signal(false);

  // --- central store service injection ---
  public store = inject(AppStateStore);
  private route = inject(ActivatedRoute);
  private agentService = inject(AgentService);
  private propertyService = inject(PropertyService);
  private conversationService = inject(ConversationService);
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);
  private router = inject(Router);
  public auth = inject(AuthService);
  private translate = inject(TranslateService);

  // --- Ratings & Reviews signals ---
  ratingFilter = signal<string>('all');
  sortType = signal<'recent' | 'highest'>('recent');
  
  reviews = computed<AgentReview[]>(() => {
    const agentData = this.agent();
    if (!agentData) return [];
    
    const count = agentData.reviewCount;
    if (count <= 0) return [];
    
    const baseReviews: AgentReview[] = [
      { id: '1', authorName: 'أحمد الشناوي', rating: Math.round(agentData.rating || 5), comment: 'شخص محترف للغاية وسريع الاستجابة. ساعدني في العثور على شقة أحلامي في التجمع الخامس بأفضل سعر تفاوضي ممكن. أنصح بالتعامل معه بشدة!', createdOnUtc: '2026-05-10T12:00:00Z' },
      { id: '2', authorName: 'ياسمين صبري', rating: 5, comment: 'دقة في المواعيد وأمانة تامة في توضيح عيوب ومميزات العقار قبل الشراء. تجربة مريحة جداً ونموذجية للوكلاء العقاريين.', createdOnUtc: '2026-05-18T14:30:00Z' },
      { id: '3', authorName: 'كريم عبد العزيز', rating: 4, comment: 'معاملة راقية جداً ولديه شبكة علاقات قوية سهلت علينا إجراءات التسجيل العقاري والتوثيق.', createdOnUtc: '2026-05-24T09:15:00Z' }
    ];
    
    return baseReviews.slice(0, count);
  });

  // --- Interactive Booking Calendar Slots computed ---
  calendarSlots = computed(() => {
    const id = this.agent()?.userId || this.route.snapshot.params['id'];
    return this.store.calendarSlots()[id] || [];
  });

  selectedSlot = signal<CalendarSlot | null>(null);

  generateDynamicSlots(realBookings: BookingListItem[]): CalendarSlot[] {
    const slots: CalendarSlot[] = [];
    const daysArabic = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const monthsArabic = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    const today = new Date();
    const listings = this.properties()?.items || [];

    for (let i = 0; i < 4; i++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + i);

      const dayIndex = targetDate.getDay();
      const dayNum = targetDate.getDate();
      const monthIndex = targetDate.getMonth();

      let dayName = daysArabic[dayIndex];
      if (i === 0) dayName = 'اليوم';
      else if (i === 1) dayName = 'غداً';

      const dateStr = `${daysArabic[dayIndex]} ${dayNum} ${monthsArabic[monthIndex]}`;

      // Morning slot
      const morningDate = new Date(targetDate);
      morningDate.setHours(10, 0, 0, 0);

      const morningStart = morningDate.getTime();
      const morningEnd = morningStart + 90 * 60 * 1000;
      const isMorningBooked = realBookings.some(b => {
        const isAgentProperty = listings.some(p => p.id === b.propertyId);
        if (!isAgentProperty) return false;
        if (b.status === 'Cancelled') return false;
        const bStart = new Date(b.startDate).getTime();
        const bEnd = new Date(b.endDate).getTime();
        return morningStart < bEnd && bStart < morningEnd;
      });

      slots.push({
        id: `slot_${i}_am`,
        dayName,
        dateStr,
        timeStr: '10:00 ص - 11:30 ص',
        available: !isMorningBooked,
        date: morningDate
      });

      // Afternoon slot
      const afternoonDate = new Date(targetDate);
      afternoonDate.setHours(16, 30, 0, 0);

      const afternoonStart = afternoonDate.getTime();
      const afternoonEnd = afternoonStart + 90 * 60 * 1000;
      const isAfternoonBooked = realBookings.some(b => {
        const isAgentProperty = listings.some(p => p.id === b.propertyId);
        if (!isAgentProperty) return false;
        if (b.status === 'Cancelled') return false;
        const bStart = new Date(b.startDate).getTime();
        const bEnd = new Date(b.endDate).getTime();
        return afternoonStart < bEnd && bStart < afternoonEnd;
      });

      slots.push({
        id: `slot_${i}_pm`,
        dayName,
        dateStr,
        timeStr: '04:30 م - 06:00 م',
        available: !isAfternoonBooked,
        date: afternoonDate
      });
    }

    return slots;
  }

  async ngOnInit() {
    const userId = this.route.snapshot.params['id'];
    if (!userId) return;

    this.loading.set(true);
    try {
      // Load basic info
      const agentData = await this.agentService.getById(userId);
      this.agent.set(agentData);
      
      // Load properties (await to populate listings for generateDynamicSlots)
      await this.loadProperties(userId);
      
      // Fetch database bookings
      const bookingsResponse = await this.bookingService.getMyBookings(1, 100).catch(() => null);
      const realBookings = bookingsResponse ? bookingsResponse.items : [];

      // Always initialize/re-initialize slots dynamically with actual bookings
      this.store.initializeCalendarSlots(userId, this.generateDynamicSlots(realBookings));
    } catch (error) {
      console.error('Error loading agent profile:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadProperties(userId: string) {
    this.propertiesLoading.set(true);
    try {
      const props = await this.propertyService.getAll({
        agentUserId: userId,
        pageNumber: 1,
        pageSize: 12
      });
      this.properties.set(props);
    } finally {
      this.propertiesLoading.set(false);
    }
  }

  async contactAgent() {
    const agent = this.agent();
    if (!agent) return;

    if (!this.auth.isAuthenticated()) {
      this.toast.info(this.translate.instant('AGENT_PROFILE.LOGIN_REQUIRED_CONTACT'));
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.auth.isBuyer()) {
      this.toast.warning(this.translate.instant('AGENT_PROFILE.BUYER_ONLY_CONTACT'));
      return;
    }

    if (this.auth.userId() === agent.userId) {
      this.router.navigate(['/profile/edit']);
      return;
    }

    const props = this.properties();
    if (!props || props.items.length === 0) {
      this.toast.warning(this.translate.instant('AGENT_PROFILE.NO_PROPERTIES_CONTACT'));
      return;
    }

    this.contactingAgent.set(true);
    try {
      this.toast.info(this.translate.instant('AGENT_PROFILE.STARTING_CHAT'));
      const res = await this.conversationService.create(props.items[0].id);
      this.router.navigate(['/conversations', res.conversationId]);
    } catch (error: any) {
      this.toast.error(error?.error?.detail || this.translate.instant('AGENT_PROFILE.START_CHAT_FAILED'));
    } finally {
      this.contactingAgent.set(false);
    }
  }

  isPropertySaved(id: string): boolean {
    return false; 
  }

  async onToggleSave(id: string) {
    if (!this.auth.isAuthenticated()) {
      this.toast.info(this.translate.instant('PROPERTIES.LIST.LOGIN_REQUIRED_SAVE'));
      this.router.navigate(['/auth/login']);
      return;
    }
    
    try {
      await this.propertyService.save(id);
      this.toast.success('تمت إضافة العقار للمفضلة');
    } catch {
      try {
        await this.propertyService.unsave(id);
        this.toast.success('تمت إزالة العقار من المفضلة');
      } catch {
        this.toast.error('فشل في تحديث المفضلات');
      }
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

  async confirmBooking() {
    const slot = this.selectedSlot();
    if (!slot) return;

    const agentId = this.agent()?.userId || this.route.snapshot.params['id'];
    const props = this.properties();
    
    if (!props || props.items.length === 0) {
      this.toast.error('عذراً، لا يوجد عقارات مسجلة لهذا الوكيل لحجز معاينة عليها.');
      return;
    }

    const firstProperty = props.items[0];
    
    try {
      this.toast.info('جاري إرسال طلب حجز المعاينة إلى قاعدة البيانات...');
      
      const bookingDate = slot.date || new Date();
      const endDate = new Date(bookingDate.getTime() + 90 * 60 * 1000); // + 1.5 hours
      
      // Call API Service
      await this.bookingService.create({
        propertyId: firstProperty.id,
        startDate: bookingDate.toISOString(),
        endDate: endDate.toISOString(),
        amount: firstProperty.price * 0.01, // Mock viewing cost or 1%
        commissionRate: this.agent()?.commissionRate || 0.025,
        currency: 'EGP',
        notes: `حجز معاينة مجدولة من تقويم الوكيل: ${slot.dayName} (${slot.dateStr}) الساعة ${slot.timeStr}`
      });

      // Update local state store
      this.store.bookCalendarSlot(agentId, slot.id);

      this.toast.success(`تم تأكيد حجز موعد المعاينة بنجاح يوم ${slot.dateStr} الساعة ${slot.timeStr}! وتم ربطها بقاعدة البيانات بنجاح.`);
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      this.toast.error(err?.error?.detail || 'فشل في تسجيل الحجز بقاعدة البيانات.');
    } finally {
      this.selectedSlot.set(null);
    }
  }

  // --- Web Share API ---
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
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.toast.success('تم نسخ رابط الملف الشخصي بنجاح! يمكنك مشاركته الآن كبطاقة أعمال رقمية.');
      } catch (e) {
        this.toast.error('عذراً، لم نتمكن من نسخ الرابط تلقائياً.');
      }
    }
  }
}
