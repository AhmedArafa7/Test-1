import { Component, signal, inject, DestroyRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SearchEngine, SearchInputType, SearchRequestDetail, PropertyListItem } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { AiService } from '../services/ai.service';
import { compressImage } from '../../../core/utils/media';

@Component({
  selector: 'app-ai-search',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyEgpPipe, TranslateModule],
  template: `
    <div class="min-h-screen bg-white font-sans">
      <!-- Header -->
      <div class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-[#0a8f96]/[0.03] to-transparent"></div>
        <div class="max-w-4xl mx-auto px-4 md:px-8 pt-16 pb-8 text-center relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a8f96]/5 border border-[#0a8f96]/10 mb-6">
            <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span class="text-[10px] font-black text-[#0a8f96] uppercase tracking-[0.2em]">AI-Powered</span>
          </div>
          <h1 class="text-3xl font-black text-gray-900 mb-3 tracking-tight">{{ 'AI_SEARCH.TITLE' | translate }}</h1>
          <p class="text-gray-400 text-[15px] max-w-xl mx-auto leading-relaxed font-medium">
            {{ 'AI_SEARCH.SUBTITLE' | translate }}
          </p>
        </div>
      </div>

      <!-- Search Card -->
      <div class="max-w-3xl mx-auto px-4 md:px-8 mb-16">
        <div class="bg-white rounded-[24px] border border-gray-100/80 shadow-lg shadow-gray-200/30 overflow-hidden">
          <!-- Tab Buttons -->
          <div class="flex border-b border-gray-100">
            @for (mode of modes; track mode.value) {
              <button
                (click)="inputType = mode.value"
                [class]="inputType === mode.value ? 'border-b-2 border-[#0a8f96] text-[#0a8f96]' : 'text-gray-400 hover:text-gray-600'"
                class="flex-1 py-4 px-6 flex items-center justify-center gap-2.5 text-sm font-bold transition-all"
              >
                {{ mode.label | translate }}
              </button>
            }
          </div>

          <div class="p-8">
            @switch (inputType) {
              @case (SearchInputType.Image) {
                <div class="space-y-6">
                  <div
                    (click)="imageInput.click()"
                    (dragover)="$event.preventDefault()"
                    (drop)="onImageDrop($event)"
                    class="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-[#0a8f96]/40 hover:bg-[#0a8f96]/[0.02] transition-all"
                  >
                    @if (imagePreviewUrl()) {
                      <img [src]="imagePreviewUrl()" class="max-h-48 mx-auto rounded-xl object-contain mb-4">
                      <p class="text-[#0a8f96] text-sm font-bold">{{ 'AI_SEARCH.IMAGE.READY' | translate }}</p>
                    } @else {
                      <div class="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#0a8f96]/15 to-[#0a8f96]/5 rounded-xl flex items-center justify-center border border-[#0a8f96]/10">
                        <svg class="w-7 h-7 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                      <p class="text-gray-900 font-bold mb-1">{{ 'AI_SEARCH.IMAGE.PROMPT' | translate }}</p>
                      <p class="text-gray-400 text-xs font-bold">{{ 'AI_SEARCH.IMAGE.HINT' | translate }}</p>
                    }
                  </div>
                  <input #imageInput type="file" accept="image/*" (change)="onImageSelect($event)" class="hidden">

                  <div class="relative flex items-center gap-4">
                    <div class="flex-1 h-px bg-gray-100"></div>
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">أو حدد تفاصيل إضافية</span>
                    <div class="flex-1 h-px bg-gray-100"></div>
                  </div>

                  <div class="relative">
                    <div class="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-gray-400">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <input [(ngModel)]="imageFileUrl" class="w-full bg-gray-50 border border-gray-200 rounded-xl ps-12 pe-4 py-3.5 text-xs font-bold focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 transition-all outline-none placeholder:text-gray-400" [placeholder]="'AI_SEARCH.IMAGE.URL_PLACEHOLDER' | translate">
                  </div>
                </div>
              }
              @case (SearchInputType.Voice) {
                <div class="text-center space-y-6 py-4">
                  <div
                    class="border-2 border-dashed rounded-2xl p-12 transition-all"
                    [class]="isRecording() ? 'border-red-300 bg-red-50/50' : 'border-gray-200'"
                  >
                    <button
                      (click)="toggleRecording()"
                      [class]="isRecording() ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/20' : 'bg-[#0a8f96] hover:bg-[#076b70] shadow-[#0a8f96]/20'"
                      class="w-20 h-20 rounded-full text-white flex items-center justify-center mx-auto transition-all shadow-xl"
                    >
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                    </button>
                    <p class="text-xs mt-6 font-bold">
                      @if (isRecording()) {
                        <span class="text-red-500 animate-pulse">{{ 'AI_SEARCH.VOICE.RECORDING' | translate }}</span>
                      } @else if (audioBlob()) {
                        <span class="text-[#0a8f96]">{{ 'AI_SEARCH.VOICE.READY' | translate }} ({{ recordingDuration() }} {{ 'RELATIVE_TIME.S' | translate }})</span>
                      } @else {
                        <span class="text-gray-400">{{ 'AI_SEARCH.VOICE.PROMPT' | translate }}</span>
                      }
                    </p>
                  </div>
                  @if (audioBlob()) {
                    <div class="flex items-center gap-3 justify-center">
                      <audio [src]="audioPreviewUrl()" controls class="h-10"></audio>
                      <button (click)="clearRecording()" class="text-xs text-red-500 font-bold hover:underline">{{ 'AI_SEARCH.VOICE.CLEAR' | translate }}</button>
                    </div>
                  }
                </div>
              }
              @case (SearchInputType.Text) {
                <div class="space-y-6">
                  <div class="relative">
                    <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <input
                      [(ngModel)]="rawQuery"
                      class="w-full bg-gray-50 border border-gray-200 rounded-xl pr-12 pl-4 py-3.5 text-xs font-bold focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 transition-all outline-none placeholder:text-gray-400"
                      [placeholder]="'AI_SEARCH.TEXT_PLACEHOLDER' | translate"
                    >
                  </div>
                </div>
              }
            }

            <!-- Advanced Filters Context -->
            <div class="mt-8 pt-8 border-t border-gray-50">
              <button (click)="showFilters.set(!showFilters())" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#0a8f96] transition-colors mb-6">
                <svg class="w-4 h-4 transition-transform" [class.rotate-180]="showFilters()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                {{ 'AI_SEARCH.ADVANCED_FILTERS' | translate }}
              </button>

              @if (showFilters()) {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-3">{{ 'PROPERTY_FORM.LOCATION' | translate }}</label>
                    <div class="grid grid-cols-1 gap-3">
                      <div class="relative" (click)="$event.stopPropagation()">
                        <div (click)="showCityDropdown.set(!showCityDropdown())" 
                             class="bg-gray-50 rounded-xl text-xs font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                          <span [class.text-gray-400]="!filters.city">{{ filters.city || ('PROPERTY_FORM.CITY' | translate) }}</span>
                          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                        @if (showCityDropdown()) {
                          <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 max-h-48 overflow-y-auto custom-scrollbar animate-slide-up">
                            @for (city of cities; track city) {
                              <button (click)="selectCity(city)" class="w-full px-6 py-2 text-right hover:bg-gray-50 text-xs font-bold transition-all">{{ city }}</button>
                            }
                          </div>
                        }
                      </div>
                      <div class="relative" (click)="$event.stopPropagation()">
                        <div (click)="showDistrictDropdown.set(!showDistrictDropdown())" 
                             class="bg-gray-50 rounded-xl text-xs font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                          <span [class.text-gray-400]="!filters.district">{{ filters.district || ('PROPERTY_FORM.DISTRICT' | translate) }}</span>
                          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                        </div>
                        @if (showDistrictDropdown()) {
                          <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 max-h-48 overflow-y-auto custom-scrollbar animate-slide-up">
                            @for (district of getDistricts(); track district) {
                              <button (click)="selectDistrict(district)" class="w-full px-6 py-2 text-right hover:bg-gray-50 text-xs font-bold transition-all">{{ district }}</button>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase mb-3">{{ 'PROPERTY_FORM.TYPE' | translate }}</label>
                    <div class="relative" (click)="$event.stopPropagation()">
                      <div (click)="showTypeDropdown.set(!showTypeDropdown())" 
                           class="bg-gray-50 rounded-xl text-xs font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                        <span [class.text-gray-400]="!filters.propertyType">{{ getSelectedTypeLabel() }}</span>
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                      @if (showTypeDropdown()) {
                        <div class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 max-h-48 overflow-y-auto custom-scrollbar animate-slide-up">
                          <button (click)="selectType('')" class="w-full px-6 py-2 text-right hover:bg-gray-50 text-xs font-bold transition-all">{{ 'COMMON.ALL' | translate }}</button>
                          @for (type of propertyTypes; track type.id) {
                            <button (click)="selectType(type.id)" class="w-full px-6 py-2 text-right hover:bg-gray-50 text-xs font-bold transition-all flex items-center justify-between">
                              <span class="opacity-50">{{ type.icon }}</span>
                              <span>{{ type.label }}</span>
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </div>
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

            <!-- Search Button -->
            <button (click)="search()" [disabled]="searching() || !canSearch()"
                    class="btn-luxury w-full py-4 mt-8 disabled:opacity-50 disabled:cursor-not-allowed">
              @if (searching()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {{ searchStepMessage() | translate }}
              } @else {
                {{ 'AI_SEARCH.SEARCH_BTN' | translate }}
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              }
            </button>

            @if (searching()) {
              <div class="mt-4">
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-[#0a8f96] to-[#0a8f96]/60 rounded-full transition-all duration-1000 ease-out" [style.width.%]="searchProgress()"></div>
                </div>
                <p class="text-xs text-gray-400 mt-2 text-center">{{ searchStepMessage() | translate }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Results -->
      @if (result(); as r) {
        <div class="max-w-3xl mx-auto px-4 md:px-8 pb-16">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-black text-gray-900">{{ 'AI_SEARCH.RESULTS_TITLE' | translate }}</h2>
            <span class="text-[10px] font-black uppercase tracking-widest text-[#0a8f96] bg-[#0a8f96]/5 px-4 py-2 rounded-xl shadow-sm border border-[#0a8f96]/10">{{ r.status === 'Completed' ? ('AI_SEARCH.SEARCH_DONE' | translate) : r.status }} — {{ 'AI_SEARCH.FOUND' | translate }} {{ r.resultCount }}</span>
          </div>

          @if (r.results && r.results.length > 0) {
            <div class="space-y-4">
              @for (sr of r.results; track sr.propertyId) {
                <a [routerLink]="['/properties', sr.propertyId]" class="block bg-white rounded-2xl border border-gray-100/80 p-6 hover:shadow-lg hover:shadow-[#0a8f96]/5 hover:-translate-y-0.5 transition-all duration-300">
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
            <div class="text-center py-16 text-gray-400">
              <p class="text-lg font-black text-gray-900">{{ 'AI_SEARCH.NO_RESULTS' | translate }}</p>
              <p class="text-xs font-bold mt-2">{{ 'AI_SEARCH.TRY_DIFFERENT' | translate }}</p>
            </div>
          }
        </div>
      }

      <!-- Smart Suggestions -->
      @if (!result() && showSuggestions()) {
        <div class="max-w-5xl mx-auto px-4 md:px-8 pb-20">
          <h2 class="text-xl font-black text-gray-900 mb-8">اقتراحات ذكية لك</h2>
          <div class="grid md:grid-cols-3 gap-6">
            <!-- waterfront Living -->
            <div class="group cursor-pointer">
              <div class="relative overflow-hidden rounded-2xl mb-4">
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80" class="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute top-3 left-3">
                  <span class="bg-[#0a8f96] text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">High Match</span>
                </div>
              </div>
              <h3 class="font-bold text-gray-900 mb-1">Contemporary Estates</h3>
              <p class="text-sm text-gray-500 leading-relaxed mb-3">Similar to your previous searches focusing on open-plan living and expansive glass...</p>
              <a routerLink="/properties" class="text-[#0a8f96] text-sm font-bold hover:underline inline-flex items-center gap-1">
                Explore Collection
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      }

    </div>
  `,
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
  showSuggestions = signal(false); // Default to false

  filters = {
    city: '',
    district: '',
    propertyType: undefined as any,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    minBedrooms: undefined as number | undefined,
    maxBedrooms: undefined as number | undefined,
  };

  modes = [
    { value: SearchInputType.Image, label: 'AI_SEARCH.MODES.Image' },
    { value: SearchInputType.Voice, label: 'AI_SEARCH.MODES.Voice' },
    { value: SearchInputType.Text, label: 'AI_SEARCH.MODES.Text' },
  ];

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
    if (this.inputType === SearchInputType.Text) return !!this.rawQuery.trim();
    if (this.inputType === SearchInputType.Voice) return !!this.audioBlob();
    if (this.inputType === SearchInputType.Image) return !!this.imageFile || !!this.imageFileUrl.trim();
    return false;
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
      this.recordingTimer = setInterval(() => {
        this.secondsElapsed++;
        this.recordingDuration.set(this.secondsElapsed);
      }, 1000);
    } catch {
      this.toast.error('Could not access microphone. Please allow microphone permission.');
    }
  }

  private stopRecording() {
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

    try {
      let audioFileUrl: string | undefined;
      let imageFileUrl: string | undefined;

      if (this.inputType === SearchInputType.Voice && this.audioBlob()) {
        audioFileUrl = await this.blobToBase64(this.audioBlob()!);
      }

      if (this.inputType === SearchInputType.Image) {
        if (this.imageFile) {
          // Add a tiny delay to allow the "Analyzing" message to render before heavy canvas work
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
        rawQuery: this.inputType === SearchInputType.Text ? this.rawQuery.trim() : undefined,
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
