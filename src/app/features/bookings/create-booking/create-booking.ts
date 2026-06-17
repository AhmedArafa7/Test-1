import { firstValueFrom } from 'rxjs';
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { CreateBookingRequest, Property, BookingDetail, UpdateBookingStatusRequest, BookingStatus } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { buildPropertyPlaceholder, getPropertyImageUrl } from '../../../core/utils/media';
import { environment } from '../../../../environments/environment';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { ProfileService } from '../../profile/services/profile.service';
import { PropertyService } from '../../properties/services/property.service';
import { BookingService } from '../services/booking.service';
import { extractApiError } from '../../../core/utils/api-error';
import { AvailabilityService } from '../../availability/availability.service';

interface Slot {
  id: string;
  start: string;
  end: string;
  hour: number;
}

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent, CurrencyEgpPipe, TranslateModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans py-20 px-6" dir="rtl">
      @if (loadingProperty()) {
        <div class="flex justify-center py-32"><app-loading-spinner [message]="'BOOKINGS.LOADING_PROPERTY' | translate" /></div>
      } @else if (!property()) {
        <div class="max-w-md mx-auto text-center bg-white p-12 rounded-[32px] border border-gray-100 shadow-sm mt-10">
          <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          </div>
          <p class="text-gray-900 font-black text-2xl mb-2">{{ 'PROPERTY_DETAIL.MESSAGES.NOT_FOUND' | translate }}</p>
          <p class="text-gray-500 font-bold text-sm mb-8 leading-relaxed">{{ 'PROPERTY_DETAIL.MESSAGES.NOT_FOUND_DESC' | translate }}</p>
          <a routerLink="/properties" class="bg-[#0a8f96] text-white text-sm font-black py-4 px-10 rounded-2xl shadow-xl shadow-[#0a8f96]/20 hover:scale-105 transition-transform inline-block">{{ 'BOOKINGS.BROWSE_BTN' | translate }}</a>
        </div>
      } @else if (bookingUnavailableMessage()) {
        <div class="max-w-xl mx-auto animate-fade-in">
          <div class="bg-white rounded-[32px] border border-gray-100 p-12 text-center shadow-sm">
            <div class="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h1 class="text-3xl font-black text-gray-900 mb-4">{{ 'BOOKINGS.UNAVAILABLE_TITLE' | translate }}</h1>
            <p class="text-gray-500 font-bold text-base mb-10 leading-relaxed">{{ bookingUnavailableMessage() }}</p>
            <a [routerLink]="['/properties', property()!.id]" class="bg-[#0a8f96] text-white text-sm font-black py-4 px-10 rounded-2xl shadow-xl shadow-[#0a8f96]/20 hover:scale-105 transition-transform inline-block">{{ 'BOOKINGS.BACK_TO_PROPERTY' | translate }}</a>
          </div>
        </div>
      } @else {
        <div class="max-w-5xl mx-auto animate-fade-in">
          
          <!-- Title Section -->
          <div class="ltr:text-left rtl:text-right mb-12">
            <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-3">{{ 'BOOKINGS.CREATE_TITLE' | translate }}</h1>
            <p class="text-sm text-gray-500 font-bold">{{ 'BOOKINGS.CREATE_SUBTITLE' | translate:{ title: property()!.title } }}</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <!-- Left Side: Form (RTL) -->
            <div class="lg:col-span-8 space-y-8">
              <form (ngSubmit)="submit()" class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
                
                <!-- Date Selection -->
                <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-8 border-b border-gray-50 pb-6">
                  <h3 class="text-xl font-black text-gray-900">{{ 'BOOKINGS.SCHEDULE_TITLE' | translate }}</h3>
                  <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-8 mb-8">
                  <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'BOOKINGS.TOUR_DATE' | translate }} <span class="text-red-500">*</span></label>
                    <input type="date" [ngModel]="form().startDate" (ngModelChange)="onStartDateChange($event)" name="startDate" [class]="startDateFieldClass() + ' cursor-pointer'" [min]="minDate">
                    <div [class]="startDateHintClass()">
                      @if (startDateTouched() && startDateError()) {
                        <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        <span>{{ startDateError() === 'tooFar' ? ('VALIDATION.Booking_EndDateTooFar' | translate) : ('BOOKINGS.MESSAGES.REQUIRED_DATES' | translate) }}</span>
                      } @else {
                        <span>{{ 'BOOKINGS.START_DATE_HINT' | translate }}</span>
                      }
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-4">
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.SLOTS.TITLE' | translate }} <span class="text-red-500">*</span></label>
                      <span class="text-[10px] font-bold text-gray-400">{{ durationHint() }}</span>
                    </div>

                    @if (groupedSlots().length === 0) {
                      <div class="p-6 bg-gray-50 rounded-2xl text-center text-xs font-bold text-gray-500">
                        {{ 'BOOKINGS.SLOTS.EMPTY' | translate }}
                      </div>
                    } @else {
                      <div class="space-y-5">
                        @for (group of groupedSlots(); track group.key) {
                          <div>
                            <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2.5">{{ group.label | translate }}</p>
                            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                              @for (slot of group.slots; track slot.id) {
                                <button
                                  type="button"
                                  (click)="selectSlot(slot)"
                                  [disabled]="isSlotPast(slot)"
                                  [class]="getSlotClass(slot)"
                                  [title]="isSlotPast(slot) ? ('BOOKINGS.SLOTS.PAST' | translate) : ('BOOKINGS.SLOTS.BTN_SELECT' | translate)">
                                  <span class="text-sm font-black tracking-tight" dir="ltr">{{ slot.start }} – {{ slot.end }}</span>
                                </button>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    }

                    @if (selectedSlot(); as s) {
                      <div class="mt-4 p-3 bg-[#0a8f96]/5 border border-[#0a8f96]/20 rounded-xl flex items-center gap-2 text-xs font-bold text-[#0a8f96]">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                        <span>{{ 'BOOKINGS.SLOTS.SELECTED' | translate }}: <strong dir="ltr">{{ s.start }} – {{ s.end }}</strong></span>
                      </div>
                    } @else if (slotsTouched() && slotError()) {
                      <div class="mt-2 field-hint is-error">
                        <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        <span>{{ 'BOOKINGS.SLOTS.REQUIRED' | translate }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="mb-12">
                  <div class="flex items-center justify-between mb-3">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.NOTES' | translate }}</label>
                    <span class="text-[10px] font-bold text-gray-400" [class.text-red-500]="notes().length > 1000">{{ notes().length }} / 1000</span>
                  </div>
                  <textarea [ngModel]="notes()" (ngModelChange)="notes.set($event)" name="notes" rows="4" maxlength="1000" class="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all resize-none" [placeholder]="'BOOKINGS.NOTES_PLACEHOLDER' | translate"></textarea>
                  @if (notes().length > 1000) {
                    <p class="text-xs font-bold text-red-600 mt-2">{{ 'VALIDATION.Booking_NotesTooLong' | translate }}</p>
                  }
                </div>

                <!-- Personal Info -->
                <div class="flex items-center justify-end gap-3 mb-8 border-b border-gray-50 pb-6">
                  <h3 class="text-xl font-black text-gray-900">{{ 'BOOKINGS.CREATE.CONTACT_INFO_TITLE' | translate }}</h3>
                  <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'BOOKINGS.CREATE.FULL_NAME' | translate }} <span class="text-red-500">*</span></label>
                    <input type="text" [ngModel]="form().payerName" (ngModelChange)="updateField('payerName', $event); payerNameTouched.set(true)" (blur)="payerNameTouched.set(true)" name="payerName" [class]="payerNameFieldClass()" [placeholder]="'BOOKINGS.CREATE.NAME_PLACEHOLDER' | translate">
                    <div [class]="payerNameHintClass()">
                      @if (payerNameTouched() && payerNameError()) {
                        <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        <span>{{ payerNameError() === 'required' ? ('BOOKINGS.CREATE.REQUIRED' | translate) : ('BOOKINGS.CREATE.NAME_MIN' | translate) }}</span>
                      } @else {
                        <span>{{ 'BOOKINGS.CREATE.NAME_HINT' | translate }}</span>
                      }
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'BOOKINGS.CREATE.EMAIL' | translate }} <span class="text-red-500">*</span></label>
                      <input type="email" [ngModel]="form().payerEmail" (ngModelChange)="updateField('payerEmail', $event); payerEmailTouched.set(true)" (blur)="payerEmailTouched.set(true)" name="payerEmail" [class]="payerEmailFieldClass() + ' text-left'" dir="ltr" placeholder="you@example.com">
                      <div [class]="payerEmailHintClass()">
                        @if (payerEmailTouched() && payerEmailError()) {
                          <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                          <span>{{ 'AUTH.LOGIN.EMAIL_INVALID' | translate }}</span>
                        } @else {
                          <span>{{ 'AUTH.LOGIN.EMAIL_HINT' | translate }}</span>
                        }
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'BOOKINGS.CREATE.PHONE' | translate }} <span class="text-red-500">*</span></label>
                      <input type="tel" [ngModel]="form().payerPhone" (ngModelChange)="updateField('payerPhone', $event); payerPhoneTouched.set(true)" (blur)="payerPhoneTouched.set(true)" name="payerPhone" [class]="payerPhoneFieldClass() + ' text-left'" dir="ltr" placeholder="+20 1x xxxx xxxx">
                      <div [class]="payerPhoneHintClass()">
                        @if (payerPhoneTouched() && payerPhoneError()) {
                          <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                          <span>{{ 'BOOKINGS.CREATE.PHONE_HINT' | translate }}</span>
                        } @else {
                          <span>{{ 'BOOKINGS.CREATE.PHONE_HINT' | translate }}</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-12 space-y-3">
                  <div class="flex flex-col sm:flex-row gap-5">
                    <button type="submit" [disabled]="submitting() || !isFormValid()" (click)="markAllTouched()"
                            [title]="!isFormValid() ? ('BOOKINGS.SAVE_DISABLED_HINT' | translate) : ''"
                            [class]="(submitting() || !isFormValid()) ? 'flex-[2] bg-gray-200 text-gray-400 font-black py-5 px-8 rounded-[22px] flex items-center justify-center gap-3 cursor-not-allowed' : 'flex-[2] bg-[#0a8f96] hover:bg-[#076b70] text-white font-black py-5 px-8 rounded-[22px] shadow-xl shadow-[#0a8f96]/20 transition-all flex items-center justify-center gap-3 active:scale-95'">
                      @if (submitting()) { <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                      {{ submitting() ? ('BOOKINGS.SUBMITTING' | translate) : ('BOOKINGS.CONFIRM_BTN' | translate) }}
                    </button>
                    <a [routerLink]="['/properties', property()!.id]" class="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black py-5 px-8 rounded-[22px] transition-all text-center">
                      {{ 'COMMON.CANCEL' | translate }}
                    </a>
                  </div>
                  @if (!isFormValid() && (startDateTouched() || slotsTouched() || payerNameTouched() || payerEmailTouched() || payerPhoneTouched())) {
                    <p class="field-hint is-error justify-center">
                      <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                      <span>{{ 'BOOKINGS.SAVE_DISABLED_HINT' | translate }}</span>
                    </p>
                  }
                </div>
              </form>
            </div>

            <!-- Right Side: Property Summary (Sidebar) -->
            <div class="lg:col-span-4 space-y-8">
              <div class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 sticky top-10">
                <div class="relative h-48 rounded-[28px] overflow-hidden mb-6 shadow-md">
                  <img [src]="propertyImageUrl()" class="w-full h-full object-cover">
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div class="absolute bottom-4 start-4">
                    <span class="bg-[#0a8f96] text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">{{ 'PROPERTY.LISTING_TYPES.' + property()!.listingType | translate }}</span>
                  </div>
                </div>

                <h3 class="text-xl font-black text-gray-900 mb-2 truncate">{{ property()!.title }}</h3>
                <p class="text-gray-400 text-xs font-bold flex items-center gap-2 mb-6 ltr:justify-start rtl:justify-end">
                  <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {{ getDistrictLabel(property()!.district) }}, {{ getCityLabel(property()!.city) }}
                </p>

                <div class="pt-6 border-t border-gray-50 space-y-4 ltr:text-left rtl:text-right">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.DETAIL.TOUR_FEE' | translate }}</span>
                    <span class="text-lg font-black text-gray-900">{{ 100 | currencyEgp }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.DETAIL.COMMISSION' | translate:{ rate: (form().commissionRate * 100) | number:'1.0-2' } }}</span>
                    <span class="text-lg font-black text-gray-900" >+{{ (100 * form().commissionRate) | currencyEgp:2 }}</span>
                  </div>
                  <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span class="text-xs font-black text-gray-900 uppercase tracking-widest">{{ 'BOOKINGS.DETAIL.TOTAL_VALUE' | translate }}</span>
                    <span class="text-xl font-black text-[#0a8f96]">{{ (100 + (100 * form().commissionRate)) | currencyEgp:2 }}</span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t border-gray-50/50">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.TOTAL_PRICE_LABEL' | translate }}</span>
                    <span class="text-sm font-bold text-gray-500">{{ property()!.price | currencyEgp }}</span>
                  </div>
                </div>

                <div class="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p class="text-[10px] text-blue-600 font-bold leading-relaxed flex gap-2">
                    <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ 'BOOKINGS.FEE_HELP' | translate }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CreateBookingComponent implements OnInit {
  property = signal<Property | null>(null);
  loadingProperty = signal(true);
  submitting = signal(false);
  bookingUnavailableMessage = signal<string | null>(null);
  oldBookingId = signal<string | null>(null);
  notes = signal('');
  minDate = new Date().toISOString().split('T')[0];
  private translate = inject(TranslateService);

  // Form state as a signal
  form = signal<CreateBookingRequest>({
    propertyId: '',
    startDate: '',
    endDate: '',
    amount: 100,
    commissionRate: 0,
    currency: 'EGP',
    payerName: '',
    payerEmail: '',
    payerPhone: ''
  });

  // Touched state per field
  startDateTouched = signal(false);
  slotsTouched = signal(false);
  payerNameTouched = signal(false);
  payerEmailTouched = signal(false);
  payerPhoneTouched = signal(false);

  // Validation
  readonly startDateError = computed<string | null>(() => {
    if (!this.form().startDate) return 'required';
    const date = new Date(this.form().startDate);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (date.getTime() > maxDate.getTime()) return 'tooFar';
    return null;
  });
  readonly slotError = computed<string | null>(() => {
    if (!this.selectedSlot()) return 'required';
    return null;
  });
  readonly payerNameError = computed<string | null>(() => {
    const v = (this.form().payerName || '').trim();
    if (!v) return 'required';
    if (v.length < 2) return 'minLength';
    return null;
  });
  readonly payerEmailError = computed<string | null>(() => {
    const v = (this.form().payerEmail || '').trim();
    if (!v) return 'required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'invalid';
    return null;
  });
  readonly payerPhoneError = computed<string | null>(() => {
    const v = (this.form().payerPhone || '').trim();
    if (!v) return 'required';
    // Accept Egyptian numbers with or without +20 prefix
    if (!/^(\+20|0)?1[0-9]{9}$/.test(v.replace(/[\s-]/g, ''))) return 'invalid';
    return null;
  });

  readonly isFormValid = computed<boolean>(() => {
    if (this.startDateError() !== null) return false;
    if (this.slotError() !== null) return false;
    if (this.payerNameError() !== null) return false;
    if (this.payerEmailError() !== null) return false;
    if (this.payerPhoneError() !== null) return false;
    return true;
  });

  // Field class getters
  readonly startDateFieldClass = computed<string>(() => {
    const base = 'w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all';
    if (this.startDateTouched() && this.startDateError()) return base + ' !border-red-300 !bg-red-50/30 focus:!border-red-400';
    if (this.startDateTouched() && !this.startDateError()) return base + ' !border-emerald-300';
    return base;
  });
  readonly startDateHintClass = computed<string>(() => {
    if (this.startDateTouched() && this.startDateError()) return 'field-hint is-error';
    return 'field-hint is-neutral';
  });
  readonly payerNameFieldClass = computed<string>(() => {
    const base = 'w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all';
    if (this.payerNameTouched() && this.payerNameError()) return base + ' !border-red-300 !bg-red-50/30 focus:!border-red-400';
    if (this.payerNameTouched() && !this.payerNameError()) return base + ' !border-emerald-300';
    return base;
  });
  readonly payerNameHintClass = computed<string>(() => {
    if (this.payerNameTouched() && this.payerNameError()) return 'field-hint is-error';
    return 'field-hint is-neutral';
  });
  readonly payerEmailFieldClass = computed<string>(() => {
    const base = 'w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all';
    if (this.payerEmailTouched() && this.payerEmailError()) return base + ' !border-red-300 !bg-red-50/30 focus:!border-red-400';
    if (this.payerEmailTouched() && !this.payerEmailError()) return base + ' !border-emerald-300';
    return base;
  });
  readonly payerEmailHintClass = computed<string>(() => {
    if (this.payerEmailTouched() && this.payerEmailError()) return 'field-hint is-error';
    return 'field-hint is-neutral';
  });
  readonly payerPhoneFieldClass = computed<string>(() => {
    const base = 'w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all';
    if (this.payerPhoneTouched() && this.payerPhoneError()) return base + ' !border-red-300 !bg-red-50/30 focus:!border-red-400';
    if (this.payerPhoneTouched() && !this.payerPhoneError()) return base + ' !border-emerald-300';
    return base;
  });
  readonly payerPhoneHintClass = computed<string>(() => {
    if (this.payerPhoneTouched() && this.payerPhoneError()) return 'field-hint is-error';
    return 'field-hint is-neutral';
  });

  markAllTouched() {
    this.startDateTouched.set(true);
    this.slotsTouched.set(true);
    this.payerNameTouched.set(true);
    this.payerEmailTouched.set(true);
    this.payerPhoneTouched.set(true);
  }

  // --- Slot Picker ---
  readonly SLOT_START_HOUR = 9;
  readonly SLOT_END_HOUR = 21;
  readonly SLOT_DURATION_MIN = 60;

  private slots = signal<Slot[]>([]);
  selectedSlot = signal<Slot | null>(null);

  private langChangeEvent = toSignal(this.translate.onLangChange);
  readonly currentLang = computed(() => this.langChangeEvent()?.lang || this.translate.currentLang || 'ar');

  readonly durationHint = computed<string>(() => {
    const slot = this.selectedSlot();
    const isAr = this.currentLang() === 'ar';
    if (!slot) {
      return isAr ? 'مدة المعاينة: تختلف حسب الفترة الزمنية المحددة' : 'Viewing duration: Varies by selected time slot';
    }
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);
    let diff = (endH * 60 + endM) - (startH * 60 + startM);
    if (diff < 0) diff += 24 * 60;

    if (diff === 30) {
      return isAr ? 'مدة المعاينة: نصف ساعة' : 'Viewing duration: 30 minutes';
    }
    if (diff === 60) {
      return isAr ? 'مدة المعاينة: ساعة واحدة' : 'Viewing duration: 1 hour';
    }
    if (diff === 90) {
      return isAr ? 'مدة المعاينة: ساعة ونصف' : 'Viewing duration: 1.5 hours';
    }
    if (diff === 120) {
      return isAr ? 'مدة المعاينة: ساعتان' : 'Viewing duration: 2 hours';
    }
    
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours > 0) {
      if (mins > 0) {
        return isAr ? `مدة المعاينة: ${hours} ساعة و ${mins} دقيقة` : `Viewing duration: ${hours}h ${mins}m`;
      }
      return isAr ? `مدة المعاينة: ${hours} ساعة` : `Viewing duration: ${hours} hour(s)`;
    }
    return isAr ? `مدة المعاينة: ${mins} دقيقة` : `Viewing duration: ${mins} minutes`;
  });

  async onStartDateChange(value: string) {
    this.form.update(f => ({ ...f, startDate: value }));
    this.startDateTouched.set(true);
    this.selectedSlot.set(null);
    await this.generateSlotsFromAvailability(this.form().propertyId, value);
  }

  updateField(field: keyof CreateBookingRequest, value: any) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  private generateSlots(): Slot[] {
    const out: Slot[] = [];
    for (let h = this.SLOT_START_HOUR; h < this.SLOT_END_HOUR; h++) {
      const start = `${h.toString().padStart(2, '0')}:00`;
      const end = `${(h + 1).toString().padStart(2, '0')}:00`;
      out.push({ id: `s${h}`, start, end, hour: h });
    }
    return out;
  }

  private async generateSlotsFromAvailability(propertyId: string, date: string): Promise<void> {
    try {
      const start = `${date}T00:00:00`;
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      const end = `${date}T23:59:59`;

      console.log(`[Availability] Requesting slots for property ${propertyId} from ${start} to ${end}`);

      const timeSlots = await firstValueFrom(
        this.availabilityService.getPropertyAvailability(propertyId, start, end)
      );

      console.log(`[Availability] Received ${timeSlots?.length || 0} slots:`, timeSlots);

      if (timeSlots && timeSlots.length > 0) {
        const slots: Slot[] = [];
        timeSlots.forEach((ts, i) => {
          const startDate = new Date(ts.startTime);
          
          // Get local date string YYYY-MM-DD
          const year = startDate.getFullYear();
          const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
          const day = startDate.getDate().toString().padStart(2, '0');
          const localDateStr = `${year}-${month}-${day}`;

          if (localDateStr === date) {
            const startH = startDate.getHours();
            const startM = startDate.getMinutes();
            const endDateObj = new Date(ts.endTime);
            const endH = endDateObj.getHours();
            const endM = endDateObj.getMinutes();
            const startStr = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
            const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
            slots.push({ id: `av${i}`, start: startStr, end: endStr, hour: startH });
          }
        });

        // Deduplicate slots with the same start and end times
        const uniqueSlots: Slot[] = [];
        const seen = new Set<string>();
        for (const slot of slots) {
          const key = `${slot.start}-${slot.end}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueSlots.push(slot);
          }
        }

        this.slots.set(uniqueSlots);
      } else {
        this.slots.set([]);
      }
    } catch (err: any) {
      console.error('[Availability] Failed to load slots:', err?.status, err?.message, err?.error);
      this.slots.set([]);
      // Don't show error toast for 404 (no rules set up yet) — just show empty slots
      if (err?.status !== 404) {
        this.toast.error(this.translate.instant('BOOKINGS.SLOTS.LOAD_ERROR'));
      }
    }
  }


  groupedSlots = computed<{ key: 'MORNING' | 'AFTERNOON' | 'EVENING'; label: string; slots: Slot[] }[]>(() => {
    const all = this.slots();
    const groups: { key: 'MORNING' | 'AFTERNOON' | 'EVENING'; label: string; slots: Slot[] }[] = [
      { key: 'MORNING', label: 'BOOKINGS.SLOTS.MORNING', slots: [] },
      { key: 'AFTERNOON', label: 'BOOKINGS.SLOTS.AFTERNOON', slots: [] },
      { key: 'EVENING', label: 'BOOKINGS.SLOTS.EVENING', slots: [] },
    ];
    for (const s of all) {
      if (s.hour < 12) groups[0].slots.push(s);
      else if (s.hour < 18) groups[1].slots.push(s);
      else groups[2].slots.push(s);
    }
    return groups.filter(g => g.slots.length > 0);
  });

  selectSlot(slot: Slot) {
    if (this.isSlotPast(slot)) return;
    this.selectedSlot.set(slot);
  }

  isSlotPast(slot: Slot): boolean {
    if (!this.form().startDate) return false;
    const [h, m] = slot.start.split(':').map(Number);
    const slotDate = new Date(this.form().startDate);
    slotDate.setHours(h, m, 0, 0);
    return slotDate.getTime() <= Date.now();
  }

  getSlotClass(slot: Slot): string {
    const isSelected = this.selectedSlot()?.id === slot.id;
    const isPast = this.isSlotPast(slot);
    const base = 'w-full px-3 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center text-center';
    if (isPast) {
      return `${base} bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed line-through opacity-50`;
    }
    if (isSelected) {
      return `${base} bg-[#0a8f96] border-[#0a8f96] text-white shadow-lg shadow-[#0a8f96]/20 scale-[0.98]`;
    }
    return `${base} bg-white border-gray-100 text-gray-700 hover:border-[#0a8f96]/40 hover:bg-[#0a8f96]/5 cursor-pointer active:scale-95`;
  }

  // Localization Mappings
  // NOTE: These maps are static backend API value→Arabic-label mappings used as a
  // document terminology reference; values come from the backend as English enum
  // codes (e.g. 'Cairo'). The runtime user-facing display is sourced from
  // CITIES / DISTRICTS translation files via getCityLabel/getDistrictLabel below.
  // Kept as constants rather than translation keys because they map backend codes,
  // not user-facing labels.
  private cityMap: Record<string, string> = {
    'Cairo': 'القاهرة', 'Alexandria': 'الإسكندرية', 'Giza': 'الجيزة', 'Mansoura': 'المنصورة',
    'Tanta': 'طنطا', 'Mahalla': 'المحلة الكبرى', 'PortSaid': 'بور سعيد', 'Suez': 'السويس',
    'Ismailia': 'الإسماعيلية', 'Fayoum': 'الفيوم', 'Zagازيق': 'الزقازيق', 'Aswan': 'أسوان',
    'Luxor': 'الأقصر', 'Damietta': 'دمياط', 'Damanhour': 'دمنهور', 'Minya': 'المنيا',
    'BeniSuef': 'بني سويف', 'Qena': 'قنا', 'Sohag': 'سوهاج', 'Asyut': 'أسيوط',
    'Hurghada': 'الغردقة', 'SharmElSheikh': 'شرم الشيخ', 'MarsaMatrouh': 'مرسى مطروح',
    'October': '6 أكتوبر', 'Zayed': 'الشيخ زايد'
  };

  private districtMap: Record<string, string> = {
    'Zamalek': 'الزمالك', 'Maadi': 'المعادي', 'NewCairo': 'القاهرة الجديدة',
    'FifthSettlement': 'التجمع الخامس', 'FirstSettlement': 'التجمع الأول',
    'ThirdSettlement': 'التجمع الثالث', 'Heliopolis': 'مصر الجديدة',
    'NasrCity': 'مدينة نصر', 'GardenCity': 'جاردن سيتي', 'Dokki': 'الدقي',
    'Mohandessin': 'المهندسين', 'Madinaty': 'مدينتي', 'Shorouk': 'مدينة الشروق',
    'Obour': 'مدينة العبور', 'Rehab': 'مدينة الرحاب', 'Agouza': 'العجوزة',
    'Shoubra': 'شبرا', 'Mokattam': 'المقطم', 'Helwan': 'حلوان',
    'Smouha': 'سموحة', 'Miami': 'ميامي', 'SidiBishr': 'سيدي بشر', 'Gleem': 'جليم',
    'Sporting': 'سبورتنج', 'Laurent': 'لوران', 'KafrAbdo': 'كفر عبده',
    'Roushdy': 'رشدي', 'SanStefano': 'سان ستيفانو', 'Agamy': 'العجمي',
    'Montaza': 'المنتزة', 'Mandara': 'المندرة', 'MoharamBek': 'محرم بك',
    'CampCesar': 'كامب شيزار', 'Ibrahimia': 'الإبراهيمية', 'Shatby': 'الشاطبي',
    'Stanley': 'ستانلي', 'SidiGaber': 'سيدى جابر'
  };

  public getCityKeyFromValue(value: string | undefined): string {
    if (!value) return '';
    return Object.keys(this.cityMap).find(key => this.cityMap[key] === value) || value;
  }

  public getDistrictKeyFromValue(value: string | undefined): string {
    if (!value) return '';
    return Object.keys(this.districtMap).find(key => this.districtMap[key] === value) || value;
  }

  public getCityLabel(value: string | undefined): string {
    if (!value) return '';
    const key = this.getCityKeyFromValue(value);
    const translationKey = 'CITIES.' + key;
    const translated = this.translate.instant(translationKey);
    return translated !== translationKey ? translated : value;
  }

  public getDistrictLabel(value: string | undefined): string {
    if (!value) return '';
    const key = this.getDistrictKeyFromValue(value);
    const translationKey = 'DISTRICTS.' + key;
    const translated = this.translate.instant(translationKey);
    return translated !== translationKey ? translated : value;
  }

  private availabilityService = inject(AvailabilityService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private profileService: ProfileService,
    private bookingService: BookingService,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  propertyImageUrl(): string {
    return getPropertyImageUrl(this.property()?.images?.[0]?.url, this.property()?.title);
  }

  onPropertyImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = buildPropertyPlaceholder(this.property()?.title);
  }

  async ngOnInit() {
    const propertyId = this.route.snapshot.queryParams['propertyId'];
    const oldId = this.route.snapshot.queryParams['oldBookingId'];

    if (oldId) {
      this.oldBookingId.set(oldId);
      try {
        const oldBooking = await this.bookingService.getById(oldId);
        // [BACKEND_MISSING]: These fields are not returned by the backend BookingDto/BookingDetail yet.
        // Once added to the backend, uncomment these lines to enable pre-filling for rescheduling.
        // this.form.update(f => ({ ...f, payerName: (oldBooking as any).payerName ?? '' }));
        // this.form.update(f => ({ ...f, payerEmail: (oldBooking as any).payerEmail ?? '' }));
        // this.form.update(f => ({ ...f, payerPhone: (oldBooking as any).payerPhone ?? '' }));

        if (oldBooking.startDate) {
          const startStr = new Date(oldBooking.startDate).toISOString().split('T')[0];
          this.form.update(f => ({ ...f, startDate: startStr }));
        }
        if (oldBooking.endDate) {
          const endStr = new Date(oldBooking.endDate).toISOString().split('T')[0];
          this.form.update(f => ({ ...f, endDate: endStr }));
        }
      } catch {
        console.error('Failed to load old booking details');
      }
    }

    if (!propertyId) {
      this.loadingProperty.set(false);
      return;
    }

    this.form.update(f => ({ ...f, propertyId }));

    if (this.form().startDate) {
      await this.generateSlotsFromAvailability(propertyId, this.form().startDate);
    }

    try {
      const property = await this.propertyService.getById(propertyId);
      this.property.set(property);

      this.form.update(f => ({ ...f, commissionRate: environment.bookingServiceFeeRate ?? 0.025 }));

      if (!this.canBookProperty(property)) {
        this.bookingUnavailableMessage.set(this.translate.instant('BOOKINGS.MESSAGES.UNAVAILABLE'));
        return;
      }

      // Pre-fill payer/contact info from the logged-in user's database profile and session
      try {
        const profile = await this.profileService.getMyProfile();
        const name = profile.displayName || this.auth.currentUser()?.displayName || '';
        const email = this.auth.currentUser()?.email || '';
        const phone = profile.phoneNumber || '';
        this.form.update(f => ({ ...f, payerName: name, payerEmail: email, payerPhone: phone }));
      } catch (err) {
        console.error('Failed to pre-fill user profile info:', err);
        const name = this.auth.currentUser()?.displayName || '';
        const email = this.auth.currentUser()?.email || '';
        this.form.update(f => ({ ...f, payerName: name, payerEmail: email }));
      }
    } catch (e: any) {
      const extracted = extractApiError(e, this.translate);
      if (extracted) {
        this.toast.error(extracted);
      } else {
        this.toast.error(this.translate.instant('PROPERTY_DETAIL.MESSAGES.NOT_FOUND'));
      }
    } finally {
      this.loadingProperty.set(false);
    }
  }

  async submit() {
    this.markAllTouched();

    if (this.bookingUnavailableMessage()) {
      this.toast.info(this.bookingUnavailableMessage()!);
      return;
    }

    if (!this.isFormValid()) {
      // Inline errors shown via the template
      return;
    }

    if (this.notes() && this.notes().length > 1000) {
      this.toast.error(this.translate.instant('VALIDATION.Booking_NotesTooLong'));
      return;
    }

    const slot = this.selectedSlot()!;
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);
    const startDate = new Date(this.form().startDate);
    startDate.setHours(startH, startM, 0, 0);
    const endDate = new Date(this.form().startDate);
    endDate.setHours(endH, endM, 0, 0);

    const payload: CreateBookingRequest = {
      ...this.form(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes: this.notes() || undefined,
    };

    console.log('[Booking] Payload:', JSON.stringify(payload, null, 2));
    console.log('[Booking] Property:', this.property()?.id, '| Status:', this.property()?.status);

    this.submitting.set(true);
    try {
      // If rescheduling, cancel the old booking first to free up the dates
      if (this.oldBookingId()) {
        await this.bookingService.updateStatus(this.oldBookingId()!, { status: BookingStatus.Cancelled });
      }

      const response = await this.bookingService.create(payload);
      this.toast.success(this.translate.instant('BOOKINGS.MESSAGES.CREATE_SUCCESS'));

      if (response.redirectUrl) {
        window.location.href = response.redirectUrl.startsWith('http')
          ? response.redirectUrl
          : new URL(response.redirectUrl, environment.apiUrl).toString();
      } else {
        this.router.navigate(['/bookings', response.bookingId]);
      }
    } catch (e: any) {
      console.error('Booking creation error:', e);
      console.error('Error status:', e?.status);
      console.error('Error body:', e?.error);

      let errorMessage = this.translate.instant('BOOKINGS.MESSAGES.CREATE_ERROR');

      if (e?.status === 409) {
        const detail = e?.error?.detail || e?.error?.title || '';
        if (detail.includes('Conflict') || detail.includes('conflict') || detail.includes('overlap') || detail.includes('Overlap')) {
          errorMessage = this.translate.instant('BOOKINGS.MESSAGES.CONFLICT_ERROR');
        } else {
          errorMessage = this.translate.instant('BOOKINGS.MESSAGES.DUPLICATE_ERROR');
        }
      } else {
        const extracted = extractApiError(e, this.translate);
        if (extracted) {
          errorMessage = extracted;
        }
      }

      this.toast.error(errorMessage);
    } finally {
      this.submitting.set(false);
    }
  }

  private canBookProperty(property: Property): boolean {
    const status = property.status.toLowerCase();
    return status === 'available';
  }
}
