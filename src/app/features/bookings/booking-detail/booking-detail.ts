import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Location, CommonModule } from '@angular/common';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConversationService } from '../../conversations/services/conversation.service';

import { AuthService } from '../../../core/auth/auth.service';
import { BookingDetail, BookingStatus } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { BookingService } from '../services/booking.service';
import { PropertyService } from '../../properties/services/property.service';
import { getPropertyImageUrl, buildPropertyPlaceholder } from '../../../core/utils/media';
import { LocalImageService } from '../../../core/services/local-image.service';
import { AgentService } from '../../agents/services/agent.service';
import { AgentDetail } from '../../../core/models';
import { ProfileService } from '../../profile/services/profile.service';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, LocalizedDatePipe, CurrencyEgpPipe, FormsModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans py-20 px-6">
      <div class="max-w-6xl mx-auto animate-fade-in">
        
        <!-- Header & Back Button -->
        <div class="flex items-center gap-5 mb-12">
          <button (click)="goBack()" class="w-14 h-14 bg-white border border-gray-100 rounded-[22px] flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm transition-all active:scale-90">
            <svg class="w-6 h-6 ltr:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 19l7-7-7-7"/></svg>
          </button>
          <div>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight">{{ 'BOOKINGS.DETAIL.TITLE' | translate }}</h1>
            <p class="text-sm text-gray-500 font-bold mt-1">{{ 'BOOKINGS.DETAIL.SUBTITLE' | translate }}</p>
          </div>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-32"><app-loading-spinner [message]="'BOOKINGS.DETAIL.LOADING' | translate" /></div>
        } @else if (booking(); as b) {
          
          <!-- Status Banner -->
          <div class="bg-white rounded-[32px] border border-gray-100 p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 mb-10 shadow-sm">
            <div class="flex items-center gap-8">
              <div class="w-20 h-20 rounded-[30px] flex items-center justify-center shrink-0 shadow-sm" 
                   [class]="b.status === 'Confirmed' || b.status === 'Completed' ? 'bg-gradient-to-br from-[#0a8f96]/15 to-[#0a8f96]/5 text-[#0a8f96]' : b.status === 'Pending' ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-500' : 'bg-gradient-to-br from-red-100 to-red-50 text-red-500'">
                @if (b.status === 'Confirmed' || b.status === 'Completed') {
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                } @else if (b.status === 'Pending') {
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 2m9-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                } @else {
                  <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                }
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{{ 'BOOKINGS.DETAIL.CURRENT_STATUS' | translate }}</p>
                <div class="flex items-center gap-4">
                  <h2 class="text-3xl font-black text-gray-900 leading-none">{{ 'STATUSES.' + b.status | translate }}</h2>
                  <span class="text-[10px] bg-gray-50 text-gray-400 font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-gray-100">BK-{{ b.id.substring(0,6).toUpperCase() }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-4 w-full md:w-auto">
              @if (b.status !== 'Pending' && b.status !== 'Cancelled') {
                <button (click)="printReceipt()" class="px-8 py-4.5 bg-gray-50 hover:bg-gray-100 rounded-[20px] text-xs font-black text-gray-900 transition-all flex items-center justify-center gap-3 active:scale-95">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  {{ 'BOOKINGS.DETAIL.PRINT_BTN' | translate }}
                </button>
              }

              <button (click)="contactOtherParty()" class="flex-1 md:flex-none px-8 py-4.5 bg-[#0a8f96] text-white rounded-[20px] text-xs font-black shadow-lg shadow-[#0a8f96]/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                {{ (auth.userId() === b.agentUserId ? 'BOOKINGS.DETAIL.BUYER_DATA' : 'BOOKINGS.DETAIL.CONTACT_AGENT') | translate }}
              </button>
              
              @if (b.status === 'Cancelled' && b.paymentId && !auth.isAgent()) {
                <button (click)="requestRefund()" [disabled]="refunding()" class="flex-1 md:flex-none px-8 py-4.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-[20px] text-xs font-black transition-all flex items-center gap-2">
                  <svg *ngIf="refunding()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ 'BOOKINGS.DETAIL.REFUND_BTN' | translate }}
                </button>
              }

              @if (b.status === 'Pending' && canCancel(b)) {
                <button (click)="updateStatus(BookingStatus.Cancelled)" class="flex-1 md:flex-none px-8 py-4.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-[20px] text-xs font-black transition-all">
                  {{ 'BOOKINGS.DETAIL.CANCEL_BTN' | translate }}
                </button>
              }
            </div>
          </div>

          <!-- Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <!-- Left Column: Property & Time -->
            <div class="lg:col-span-7 space-y-10">
              
              <!-- Property Details -->
              <div class="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[360px] group">
                <div class="w-full md:w-[320px] h-full shrink-0 overflow-hidden relative bg-gray-50">
                  <img [src]="propertyImageUrl()" [alt]="b.propertyTitle" 
                       class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                       (error)="onPropertyImageError($event)">
                </div>
                <div class="p-10 flex flex-col justify-between flex-1">
                  <div>
                    <div class="flex items-center gap-3 mb-4">
                      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a8f96]">{{ 'BOOKINGS.DETAIL.EXCLUSIVE_TAG' | translate }}</span>
                      <div class="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{{ 'BOOKINGS.DETAIL.TOUR_REQUEST' | translate }}</span>
                    </div>
                    <a [routerLink]="['/properties', b.propertyId]" class="text-3xl font-black text-gray-900 hover:text-[#0a8f96] transition-colors leading-tight mb-4 block">
                      {{ b.propertyTitle }}
                    </a>
                    <p class="text-base text-gray-500 font-medium flex items-start gap-3 leading-relaxed">
                      <svg class="w-5 h-5 text-[#0a8f96] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ 'BOOKINGS.DETAIL.LOCATION_INFO' | translate }}
                    </p>
                  </div>
                  
                  <div class="pt-8 mt-8 border-t border-gray-50 flex items-center justify-between">
                    <a [routerLink]="['/agents', b.agentUserId]" class="flex items-center gap-4 group">
                      <div class="w-14 h-14 rounded-full border-4 border-white shadow-lg overflow-hidden ring-1 ring-gray-100 flex items-center justify-center bg-gray-50 transition-transform group-hover:scale-105">
                        @if (agent()) {
                          @if (agent()?.avatarUrl) {
                            <img [src]="agent()?.avatarUrl" class="w-full h-full object-cover" (error)="onAvatarError($event)">
                          } @else {
                            <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          }
                        } @else {
                          <div class="w-5 h-5 border-2 border-[#0a8f96]/30 border-t-[#0a8f96] rounded-full animate-spin"></div>
                        }
                      </div>
                      <div class="text-start">
                        <p class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{{ 'BOOKINGS.DETAIL.AGENT_LABEL' | translate }}</p>
                        <p class="text-base font-black text-gray-900 group-hover:text-[#0a8f96] transition-colors">
                          {{ agent()?.displayName || ('BOOKINGS.DETAIL.LOADING_NAME' | translate) }}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              <!-- Unified Time Card -->
              <div class="bg-white rounded-[32px] border border-gray-100 p-12 shadow-sm">
                <div class="flex items-center gap-4 mb-8">
                  <div class="w-12 h-12 bg-gradient-to-br from-[#0a8f96]/10 to-[#0a8f96]/5 rounded-2xl flex items-center justify-center text-[#0a8f96] border border-[#0a8f96]/10">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'BOOKINGS.DETAIL.BOOKED_TOUR' | translate }}</h3>
                </div>
                
                <div class="bg-gray-50/50 border border-gray-50 rounded-[32px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white hover:shadow-[0_16px_48px_rgba(10,143,150,0.08)] transition-all">
                  <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-gradient-to-br from-[#0a8f96]/10 to-[#0a8f96]/5 rounded-[22px] flex flex-col items-center justify-center text-[#0a8f96] font-black">
                      <span class="text-[10px] leading-none text-gray-400 mb-1 font-bold">{{ 'BOOKINGS.DETAIL.DAY' | translate }}</span>
                      <span class="text-xl leading-none">{{ b.startDate | localizedDate:'dd' }}</span>
                    </div>
                    <div class="text-start">
                      <p class="text-[10px] font-black uppercase tracking-widest text-[#0a8f96] mb-1">{{ 'BOOKINGS.DETAIL.TOUR_DATE' | translate }}</p>
                      <p class="text-2xl font-black text-gray-900 leading-none">{{ b.startDate | localizedDate:'EEEE، dd MMMM yyyy' }}</p>
                    </div>
                  </div>
                  
                  <div class="w-full sm:w-auto border-t sm:border-t-0 sm:border-r border-gray-100 pt-6 sm:pt-0 sm:pr-8 flex flex-col items-start sm:items-end">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{{ 'BOOKINGS.DETAIL.TIME_LABEL' | translate }}</p>
                    <p class="text-xl font-black text-gray-900 flex items-center gap-2">
                      <span>{{ b.startDate | localizedDate:'hh:mm a' }}</span>
                      <span class="text-gray-300 text-sm font-medium">{{ 'BOOKINGS.DETAIL.TIME_TO_SEPARATOR' | translate }}</span>
                      <span>{{ b.endDate | localizedDate:'hh:mm a' }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Buyer Info (Agent view) -->
              @if (auth.isAgent() && b.buyerName) {
                <div class="bg-white rounded-[32px] border border-gray-100 p-12 shadow-sm">
                  <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-100 shadow-sm">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'BOOKINGS.DETAIL.BUYER_INFO' | translate }}</h3>
                  </div>
                  <div class="bg-gray-50/50 border border-gray-50 rounded-[32px] p-8">
                    <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{{ 'BOOKINGS.DETAIL.BUYER_NAME_LABEL' | translate }}</p>
                    <p class="text-xl font-black text-gray-900">{{ b.buyerName }}</p>
                  </div>
                </div>
              }

              <!-- Booking Notes -->
              @if (b.notes) {
                <div class="bg-white rounded-[32px] border border-gray-100 p-12 shadow-sm">
                  <div class="flex items-center gap-4 mb-8">
                    <div class="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-100 shadow-sm">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </div>
                    <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'BOOKINGS.DETAIL.NOTES_TITLE' | translate }}</h3>
                  </div>
                  <div class="bg-gray-50/50 border border-gray-50 rounded-[32px] p-8">
                    <p class="text-sm font-bold text-gray-600 leading-relaxed whitespace-pre-line">{{ b.notes }}</p>
                  </div>
                </div>
              }

              <!-- Admin Controls -->
              @if (b.status === 'Pending' && canConfirm(b)) {
                <div class="bg-gray-900 rounded-[32px] p-12 shadow-2xl shadow-gray-900/20 text-white">
                  <h4 class="text-2xl font-black mb-4 flex items-center gap-4">
                    <span class="w-2.5 h-10 bg-[#0a8f96] rounded-full"></span>
                    {{ 'BOOKINGS.DETAIL.AGENT_ACTIONS' | translate }}
                  </h4>
                  <p class="text-gray-400 font-bold text-sm mb-4">{{ 'BOOKINGS.DETAIL.AGENT_HINT' | translate }}</p>
                  <p class="text-yellow-400/80 font-bold text-[11px] mb-10 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ 'BOOKINGS.DETAIL.PAYMENT_NOTICE' | translate }}
                  </p>
                  <div class="flex flex-col sm:flex-row gap-6">
                    <button (click)="updateStatus(BookingStatus.Confirmed)" class="flex-1 bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-black py-5 rounded-[22px] shadow-xl shadow-[#0a8f96]/20 transition-all flex items-center justify-center gap-3">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                      {{ 'BOOKINGS.DETAIL.CONFIRM_BTN' | translate }}
                    </button>
                    <button (click)="updateStatus(BookingStatus.Cancelled)" class="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-black py-5 rounded-[22px] transition-all border border-white/10">
                      {{ 'BOOKINGS.DETAIL.REJECT_BTN' | translate }}
                    </button>
                  </div>
                </div>
              }

              <!-- Review Section -->
              @if (b.userId === auth.userId() && (b.status === 'Confirmed' || b.status === 'Completed' || b.status === 'Paid')) {
                <div class="bg-white rounded-[32px] border border-gray-100 p-12 shadow-sm">
                  <div class="flex items-center gap-4 mb-10 pb-8 border-b border-gray-50">
                    <div class="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </div>
                    <div>
                      <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'BOOKINGS.DETAIL.REVIEW_TITLE' | translate }}</h3>
                      <p class="text-xs text-gray-400 font-bold mt-1">{{ 'BOOKINGS.DETAIL.REVIEW_SUBTITLE' | translate }}</p>
                    </div>
                  </div>

                  <div class="space-y-10">
                    <!-- Star Rating -->
                    <div class="flex flex-col items-center">
                      <div class="flex items-center gap-4 mb-4">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <button (click)="reviewRating.set(star)" 
                                  class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
                                  [class]="reviewRating() >= star ? 'text-yellow-400 bg-yellow-50' : 'text-gray-200 bg-gray-50 hover:bg-gray-100'">
                            <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          </button>
                        }
                      </div>
                      <p class="text-sm font-black" [class]="reviewRating() > 0 ? 'text-[#0a8f96]' : 'text-gray-300'">
                        {{ reviewRating() === 5 ? ('BOOKINGS.DETAIL.RATINGS.EXCELLENT' | translate) : reviewRating() === 4 ? ('BOOKINGS.DETAIL.RATINGS.VERY_GOOD' | translate) : reviewRating() === 3 ? ('BOOKINGS.DETAIL.RATINGS.GOOD' | translate) : reviewRating() === 2 ? ('BOOKINGS.DETAIL.RATINGS.FAIR' | translate) : reviewRating() === 1 ? ('BOOKINGS.DETAIL.RATINGS.POOR' | translate) : ('BOOKINGS.DETAIL.RATINGS.PROMPT' | translate) }}
                      </p>
                    </div>

                    <!-- Comment -->
                    <div>
                      <textarea [(ngModel)]="reviewComment" 
                                class="w-full bg-gray-50 border-2 border-transparent rounded-[32px] px-8 py-6 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all resize-none h-40"
                                [placeholder]="'BOOKINGS.DETAIL.REVIEW_PLACEHOLDER' | translate"></textarea>
                    </div>

                    <button (click)="submitReview()" 
                            [disabled]="submittingReview() || reviewRating() === 0"
                            class="w-full bg-gray-900 text-white font-black py-5 rounded-[22px] shadow-xl shadow-gray-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                      @if (submittingReview()) { <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                      {{ submittingReview() ? ('BOOKINGS.DETAIL.SUBMITTING' | translate) : ('BOOKINGS.DETAIL.SUBMIT_REVIEW' | translate) }}
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Right Column: Financials -->
            <div class="lg:col-span-5 mb-5">
              <div class="bg-white rounded-[32px] border border-gray-100 p-12 shadow-sm sticky top-28">
                <div class="flex items-center gap-4 mb-12 pb-8 border-b border-gray-50">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-sm">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <h3 class="text-2xl font-black text-gray-900 tracking-tight">{{ 'BOOKINGS.DETAIL.FINANCIAL_TITLE' | translate }}</h3>
                </div>
                
                <div class="space-y-8 mb-12">
                  <div class="flex justify-between items-center">
                    <span class="text-[11px] font-black text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.DETAIL.TOUR_FEE' | translate }}</span>
                    <span class="text-lg font-black text-gray-900">{{ b.amount | currencyEgp }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-[11px] font-black text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.DETAIL.COMMISSION' | translate:{ rate: (b.commissionRate * 100) | number:'1.0-2' } }}</span>
                    <span class="text-lg font-black text-[#0a8f96]">+{{ (b.amount * b.commissionRate) | currencyEgp:2 }}</span>
                  </div>
                  @if (b.paymentId) {
                    <div class="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span class="text-[11px] font-black text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.DETAIL.PAYMENT_ID' | translate }}</span>
                      <span class="text-[11px] font-black text-blue-500 tabular-nums">{{ b.paymentId }}</span>
                    </div>
                  }
                </div>

                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] p-10 text-center shadow-2xl shadow-gray-900/20 mb-8 relative overflow-hidden">
                  <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 16px 16px;"></div>
                  <div class="relative z-10">
                  <p class="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4">{{ (b.status === 'Paid' || b.status === 'Confirmed' ? 'BOOKINGS.DETAIL.TOTAL_PAID' : 'BOOKINGS.DETAIL.TOTAL_VALUE') | translate }}</p>
                  <p class="text-5xl font-black text-[#0a8f96] tracking-tighter">{{ (b.amount + (b.amount * b.commissionRate)) | currencyEgp:2 }}</p>
                  <p class="text-[10px] font-black text-white/40 mt-4 uppercase tracking-widest">{{ 'BOOKINGS.DETAIL.TAX_INCLUDED' | translate }}</p>
                  </div>
                </div>

                <div class="flex justify-between items-center px-4">
                   <span class="text-[10px] font-black text-gray-300 uppercase">{{ 'BOOKINGS.DETAIL.REQUEST_DATE' | translate }}</span>
                   <span class="text-[11px] font-bold text-gray-400">{{ b.createdOnUtc | localizedDate:'yyyy/MM/dd hh:mm a' }}</span>
                </div>

                <div class="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <svg class="w-6 h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p class="text-[11px] text-gray-500 font-bold leading-loose">
                    {{ 'BOOKINGS.DETAIL.FINANCIAL_NOTE' | translate }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class BookingDetailComponent implements OnInit {
  private translate = inject(TranslateService);
  readonly BookingStatus = BookingStatus;

  booking = signal<BookingDetail | null>(null);
  loading = signal(true);
  propertyImageUrl = signal<string>('');
  
  reviewRating = signal(0);
  reviewComment = '';
  submittingReview = signal(false);
  refunding = signal(false);
  agent = signal<AgentDetail | null>(null);

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private propertyService: PropertyService,
    private profileService: ProfileService,
    public auth: AuthService,
    private toast: ToastService,
    private location: Location,
    private localImageService: LocalImageService,
    private router: Router,
    private conversationService: ConversationService,
    private agentService: AgentService
  ) {}

  async requestRefund() {
    const b = this.booking();
    if (!b || !b.paymentId) return;

    this.refunding.set(true);
    try {
      const res = await this.profileService.requestRefund({
        paymentId: b.paymentId,
        amount: b.amount,
        reason: this.translate.instant('BOOKINGS.DETAIL.MESSAGES.REFUND_REASON')
      });
      this.toast.success(this.translate.instant('BOOKINGS.DETAIL.MESSAGES.REFUND_SUCCESS', { id: res.refundId.substring(0, 8) }));
    } catch (e: any) {
      this.toast.error(e?.error?.detail || this.translate.instant('BOOKINGS.DETAIL.MESSAGES.REFUND_ERROR'));
    } finally {
      this.refunding.set(false);
    }
  }

  goBack() {
    this.location.back();
  }

  async ngOnInit() {
    this.loading.set(true);
    try {
      const bookingData = await this.bookingService.getById(this.route.snapshot.params['id']);
      this.booking.set(bookingData);

      // Fetch agent details
      try {
        const agentData = await this.agentService.getById(bookingData.agentUserId);
        this.agent.set(agentData);
      } catch (e) {
        console.error('Failed to fetch agent details', e);
      }
      
      // Try local storage cache first (fastest)
      const thumb = this.localImageService.getThumbnail(bookingData.propertyId);
      if (thumb) {
        this.propertyImageUrl.set(thumb);
      } else {
        // Fetch property to get real image
        try {
          const property = await this.propertyService.getById(bookingData.propertyId);
          if (property.images && property.images.length > 0) {
            const primaryImg = property.images.find(img => img.isPrimary);
            const imgUrl = primaryImg ? primaryImg.url : property.images[0].url;
            const finalUrl = getPropertyImageUrl(imgUrl, property.title);
            this.propertyImageUrl.set(finalUrl);
            this.localImageService.saveThumbnail(property.id, finalUrl);
          } else {
            this.propertyImageUrl.set(buildPropertyPlaceholder(bookingData.propertyTitle));
          }
        } catch {
          this.propertyImageUrl.set(buildPropertyPlaceholder(bookingData.propertyTitle));
        }
      }
    } catch {
      this.toast.error(this.translate.instant('BOOKINGS.DETAIL.MESSAGES.NOT_FOUND'));
    } finally {
      this.loading.set(false);
    }
  }

  onAvatarError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      img.remove();
      parent.innerHTML = `
        <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      `;
    }
  }

  onPropertyImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = buildPropertyPlaceholder(this.booking()?.propertyTitle);
  }

  commissionAmount(booking: BookingDetail): number {
    return booking.amount * booking.commissionRate;
  }

  canConfirm(booking: BookingDetail): boolean {
    return this.auth.userId() === booking.agentUserId;
  }

  canCancel(booking: BookingDetail): boolean {
    const currentUserId = this.auth.userId();
    return currentUserId === booking.agentUserId || currentUserId === booking.userId;
  }

  async updateStatus(status: BookingStatus) {
    const currentBooking = this.booking();
    if (!currentBooking) return;

    try {
      await this.bookingService.updateStatus(currentBooking.id, { status });
      this.toast.success(this.translate.instant('BOOKINGS.DETAIL.MESSAGES.UPDATE_SUCCESS'));
      await this.ngOnInit();
    } catch (error: any) {
      this.toast.error(this.translate.instant('BOOKINGS.DETAIL.MESSAGES.UPDATE_ERROR'));
    }
  }

  async contactOtherParty() {
    const b = this.booking();
    if (!b) return;

    // [BACKEND_LIMITATION]: Agents cannot open chat with buyers via propertyId due to self-contact check.
    if (this.auth.userId() === b.agentUserId) {
      this.toast.info(this.translate.instant('BOOKINGS.DETAIL.AGENT_CHAT_LIMIT'));
      return;
    }

    try {
      this.toast.info(this.translate.instant('BOOKINGS.DETAIL.MESSAGES.CHAT_OPENING'));
      const res = await this.conversationService.create(b.propertyId);
      this.router.navigate(['/conversations', res.conversationId], { queryParams: { propertyId: b.propertyId } });
    } catch {
      this.toast.error(this.translate.instant('BOOKINGS.DETAIL.MESSAGES.CHAT_ERROR'));
    }
  }


  async submitReview() {
    const b = this.booking();
    if (!b || this.reviewRating() === 0) return;

    this.submittingReview.set(true);
    try {
      await this.propertyService.createReview({
        agentUserId: b.agentUserId,
        propertyId: b.propertyId,
        rating: this.reviewRating(),
        comment: this.reviewComment
      });
      this.toast.success(this.translate.instant('BOOKINGS.DETAIL.MESSAGES.REVIEW_SUCCESS'));
      this.reviewRating.set(0);
      this.reviewComment = '';
    } catch (e: any) {
      console.error('Review submission failed:', e);
      let errorMessage = this.translate.instant('BOOKINGS.DETAIL.MESSAGES.REVIEW_ERROR');
      if (e?.error?.detail) {
        errorMessage = e.error.detail;
      } else if (e?.error?.title) {
        errorMessage = e.error.title;
      }
      this.toast.error(errorMessage);
    } finally {
      this.submittingReview.set(false);
    }
  }

  printReceipt() {
    window.print();
  }

  downloadPdf() {
    this.toast.info(this.translate.instant('BOOKINGS.DETAIL.PDF_HINT'));
    // In a real scenario, this would call an API:
    // this.bookingService.downloadReceiptPdf(this.booking()!.id).subscribe(...)
  }
}
