import { Component, signal, inject, DestroyRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SearchEngine, SearchInputType, SearchRequestDetail } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { AiService } from '../services/ai.service';
import { compressImage } from '../../../core/utils/media';

@Component({
  selector: 'app-ai-search',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyEgpPipe, TranslateModule],
  template: `
    <div class="min-h-screen bg-slate-50/50 font-sans p-4 md:p-8 pt-24 md:pt-28">
      <div class="max-w-3xl mx-auto flex flex-col gap-6 md:gap-8">
        
        <!-- Header -->
        <div class="text-center relative z-10 py-6">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a8f96]/5 border border-[#0a8f96]/10 text-[#0a8f96] font-bold text-xs tracking-wider mb-6">
            <span>💡</span>
            <span class="text-[10px] font-black uppercase tracking-[0.25em]">AI-Powered Search</span>
          </div>
          <h1 class="text-4xl md:text-[50px] font-black text-gray-900 leading-tight mb-4 tracking-tight">
            ابحث عن منزل أحلامك بذكاء غير مسبوق
          </h1>
          <p class="text-gray-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-bold">
            تصفح آلاف العقارات باستخدام تقنيات الذكاء الاصطناعي المتقدمة. صف ما تبحث عنه وسنجده لك في ثوانٍ.
          </p>
        </div>

        <!-- Unified Search Card -->
        <div class="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-slate-100 p-8 shadow-[0_20px_50px_rgba(10,143,150,0.06)]">
          
          <!-- Recording Active Overlay inside the Input Card -->
          @if (isRecording()) {
            <div class="bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-6 text-center mb-6 animate-pulse flex flex-col items-center justify-center">
              <div class="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20 mb-3">
                <svg class="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 class="text-xs font-black text-red-700">جاري تسجيل صوتك الآن...</h4>
              <p class="text-[10px] text-red-500 font-bold mt-1">المدة: {{ recordingDuration() }} ثانية. تحدث بوضوح ثم اضغط على زر الإيقاف لحفظ المقطع.</p>
              <button (click)="stopRecording()" class="mt-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">
                إيقاف التسجيل 🟥
              </button>
            </div>
          }

          <!-- Drag & Drop Image Uploader (Top half of Card) -->
          <div class="mb-6">
            <div
              (click)="imageInput.click()"
              (dragover)="$event.preventDefault()"
              (drop)="onImageDrop($event)"
              class="border-2 border-dashed border-slate-200 hover:border-[#0a8f96]/30 bg-slate-50/50 hover:bg-[#0a8f96]/[0.02] rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden"
            >
              @if (imagePreviewUrl()) {
                <div class="relative inline-block max-h-48">
                  <img [src]="imagePreviewUrl()" class="max-h-48 mx-auto rounded-xl object-contain shadow-md">
                  <button type="button" 
                          (click)="clearImage($event)"
                          class="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer text-[10px] font-black">
                    ✕
                  </button>
                </div>
                <p class="text-[#0a8f96] text-[11px] font-black mt-3">تم إرفاق الصورة للبحث بنجاح! ✨</p>
              } @else {
                <div class="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#0a8f96]/10 to-[#0a8f96]/5 rounded-2xl flex items-center justify-center border border-[#0a8f96]/10 group-hover:scale-105 transition-transform duration-300">
                  <svg class="w-6 h-6 text-[#0a8f96]" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p class="text-gray-900 font-extrabold text-sm mb-1">انقر للتحميل أو اسحب الصورة هنا</p>
                <p class="text-gray-400 text-[10px] font-bold">البحث باستخدام صور العقارات (JPG, PNG)</p>
              }
            </div>
            <input #imageInput type="file" accept="image/*" (change)="onImageSelect($event)" class="hidden">
          </div>

          <!-- Audio Waveform preview if recorded -->
          @if (audioBlob()) {
            <div class="flex items-center justify-between p-4 bg-[#0a8f96]/5 border border-[#0a8f96]/10 rounded-2xl mb-6 animate-slide-up">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#0a8f96] text-white flex items-center justify-center animate-pulse">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                </div>
                <div class="ltr:text-left rtl:text-right">
                  <p class="text-[11px] font-black text-gray-900">تم تسجيل مقطع صوتي بنجاح!</p>
                  <p class="text-[9px] font-bold text-gray-400">المدة: {{ recordingDuration() }} ثانية</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <audio [src]="audioPreviewUrl()" controls class="h-8 max-w-[150px] md:max-w-[200px]"></audio>
                <button (click)="clearRecording()" class="text-[10px] font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider cursor-pointer">حذف</button>
              </div>
            </div>
          }

          <!-- Unified Search Input Bar -->
          <div class="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200/80 px-4 py-1.5 focus-within:bg-white focus-within:border-[#0a8f96] focus-within:ring-4 focus-within:ring-[#0a8f96]/5 transition-all w-full mb-6">
            <!-- Voice Record Button (Left) -->
            <button type="button"
                    (click)="toggleRecording()"
                    [class.text-red-500]="isRecording()"
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#0a8f96] hover:bg-gray-100 active:scale-95 transition-all shrink-0 cursor-pointer">
              <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>

            <!-- Search Query Input (Center) -->
            <input
              [(ngModel)]="rawQuery"
              class="w-full bg-transparent border-none text-xs font-black text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 px-3 rtl:text-right ltr:text-left h-12"
              [placeholder]="'مثال: شقة 3 غرف نوم في دبي مارينا مع إطلالة بحرية ومسبح...'"
            >

            <!-- Search Icon (Right) -->
            <div class="w-10 h-10 flex items-center justify-center text-gray-400 shrink-0">
              <svg class="w-5.5 h-5.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
              </svg>
            </div>
          </div>

          <!-- Advanced Filters Trigger -->
          <div class="pt-4 border-t border-slate-100">
            <button (click)="showFilters.set(!showFilters())" 
                    class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#0a8f96] transition-colors cursor-pointer">
              <svg class="w-3.5 h-3.5 transition-transform duration-300" [class.rotate-180]="showFilters()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
              </svg>
              <span>{{ 'AI_SEARCH.ADVANCED_FILTERS' | translate }}</span>
            </button>

            @if (showFilters()) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in">
                <!-- Location Filters -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-3">{{ 'PROPERTY_FORM.LOCATION' | translate }}</label>
                  <div class="grid grid-cols-1 gap-3">
                    <div style="position: relative;" (click)="$event.stopPropagation()">
                      <div (click)="showCityDropdown.set(!showCityDropdown())" 
                           class="bg-gray-50 rounded-xl text-xs font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                        <span [class.text-gray-400]="!filters.city">{{ filters.city || ('PROPERTY_FORM.CITY' | translate) }}</span>
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                      @if (showCityDropdown()) {
                        <div style="position: absolute; top: 100%; left: 0; right: 0; z-index: 9999; margin-top: 8px;" class="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 max-h-48 overflow-y-auto custom-scrollbar animate-slide-up">
                          @for (city of cities; track city) {
                            <button (click)="selectCity(city)" class="w-full px-6 py-2 text-right hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer">{{ city }}</button>
                          }
                        </div>
                      }
                    </div>
                    <div style="position: relative;" (click)="$event.stopPropagation()">
                      <div (click)="showDistrictDropdown.set(!showDistrictDropdown())" 
                           class="bg-gray-50 rounded-xl text-xs font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                        <span [class.text-gray-400]="!filters.district">{{ filters.district || ('PROPERTY_FORM.DISTRICT' | translate) }}</span>
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                      @if (showDistrictDropdown()) {
                        <div style="position: absolute; top: 100%; left: 0; right: 0; z-index: 9999; margin-top: 8px;" class="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 max-h-48 overflow-y-auto custom-scrollbar animate-slide-up">
                          @for (district of getDistricts(); track district) {
                            <button (click)="selectDistrict(district)" class="w-full px-6 py-2 text-right hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer">{{ district }}</button>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
                <!-- Property Type Filter -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-3">{{ 'PROPERTY_FORM.TYPE' | translate }}</label>
                  <div style="position: relative;" (click)="$event.stopPropagation()">
                    <div (click)="showTypeDropdown.set(!showTypeDropdown())" 
                         class="bg-gray-50 rounded-xl text-xs font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                      <span [class.text-gray-400]="!filters.propertyType">{{ getSelectedTypeLabel() }}</span>
                      <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                    @if (showTypeDropdown()) {
                      <div style="position: absolute; top: 100%; left: 0; right: 0; z-index: 9999; margin-top: 8px;" class="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 max-h-48 overflow-y-auto custom-scrollbar animate-slide-up">
                        <button (click)="selectType('')" class="w-full px-6 py-2 text-right hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer">{{ 'COMMON.ALL' | translate }}</button>
                        @for (type of propertyTypes; track type.id) {
                          <button (click)="selectType(type.id)" class="w-full px-6 py-2 text-right hover:bg-gray-50 text-xs font-bold transition-all flex items-center justify-between cursor-pointer">
                            <span class="opacity-50">{{ type.icon }}</span>
                            <span>{{ type.label }}</span>
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>
                <!-- Price Range Filters -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">{{ 'PROPERTY_LIST.PRICE_RANGE' | translate }}</label>
                  <div class="grid grid-cols-2 gap-2">
                    <input type="number" [(ngModel)]="filters.minPrice" [placeholder]="'PROPERTY_LIST.MIN_PRICE' | translate" class="bg-gray-50 border-none rounded-xl text-xs font-bold p-3 w-full outline-none">
                    <input type="number" [(ngModel)]="filters.maxPrice" [placeholder]="'PROPERTY_LIST.MAX_PRICE' | translate" class="bg-gray-50 border-none rounded-xl text-xs font-bold p-3 w-full outline-none">
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Primary Search Button -->
          <button (click)="search()" [disabled]="searching() || !canSearch()"
                  class="w-full py-4 mt-6 bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-black rounded-2xl shadow-lg shadow-[#0a8f96]/20 hover:shadow-xl hover:shadow-[#0a8f96]/30 active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            @if (searching()) {
              <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{{ searchStepMessage() | translate }}</span>
            } @else {
              <span>بحث بالذكاء الاصطناعي</span>
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            }
          </button>

          @if (searching()) {
            <div class="mt-4">
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-[#0a8f96] to-[#076b70] rounded-full transition-all duration-1000 ease-out" [style.width.%]="searchProgress()"></div>
              </div>
              <p class="text-xs text-gray-400 mt-2 text-center">{{ searchStepMessage() | translate }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Results Display Section -->
      @if (result(); as r) {
        <div class="max-w-3xl mx-auto px-4 md:px-8 pb-16 mt-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-black text-gray-900">{{ 'AI_SEARCH.RESULTS_TITLE' | translate }}</h2>
            <span class="text-[10px] font-black uppercase tracking-widest text-[#0a8f96] bg-[#0a8f96]/5 px-4 py-2 rounded-xl shadow-sm border border-[#0a8f96]/10">
              {{ r.status === 'Completed' ? ('AI_SEARCH.SEARCH_DONE' | translate) : r.status }} — {{ 'AI_SEARCH.FOUND' | translate }} {{ r.resultCount }}
            </span>
          </div>

          @if (r.results && r.results.length > 0) {
            <div class="space-y-4 animate-fade-in">
              @for (sr of r.results; track sr.propertyId) {
                <a [routerLink]="['/properties', sr.propertyId]" class="block bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-[#0a8f96]/5 hover:-translate-y-0.5 transition-all duration-300">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-black text-gray-900 text-lg">{{ sr.snapshotTitle || 'وحدة عقارية' }}</h3>
                      <div class="flex items-center gap-4 mt-2 text-xs font-bold text-gray-400">
                        <span class="flex items-center gap-1">
                          <svg class="w-3 h-3 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                          {{ sr.snapshotCity }}
                        </span>
                        <span class="text-gray-900">{{ sr.snapshotPrice | currencyEgp }}</span>
                        <span class="text-[9px] font-black uppercase tracking-[0.2em] bg-gray-50 text-gray-400 px-3 py-1 rounded-lg border border-gray-100">{{ sr.snapshotStatus === 'Available' ? 'متاح' : 'تم البيع' }}</span>
                      </div>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="text-2xl font-black text-[#0a8f96]">{{ (sr.relevanceScore * 100).toFixed(0) }}%</p>
                      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">تطابق مذهل</p>
                    </div>
                  </div>
                </a>
              }
            </div>
          } @else {
            <div class="text-center py-16 text-gray-400 bg-white border border-slate-100 rounded-3xl p-8">
              <p class="text-lg font-black text-gray-900">{{ 'AI_SEARCH.NO_RESULTS' | translate }}</p>
              <p class="text-xs font-bold mt-2">{{ 'AI_SEARCH.TRY_DIFFERENT' | translate }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    .animate-slide-up {
      animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
    }
    
    @keyframes slideUp {
      from { transform: translateY(12px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class AiSearchComponent {
  readonly SearchInputType = SearchInputType;

  inputType: SearchInputType = SearchInputType.Image;
  rawQuery = '';
  imageFileUrl = '';
  searching = signal(false);
  searchProgress = signal(0);
  searchStepMessage = signal('AI_SEARCH.STEPS.ANALYZING');
  result = signal<SearchRequestDetail | null>(null);
  showFilters = signal(false);
  showCityDropdown = signal(false);
  showDistrictDropdown = signal(false);
  showTypeDropdown = signal(false);

  filters = {
    city: '',
    district: '',
    propertyType: undefined as any,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minBedrooms: undefined as number | undefined,
    maxBedrooms: undefined as number | undefined,
  };

  isRecording = signal(false);
  audioBlob = signal<Blob | null>(null);
  audioPreviewUrl = signal<string>('');
  recordingDuration = signal(0);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingTimer: ReturnType<typeof setInterval> | null = null;
  private secondsElapsed = 0;

  imagePreviewUrl = signal<string>('');
  private imageFile: File | null = null;

  constructor(private aiService: AiService, private toast: ToastService) {
    this.destroyRef.onDestroy(() => this.destroyed = true);
  }

  private destroyRef = inject(DestroyRef);
  private destroyed = false;

  cities = [
    'القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'طنطا', 'المحلة الكبرى', 
    'بور سعيد', 'السويس', 'الإسماعيلية', 'الغردقة', 'شرم الشيخ', '6 أكتوبر', 'الشيخ زايد'
  ];

  propertyTypes = [
    { id: 'Apartment', label: 'شقق', icon: '🏢' },
    { id: 'Villa', label: 'فيلات', icon: '🏡' },
    { id: 'Office', label: 'مكتب', icon: '💼' },
    { id: 'Land', label: 'أراضي', icon: '🏜️' }
  ];

  selectCity(city: string) {
    this.filters.city = city;
    this.showCityDropdown.set(false);
  }

  selectDistrict(district: string) {
    this.filters.district = district;
    this.showDistrictDropdown.set(false);
  }

  getDistricts() {
    return ['الزمالك', 'سموحة', 'الشيخ زايد', '6 أكتوبر'];
  }

  getSelectedTypeLabel() {
    if (!this.filters.propertyType) return 'Property Type';
    return this.propertyTypes.find(t => t.id === this.filters.propertyType)?.label || this.filters.propertyType;
  }

  selectType(id: string) {
    this.filters.propertyType = id;
    this.showTypeDropdown.set(false);
  }

  canSearch(): boolean {
    return !!this.rawQuery.trim() || !!this.imageFile || !!this.imageFileUrl.trim() || !!this.audioBlob();
  }

  async toggleRecording() {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  private async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.secondsElapsed = 0;

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioBlob.set(blob);
        this.audioPreviewUrl.set(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());

        if (this.recordingTimer) {
          clearInterval(this.recordingTimer);
          this.recordingTimer = null;
        }
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingDuration.set(0);
      this.recordingTimer = setInterval(() => {
        this.secondsElapsed++;
        this.recordingDuration.set(this.secondsElapsed);
      }, 1000);
    } catch {
      this.toast.error('Could not access microphone. Please allow microphone permission.');
    }
  }

  stopRecording() {
    this.mediaRecorder?.stop();
    this.isRecording.set(false);
  }

  clearRecording() {
    if (this.audioPreviewUrl()) {
      URL.revokeObjectURL(this.audioPreviewUrl());
    }

    this.audioBlob.set(null);
    this.audioPreviewUrl.set('');
    this.recordingDuration.set(0);
  }

  onImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleImageFile(file);
    }
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.handleImageFile(file);
    }
  }

  private handleImageFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('Image too large. Max 10MB.');
      return;
    }

    this.imageFile = file;
    this.imagePreviewUrl.set(URL.createObjectURL(file));
  }

  clearImage(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.imagePreviewUrl()) {
      URL.revokeObjectURL(this.imagePreviewUrl());
    }
    this.imageFile = null;
    this.imagePreviewUrl.set('');
  }

  private readonly searchSteps = [
    'AI_SEARCH.STEPS.ANALYZING',
    'AI_SEARCH.STEPS.DATABASE',
    'AI_SEARCH.STEPS.MATCHING',
    'AI_SEARCH.STEPS.RANKING',
    'AI_SEARCH.STEPS.FINALIZING',
  ];

  async search() {
    this.searching.set(true);
    this.result.set(null);
    this.searchProgress.set(5);
    this.searchStepMessage.set(this.searchSteps[0]);

    // Intelligently determine inputType based on user inputs
    if (this.imageFile || this.imageFileUrl.trim()) {
      this.inputType = SearchInputType.Image;
    } else if (this.audioBlob()) {
      this.inputType = SearchInputType.Voice;
    } else {
      this.inputType = SearchInputType.Text;
    }

    try {
      let audioFileUrl: string | undefined;
      let imageFileUrl: string | undefined;

      if (this.inputType === SearchInputType.Voice && this.audioBlob()) {
        audioFileUrl = await this.blobToBase64(this.audioBlob()!);
      }

      if (this.inputType === SearchInputType.Image) {
        if (this.imageFile) {
          await new Promise(resolve => setTimeout(resolve, 50)); 
          imageFileUrl = await compressImage(this.imageFile);
        } else {
          imageFileUrl = this.imageFileUrl.trim() || undefined;
        }
      }

      this.searchProgress.set(15);
      this.searchStepMessage.set(this.searchSteps[1]);

      const response = await this.aiService.createSearch({
        inputType: this.inputType,
        searchEngine: SearchEngine.Hybrid,
        rawQuery: this.rawQuery.trim() ? this.rawQuery.trim() : undefined,
        audioFileUrl,
        imageFileUrl,
        ...this.filters
      });

      let attempts = 0;
      while (attempts < 20 && !this.destroyed) {
        const progress = Math.min(20 + (attempts * 4), 90);
        const stepIndex = Math.min(Math.floor(attempts / 4) + 2, this.searchSteps.length - 1);
        this.searchProgress.set(progress);
        this.searchStepMessage.set(this.searchSteps[stepIndex]);

        await new Promise(resolve => setTimeout(resolve, 2000));
        if (this.destroyed) break;
        const status = await this.aiService.getSearchStatus(response.searchRequestId);
        if (status.status !== 'Pending') {
          this.searchProgress.set(100);
          this.searchStepMessage.set('AI_SEARCH.SEARCH_SUCCESS');
          this.result.set(status);
          break;
        }
        attempts++;
      }

      if (!this.result()) {
        this.toast.info('Search is still processing. Check back shortly.');
      }
    } catch (error: any) {
      this.toast.error(error?.error?.detail || 'Search failed');
    } finally {
      this.searching.set(false);
      this.searchProgress.set(0);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
