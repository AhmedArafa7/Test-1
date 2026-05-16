import { Component, OnInit, signal, inject } from '@angular/core';
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

@Component({
  selector: 'app-create-booking',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent, CurrencyEgpPipe, TranslateModule],
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

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'BOOKINGS.TOUR_DATE' | translate }} <span class="text-red-500">*</span></label>
                    <input type="date" [(ngModel)]="form.startDate" name="startDate" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all cursor-pointer" [min]="minDate" required>
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'BOOKINGS.TOUR_TIME' | translate }} <span class="text-red-500">*</span></label>
                    <input type="time" [(ngModel)]="tourTime" name="tourTime" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all cursor-pointer" required>
                  </div>
                </div>

                <div class="mb-12">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'BOOKINGS.NOTES' | translate }}</label>
                  <textarea [(ngModel)]="notes" name="notes" rows="4" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all resize-none" [placeholder]="'BOOKINGS.NOTES_PLACEHOLDER' | translate"></textarea>
                </div>

                <!-- Personal Info (Commented out as backend uses authenticated user profile) -->
                <!-- 
                <div class="flex items-center justify-end gap-3 mb-8 border-b border-gray-50 pb-6">
                  <h3 class="text-xl font-black text-gray-900">بيانات التواصل</h3>
                  <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">الاسم بالكامل <span class="text-red-500">*</span></label>
                    <input type="text" [(ngModel)]="form.payerName" name="payerName" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all" placeholder="أدخل اسمك بالكامل" required>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">البريد الإلكتروني <span class="text-red-500">*</span></label>
                      <input type="email" [(ngModel)]="form.payerEmail" name="payerEmail" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all text-left" dir="ltr" placeholder="you@example.com" required>
                    </div>
                    <div>
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">رقم الهاتف <span class="text-red-500">*</span></label>
                      <input type="tel" [(ngModel)]="form.payerPhone" name="payerPhone" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all text-left" dir="ltr" placeholder="+971 xx xxx xxxx" required>
                    </div>
                  </div>
                </div>
                -->

                <div class="mt-12 flex flex-col sm:flex-row gap-5">
                  <button type="submit" [disabled]="submitting()" class="flex-[2] bg-[#0a8f96] hover:bg-[#076b70] text-white font-black py-5 px-8 rounded-[22px] shadow-xl shadow-[#0a8f96]/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                    @if (submitting()) { <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                    {{ submitting() ? ('BOOKINGS.SUBMITTING' | translate) : ('BOOKINGS.CONFIRM_BTN' | translate) }}
                  </button>
                  <a [routerLink]="['/properties', property()!.id]" class="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black py-5 px-8 rounded-[22px] transition-all text-center">
                    {{ 'COMMON.CANCEL' | translate }}
                  </a>
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
                  {{ 'DISTRICTS.' + getDistrictKeyFromValue(property()!.district) | translate }}, {{ 'CITIES.' + getCityKeyFromValue(property()!.city) | translate }}
                </p>

                <div class="pt-6 border-t border-gray-50 space-y-4 ltr:text-left rtl:text-right">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.FEE_LABEL' | translate }}</span>
                    <span class="text-lg font-black text-gray-900">{{ 100 | currencyEgp }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ 'BOOKINGS.TOTAL_PRICE_LABEL' | translate }}</span>
                    <span class="text-lg font-black text-[#0a8f96]">{{ property()!.price | currencyEgp }}</span>
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
  tourTime = '';
  notes = '';
  minDate = new Date().toISOString().split('T')[0];
  private translate = inject(TranslateService);

  // Localization Mappings
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

  form: CreateBookingRequest = {
    propertyId: '',
    startDate: '',
    endDate: '',
    amount: 100, // Fixed refundable deposit for now
    commissionRate: 0,
    currency: 'EGP'
  };

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
        // Pre-fill form from old booking
        // [BACKEND_MISSING]: These fields are not returned by the backend BookingDto/BookingDetail yet.
        // Once added to the backend, uncomment these lines to enable pre-filling for rescheduling.
        // this.form.payerName = (oldBooking as any).payerName ?? '';
        // this.form.payerEmail = (oldBooking as any).payerEmail ?? '';
        // this.form.payerPhone = (oldBooking as any).payerPhone ?? '';
        
        // Format ISO dates to YYYY-MM-DD for date inputs
        if (oldBooking.startDate) {
          this.form.startDate = new Date(oldBooking.startDate).toISOString().split('T')[0];
        }
        if (oldBooking.endDate) {
          this.form.endDate = new Date(oldBooking.endDate).toISOString().split('T')[0];
        }
      } catch {
        console.error('Failed to load old booking details');
      }
    }

    if (!propertyId) {
      this.loadingProperty.set(false);
      return;
    }

    this.form.propertyId = propertyId;

    try {
      const property = await this.propertyService.getById(propertyId);
      this.property.set(property);

      if (!this.canBookProperty(property)) {
        this.bookingUnavailableMessage.set(this.translate.instant('BOOKINGS.MESSAGES.UNAVAILABLE'));
        return;
      }

      /* Payer info is now handled by the backend using the authenticated session */
    } catch {
      this.toast.error(this.translate.instant('PROPERTY_DETAIL.MESSAGES.NOT_FOUND'));
    } finally {
      this.loadingProperty.set(false);
    }
  }

  async submit() {
    if (this.bookingUnavailableMessage()) {
      this.toast.info(this.bookingUnavailableMessage()!);
      return;
    }

    if (!this.form.startDate || !this.tourTime) {
      this.toast.error(this.translate.instant('BOOKINGS.MESSAGES.REQUIRED_DATES'));
      return;
    }

    const [hours, minutes] = this.tourTime.split(':').map(Number);
    const startDate = new Date(this.form.startDate);
    startDate.setHours(hours, minutes, 0, 0);

    // endDate = same day, 1 hour after start (for tour duration)
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const payload: CreateBookingRequest = {
      ...this.form,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      notes: this.notes || undefined,
    };

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
      let errorMessage = this.translate.instant('BOOKINGS.MESSAGES.CREATE_ERROR');
      
      if (e?.error?.detail) {
        errorMessage = e.error.detail;
      } else if (e?.error?.errors) {
        const firstErrorKey = Object.keys(e.error.errors)[0];
        const firstErrorMessages = e.error.errors[firstErrorKey];
        errorMessage = Array.isArray(firstErrorMessages) ? firstErrorMessages[0] : firstErrorMessages;
      } else if (e?.error?.title) {
        errorMessage = e.error.title;
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
