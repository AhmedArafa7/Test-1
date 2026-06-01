import { Component, signal, OnInit, HostListener, AfterViewInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PropertyService } from '../services/property.service';
import { PropertyListItem, GetPropertiesParams, Property } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LocalImageService } from '../../../core/services/local-image.service';
import { DecimalPipe, CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { resolveBackendAssetUrl } from '../../../core/utils/media';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as L from 'leaflet';
import { EGYPT_REGIONS, Governorate, City } from '../../../core/constants/egypt-regions';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [FormsModule, RouterLink, PaginationComponent, SkeletonLoaderComponent, EmptyStateComponent, DecimalPipe, CurrencyEgpPipe, TranslateModule, CommonModule],
  template: `
    <div class="min-h-[calc(100vh-72px)] bg-white font-sans flex flex-col lg:flex-row-reverse text-gray-800 relative">
      
      <!-- Filters Sidebar (Floating Overlay) -->
      @if (showFilters()) {
        <div class="absolute inset-0 z-[100] flex justify-end">
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" (click)="showFilters.set(false)"></div>
          <div class="relative w-full max-w-md h-full bg-white shadow-2xl p-8 overflow-y-auto animate-slide-left">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-3">
                <div class="w-1.5 h-6 bg-[#0a8f96] rounded-full"></div>
                <h2 class="text-xl font-black text-gray-900">{{ 'PROPERTY_LIST.SIDEBAR_TITLE' | translate }}</h2>
              </div>
              <button (click)="showFilters.set(false)" class="p-2 hover:bg-gray-50 rounded-xl text-gray-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="space-y-8">
              <!-- Listing Type -->
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'PROPERTY_LIST.LABEL_LISTING' | translate }}</label>
                <div class="grid grid-cols-2 gap-3">
                  <button (click)="filters.listingType = 'Sale'" 
                          [class.bg-[#0a8f96]]="filters.listingType === 'Sale'" [class.text-white]="filters.listingType === 'Sale'"
                          class="py-3 rounded-xl text-sm font-bold border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-all">
                    {{ 'PROPERTY.LISTING_TYPES.Sale' | translate }}
                  </button>
                  <button (click)="filters.listingType = 'Rent'" 
                          [class.bg-[#0a8f96]]="filters.listingType === 'Rent'" [class.text-white]="filters.listingType === 'Rent'"
                          class="py-3 rounded-xl text-sm font-bold border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-all">
                    {{ 'PROPERTY.LISTING_TYPES.Rent' | translate }}
                  </button>
                </div>
              </div>

              <!-- Location -->
              <div class="grid grid-cols-1 gap-6">
                <div style="position: relative;" (click)="$event.stopPropagation()">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'PROPERTY_LIST.LABEL_CITY' | translate }}</label>
                  <div (click)="showCityDropdown.set(!showCityDropdown())" 
                       class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                     <span [class.text-gray-400]="!filters.city">{{ filters.city ? getCityLabel(filters.city) : ('PROPERTY_LIST.PLACEHOLDER_CITY' | translate) }}</span>
                    <svg [class.rotate-180]="showCityDropdown()" class="w-4 h-4 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                  
                  @if (showCityDropdown()) {
                    <div style="position:absolute; top:100%; left:0; right:0; margin-top:4px; z-index:9999; max-height:240px; overflow-y:auto; background:white; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.12); border:1px solid #f1f5f9;" class="custom-scrollbar animate-slide-up py-2">
                      <!-- All Cities option -->
                      <button type="button" (click)="selectCity('')" 
                              class="w-full px-6 py-2.5 text-start hover:bg-slate-50 text-xs font-black text-[#0a8f96] transition-all">
                        {{ translate.currentLang === 'ar' ? 'كل المحافظات والمدن (الكل)' : 'All Governorates & Cities' }}
                      </button>
                      <div class="w-full border-t border-slate-100 my-1"></div>
                      
                      @for (gov of egyptRegions; track gov.id) {
                        <div class="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                          {{ translate.currentLang === 'ar' ? gov.nameAr : gov.nameEn }}
                        </div>
                        <!-- Option for All Cities in this Governorate -->
                        <button type="button" (click)="selectCity(gov.id)" 
                                class="w-full px-8 py-2 text-start hover:bg-[#0a8f96]/5 text-xs font-black text-[#0a8f96] transition-all">
                          {{ translate.currentLang === 'ar' ? 'كل مدن ' + gov.nameAr : 'All ' + gov.nameEn }}
                        </button>
                        
                        @for (city of gov.cities; track city.id) {
                          @if (city.id !== gov.id) {
                            <button type="button" (click)="selectCity(city.id)" 
                                    class="w-full px-10 py-2 text-start hover:bg-slate-50 text-xs font-bold text-gray-700 transition-all">
                              {{ translate.currentLang === 'ar' ? city.nameAr : city.nameEn }}
                            </button>
                          }
                        }
                      }
                    </div>
                  }
                </div>

                <div style="position: relative;" (click)="$event.stopPropagation()">
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'PROPERTY_LIST.LABEL_DISTRICT' | translate }}</label>
                  <div (click)="showDistrictDropdown.set(!showDistrictDropdown())" 
                       class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                     <span [class.text-gray-400]="!filters.district">{{ filters.district ? ('DISTRICTS.' + filters.district | translate) : ('PROPERTY_LIST.PLACEHOLDER_DISTRICT' | translate) }}</span>
                    <svg [class.rotate-180]="showDistrictDropdown()" class="w-4 h-4 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>

                  @if (showDistrictDropdown()) {
                    <div style="position:absolute; top:100%; left:0; right:0; margin-top:4px; z-index:9999; max-height:240px; overflow-y:auto; background:white; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.12); border:1px solid #f1f5f9;" class="custom-scrollbar animate-slide-up py-2">
                      @for (district of getDistricts(); track district) {
                        <button type="button" (click)="selectDistrict(district)" 
                                class="w-full px-6 py-2.5 text-start hover:bg-gray-50 text-sm font-bold transition-all text-gray-700">
                          {{ 'DISTRICTS.' + district | translate }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Property Type -->
              <div style="position: relative;" (click)="$event.stopPropagation()">
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'PROPERTY_LIST.LABEL_TYPE' | translate }}</label>
                <div (click)="showTypeDropdown.set(!showTypeDropdown())" 
                     class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all">
                   <span [class.text-gray-400]="!filters.propertyType">{{ getSelectedTypeLabel() | translate }}</span>
                  <svg [class.rotate-180]="showTypeDropdown()" class="w-4 h-4 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>

                @if (showTypeDropdown()) {
                  <div style="position:absolute; top:100%; left:0; right:0; margin-top:4px; z-index:9999; max-height:240px; overflow-y:auto; background:white; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.12); border:1px solid #f1f5f9;" class="custom-scrollbar animate-slide-up py-2">
                    <button type="button" (click)="selectType('')" class="w-full px-6 py-2.5 text-start hover:bg-gray-50 text-sm font-bold transition-all text-gray-700">{{ 'PROPERTY_LIST.QUICK_ALL' | translate }}</button>
                    @for (type of propertyTypes; track type.id) {
                      <button type="button" (click)="selectType(type.id)" 
                              class="w-full px-6 py-2.5 text-start hover:bg-gray-50 text-sm font-bold transition-all flex items-center gap-3 text-gray-700">
                        <span class="text-xs opacity-50">{{ type.icon }}</span>
                        <span>{{ type.label | translate }}</span>
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Bedrooms -->
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'PROPERTY_LIST.LABEL_BEDS' | translate }}</label>
                <div class="flex flex-wrap gap-2 mb-3">
                  @for (count of [1, 2, 3, 4, 5]; track count) {
                    <button (click)="filters.minBedrooms = count" 
                            [class.bg-gray-900]="filters.minBedrooms === count" [class.text-white]="filters.minBedrooms === count"
                            class="w-12 h-12 rounded-xl text-sm font-black border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-all">
                      {{ count }}+
                    </button>
                  }
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <input type="number" min="0" [(ngModel)]="filters.minBedrooms" [placeholder]="'PROPERTY_LIST.PLACEHOLDER_MIN' | translate" class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-3">
                  <input type="number" min="0" [(ngModel)]="filters.maxBedrooms" [placeholder]="'PROPERTY_LIST.PLACEHOLDER_MAX' | translate" class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-3">
                </div>
              </div>

              <!-- Price Range -->
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'PROPERTY_LIST.LABEL_PRICE' | translate }}</label>
                <div class="grid grid-cols-2 gap-4">
                  <input type="number" min="0" [(ngModel)]="filters.minPrice" [placeholder]="'PROPERTY_LIST.PLACEHOLDER_MIN' | translate" class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-3">
                  <input type="number" min="0" [(ngModel)]="filters.maxPrice" [placeholder]="'PROPERTY_LIST.PLACEHOLDER_MAX' | translate" class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-3">
                </div>
              </div>

              <!-- Area Range -->
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{{ 'PROPERTY_LIST.LABEL_AREA' | translate }}</label>
                <div class="grid grid-cols-2 gap-4">
                  <input type="number" min="0" [(ngModel)]="filters.minArea" [placeholder]="'PROPERTY_LIST.PLACEHOLDER_MIN' | translate" class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-3">
                  <input type="number" min="0" [(ngModel)]="filters.maxArea" [placeholder]="'PROPERTY_LIST.PLACEHOLDER_MAX' | translate" class="w-full bg-gray-50 border-gray-100 rounded-xl text-sm font-bold p-3">
                </div>
              </div>

              <div class="pt-8 border-t border-gray-50">
                <button (click)="search(); showFilters.set(false)" 
                        [disabled]="!isFiltersValid()"
                        [class.opacity-50]="!isFiltersValid()"
                        [class.cursor-not-allowed]="!isFiltersValid()"
                        class="w-full bg-[#0a8f96] text-white py-4 rounded-2xl font-black shadow-xl shadow-[#0a8f96]/20 hover:scale-[1.02] active:scale-95 transition-all mb-4 disabled:hover:scale-100 disabled:active:scale-100">
                  {{ 'PROPERTY_LIST.APPLY_BTN' | translate }}
                </button>
                <button (click)="resetFilters()" class="w-full py-4 text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                  {{ 'PROPERTY_LIST.RESET_BTN' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      
      <!-- Right Column: Properties List (Main Content) -->
      <div class="w-full lg:w-[60%] xl:w-[55%] flex flex-col bg-white border-l border-gray-100 relative z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        
        <!-- Header & Top Filters -->
        <div class="px-8 py-6 bg-white sticky top-[72px] lg:top-0 z-20">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 class="text-2xl font-black text-gray-900 tracking-tight">
                @if (filters.agentUserId === auth.userId()) {
                  {{ 'PROPERTY_LIST.TITLE_MY' | translate }}
                } @else {
                  {{ (filters.city ? 'PROPERTY_LIST.TITLE_CITY' : 'PROPERTY_LIST.TITLE_ALL') | translate:{ city: filters.city } }}
                }
              </h1>
              <p class="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">
                {{ 'PROPERTY_LIST.COUNT_LABEL' | translate:{ count: properties().length, total: totalCount() } }}
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <button (click)="showFilters.set(true)" class="flex items-center gap-2 bg-[#0a8f96] text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg shadow-[#0a8f96]/20 hover:bg-[#076b70] transition-all active:scale-95">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                {{ 'PROPERTY_LIST.FILTERS_BTN' | translate }}
              </button>
            </div>
          </div>

          <!-- Horizontal Quick Filters -->
          <div class="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
            <button (click)="filters.propertyType = ''; search()" 
                    [class.bg-gray-900]="!filters.propertyType" [class.text-white]="!filters.propertyType"
                    class="shrink-0 px-5 py-2 rounded-full text-xs font-bold border border-gray-100 transition-all">
              {{ 'PROPERTY_LIST.QUICK_ALL' | translate }}
            </button>
            <button (click)="filters.propertyType = 'Apartment'; search()" 
                    [class.bg-gray-900]="filters.propertyType === 'Apartment'" [class.text-white]="filters.propertyType === 'Apartment'"
                    class="shrink-0 px-5 py-2 rounded-full text-xs font-bold border border-gray-100 text-gray-500 bg-gray-50/50 hover:bg-gray-100 transition-all">
              {{ 'PROPERTY_LIST.QUICK_APARTMENTS' | translate }}
            </button>
            <button (click)="filters.propertyType = 'Villa'; search()" 
                    [class.bg-gray-900]="filters.propertyType === 'Villa'" [class.text-white]="filters.propertyType === 'Villa'"
                    class="shrink-0 px-5 py-2 rounded-full text-xs font-bold border border-gray-100 text-gray-500 bg-gray-50/50 hover:bg-gray-100 transition-all">
              {{ 'PROPERTY_LIST.QUICK_VILLAS' | translate }}
            </button>
            <button (click)="filters.propertyType = 'Office'; search()" 
                    [class.bg-gray-900]="filters.propertyType === 'Office'" [class.text-white]="filters.propertyType === 'Office'"
                    class="shrink-0 px-5 py-2 rounded-full text-xs font-bold border border-gray-100 text-gray-500 bg-gray-50/50 hover:bg-gray-100 transition-all">
              {{ 'PROPERTY_LIST.QUICK_OFFICES' | translate }}
            </button>
            <button (click)="filters.propertyType = 'Land'; search()" 
                    [class.bg-gray-900]="filters.propertyType === 'Land'" [class.text-white]="filters.propertyType === 'Land'"
                    class="shrink-0 px-5 py-2 rounded-full text-xs font-bold border border-gray-100 text-gray-500 bg-gray-50/50 hover:bg-gray-100 transition-all">
              {{ 'PROPERTY_LIST.QUICK_LANDS' | translate }}
            </button>
          </div>
        </div>

        <!-- Properties Grid Area -->
        <div class="flex-1 overflow-y-auto p-8 pt-2 bg-[#fcfcfc]">
          @if (loading()) { 
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              @for (i of [1,2,3,4]; track i) {
                <app-skeleton-loader type="card" containerClass="h-[400px]" />
              }
            </div>
            <div class="flex flex-col items-center justify-center py-10">
              <p class="text-[10px] font-black text-[#0a8f96] uppercase tracking-[0.4em] animate-pulse">{{ 'PROPERTY_LIST.LOADING_DB' | translate }}</p>
            </div> 
          }
          @else if (properties().length === 0) { 
            <div class="py-20">
              <app-empty-state 
                icon="🏠" 
                [title]="'PROPERTY_LIST.EMPTY_TITLE' | translate" 
                [message]="'PROPERTY_LIST.EMPTY_MSG' | translate" /> 
            </div>
          }
          @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              @for (p of properties(); track p.id; let i = $index) {
                <div [class.ring-2]="isCompared(p.id)"
                     [class.ring-[#0a8f96]]="isCompared(p.id)"
                     [class.border-[#0a8f96]/30]="isCompared(p.id)"
                     class="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-[#0a8f96]/5 transition-all duration-500 flex flex-col relative">
                  
                  <!-- Property Image Wrapper -->
                  <div class="relative h-[240px] overflow-hidden">
                    <!-- Badges -->
                    <div class="absolute top-5 end-5 z-10 flex flex-col gap-2">
                      @if (p.isFeatured) {
                        <span class="bg-yellow-400 text-gray-900 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg shadow-lg border border-yellow-500/20 flex items-center gap-1.5 animate-pulse">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          {{ 'PROPERTY.FEATURED' | translate }}
                        </span>
                      }
                      <span class="bg-white/95 backdrop-blur-md text-[#0a8f96] text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg shadow-sm border border-[#0a8f96]/10">
                        {{ 'PROPERTY.LISTING_TYPES.' + p.listingType | translate }}
                      </span>
                      @if (p.status !== 'Active') {
                        <span class="bg-gray-900/80 backdrop-blur-md text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg">
                          {{ 'PROPERTY.STATUSES.' + p.status | translate }}
                        </span>
                      }
                    </div>

                    <!-- Favorite Button -->
                    @if (auth.isBuyer()) {
                      <button (click)="$event.preventDefault(); toggleSave(p.id)" 
                              class="absolute top-5 start-5 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-sm border border-white hover:scale-110 active:scale-95">
                        <svg class="w-5 h-5" [class.fill-red-500]="propertyService.savedIds().has(p.id)" [class.text-red-500]="propertyService.savedIds().has(p.id)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      </button>
                    }

                    <!-- Compare Toggle Button -->
                    <button (click)="$event.preventDefault(); toggleCompare(p)" 
                            [class.bg-[#0a8f96]]="isCompared(p.id)"
                            [class.text-white]="isCompared(p.id)"
                            [class.border-[#0a8f96]]="isCompared(p.id)"
                            class="absolute top-5 start-17 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-500 hover:text-[#0a8f96] hover:border-[#0a8f96]/30 transition-all shadow-sm border border-white hover:scale-110 active:scale-95 cursor-pointer"
                            [title]="'المقارنة جنبًا إلى جنب'">
                      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </button>

                    <a [routerLink]="['/properties', p.id]" class="block w-full h-full">
                      @if (getListImage(p)) {
                        <img [src]="getListImage(p)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" (error)="$event.target.style.display='none'">
                      }
                      <div class="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-[#0a8f96]/10">
                        <svg class="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                        <span class="text-[8px] font-black uppercase tracking-widest opacity-30">Baytology Premium</span>
                      </div>
                    </a>
                  </div>
                  
                  <!-- Property Details Card Body -->
                  <div class="p-7 flex-1 flex flex-col">
                    <div class="flex items-center justify-between mb-4">
                      <span class="text-[10px] font-black text-[#0a8f96] uppercase tracking-tighter bg-[#0a8f96]/5 px-2.5 py-1 rounded-md">
                        {{ 'PROPERTY.TYPES.' + p.propertyType | translate }}
                      </span>
                    </div>

                    <a [routerLink]="['/properties', p.id]" class="text-xl font-black text-gray-900 hover:text-[#0a8f96] transition-colors mb-2 block leading-tight">{{ p.title }}</a>
                    
                    <p class="text-[13px] text-gray-400 font-medium flex items-center gap-1.5 mb-6">
                      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ getDistrictLabel(p.district) }}{{ p.city ? ', ' + getCityLabel(p.city) : '' }}
                    </p>

                    <!-- Property Stats -->
                    <div class="grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
                      <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ 'PROPERTY_DETAIL.BEDROOMS' | translate }}</span>
                        <span class="text-sm font-black text-gray-900">{{ p.bedrooms }}</span>
                      </div>
                      <div class="flex flex-col border-s border-gray-50 ps-4">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ 'PROPERTY_DETAIL.BATHROOMS' | translate }}</span>
                        <span class="text-sm font-black text-gray-900">{{ p.bathrooms }}</span>
                      </div>
                      <div class="flex flex-col border-s border-gray-50 ps-4">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{{ 'PROPERTY_DETAIL.AREA' | translate }}</span>
                        <span class="text-sm font-black text-gray-900">{{ p.area | number }} <small class="text-[10px] font-normal text-gray-400">{{ 'PROPERTY.AREA_UNIT' | translate }}</small></span>
                      </div>
                    </div>

                    <div class="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-[#0a8f96] uppercase tracking-widest leading-none mb-1">{{ 'PROPERTY_DETAIL.EXCLUSIVE_PRICE' | translate }}</span>
                        <span class="text-2xl font-black text-gray-900 tracking-tighter">{{ p.price | currencyEgp }}</span>
                      </div>
                      
                      <div class="flex items-center gap-2">
                        @if (p.agentUserId === auth.userId()) {
                          <a [routerLink]="['/properties', p.id, 'edit']" class="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-[#0a8f96] hover:text-white transition-all">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </a>
                          <button (click)="deleteProperty(p.id); $event.stopPropagation()" class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        }
                        <a [routerLink]="['/properties', p.id]" class="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:bg-[#0a8f96] transition-all hover:scale-105 active:scale-95 shadow-xl">
                          <svg class="w-5 h-5 ltr:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
            
            <div class="mt-16 pb-12 flex justify-center">
              <app-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" (pageChange)="goToPage($event)" />
            </div>
          }
        </div>
      </div>

      <!-- Left Column: Map Preview -->
      <div class="hidden lg:block flex-1 sticky top-[72px] h-[calc(100vh-72px)] bg-[#f0f4f4] relative overflow-hidden group">
        <!-- Real Leaflet Map Container -->
        <div id="map" class="w-full h-full z-0"></div>
        
        <!-- Map Footer Floating Control -->
        <div class="absolute bottom-10 start-10 z-20 flex gap-2">
          <button (click)="locateUser()" class="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white text-gray-900 hover:bg-[#0a8f96] hover:text-white transition-all active:scale-90">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </button>
        </div>
      </div>

      <!-- Floating Comparison Tray -->
      @if (selectedPropertiesForCompare().length > 0) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex items-center justify-between gap-4 animate-slide-up select-none">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full bg-[#0a8f96]/10 text-[#0a8f96] flex items-center justify-center font-black text-sm select-none animate-scale-in">
              {{ selectedPropertiesForCompare().length }}
            </span>
            <div class="text-right">
              <h3 class="text-xs font-black text-slate-800 leading-none mb-1">{{ 'COMPARE.TRAY_TITLE' | translate }}</h3>
              <p class="text-[9px] text-slate-400 font-bold">{{ 'COMPARE.TRAY_HELP' | translate }}</p>
            </div>
          </div>
          
          <!-- Selected Thumbnails -->
          <div class="hidden sm:flex items-center gap-2 overflow-hidden max-w-[200px]">
            @for (item of selectedPropertiesForCompare(); track item.id) {
              <div class="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0 group/thumb animate-scale-in">
                <img [src]="item.primaryImageUrl || '/assets/logo.svg'" class="w-full h-full object-cover">
                <button (click)="toggleCompare(item)" class="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer">
                  <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            }
          </div>

          <div class="flex items-center gap-2">
            <button (click)="clearAllCompare()" class="px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
              {{ 'COMPARE.CLEAR' | translate }}
            </button>
            <button (click)="openCompareModal()" 
                    [disabled]="selectedPropertiesForCompare().length < 2"
                    [class.opacity-50]="selectedPropertiesForCompare().length < 2"
                    class="bg-[#0a8f96] hover:bg-[#076b70] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-[#0a8f96]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:cursor-not-allowed">
              {{ 'COMPARE.BTN_COMPARE' | translate }}
            </button>
          </div>
        </div>
      }

      <!-- Full-Screen Glassmorphic Comparison Matrix Modal -->
      @if (showCompareModal()) {
        <div class="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none animate-fade-in" dir="rtl">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-md" (click)="showCompareModal.set(false)"></div>
          
          <!-- Modal Body -->
          <div class="relative w-full max-w-5xl h-[85vh] bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_30px_70px_rgba(0,0,0,0.2)] rounded-[32px] overflow-hidden flex flex-col animate-slide-up">
            
            <!-- Modal Header -->
            <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-[#0a8f96]/10 flex items-center justify-center text-lg">⚖️</div>
                <div>
                  <h2 class="text-lg font-black text-slate-900 leading-none mb-1">{{ 'COMPARE.MATRIX_TITLE' | translate }}</h2>
                  <p class="text-[10px] text-slate-400 font-bold">{{ 'COMPARE.MATRIX_SUBTITLE' | translate }}</p>
                </div>
              </div>
              <button (click)="showCompareModal.set(false)" class="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Modal Content (Scrollable Matrix) -->
            <div class="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-slate-50/30">
              @if (loadingCompareDetails()) {
                <!-- Skeleton Loader for Matrix -->
                <div class="space-y-4 animate-pulse">
                  <div class="grid grid-cols-[140px_1fr_1fr] md:grid-cols-[180px_1fr_1fr_1fr] gap-4">
                    <div class="h-10 bg-slate-100 rounded-xl"></div>
                    <div class="h-40 bg-slate-100 rounded-2xl"></div>
                    <div class="h-40 bg-slate-100 rounded-2xl"></div>
                    <div class="h-40 bg-slate-100 rounded-2xl hidden md:block"></div>
                  </div>
                  @for (row of [1,2,3,4,5,6]; track row) {
                    <div class="grid grid-cols-[140px_1fr_1fr] md:grid-cols-[180px_1fr_1fr_1fr] gap-4 border-t border-slate-50 pt-4">
                      <div class="h-6 bg-slate-100 rounded-lg w-20"></div>
                      <div class="h-6 bg-slate-50 rounded-lg"></div>
                      <div class="h-6 bg-slate-50 rounded-lg"></div>
                      <div class="h-6 bg-slate-50 rounded-lg hidden md:block"></div>
                    </div>
                  }
                </div>
              } @else {
                <!-- Comparison Matrix Grid Table -->
                <div class="overflow-x-auto min-w-full">
                  <div class="grid gap-y-0 gap-x-6 min-w-[700px] divide-y divide-slate-100"
                       [style.grid-template-columns]="'140px repeat(' + comparedPropertiesDetails().length + ', 1fr)'">
                    
                    <!-- Row 1: Property Images & Titles -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.PROPERTY' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 relative flex flex-col group/col">
                          <!-- Delete Column button -->
                          <button (click)="removeComparedProperty(p.id)" class="absolute top-2 left-2 z-10 w-7 h-7 bg-white/95 rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer" [title]="'COMPARE.REMOVE' | translate">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                          
                          <!-- Property Visual Thumbnail -->
                          <div class="w-full h-32 rounded-2xl overflow-hidden border border-slate-100 mb-3 relative bg-slate-50">
                            <img [src]="getCompareImage(p)" class="w-full h-full object-cover">
                            <span class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md text-[9px] font-black px-2 py-0.5 rounded text-[#0a8f96] border border-[#0a8f96]/10">
                              {{ 'PROPERTY.TYPES.' + p.propertyType | translate }}
                            </span>
                          </div>
                          
                          <a [routerLink]="['/properties', p.id]" (click)="showCompareModal.set(false)" class="text-sm font-black text-slate-900 hover:text-[#0a8f96] transition-colors leading-tight line-clamp-2">{{ p.title }}</a>
                        </div>
                      }
                    </div>

                    <!-- Row 2: Price -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.PRICE' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 text-lg font-black text-[#0a8f96] tracking-tight flex items-center">
                          {{ p.price | currencyEgp }}
                        </div>
                      }
                    </div>

                    <!-- Row 3: City & District -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.LOCATION' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <span>{{ getDistrictLabel(p.district) }}، {{ getCityLabel(p.city) }}</span>
                        </div>
                      }
                    </div>

                    <!-- Row 4: Area -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.AREA' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 text-sm font-black text-slate-900 flex items-center">
                          {{ p.area | number }} <span class="text-[10px] font-normal text-slate-400 mr-1">{{ 'PROPERTY.AREA_UNIT' | translate }}</span>
                        </div>
                      }
                    </div>

                    <!-- Row 5: Bedrooms & Bathrooms -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.ROOMS_BATHS' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 text-xs font-bold text-slate-700 flex items-center gap-4">
                          <div class="flex items-center gap-1">
                            <span class="text-slate-400">🛏️</span>
                            <span>{{ p.bedrooms }} {{ 'COMPARE.ROOMS' | translate }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <span class="text-slate-400">🛁</span>
                            <span>{{ p.bathrooms }} {{ 'COMPARE.BATHS' | translate }}</span>
                          </div>
                        </div>
                      }
                    </div>

                    <!-- Row 6: Listing Type & Status -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.TYPE_STATUS' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 flex items-center gap-2">
                          <span class="bg-[#0a8f96]/5 text-[#0a8f96] text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md border border-[#0a8f96]/10">
                            {{ 'PROPERTY.LISTING_TYPES.' + p.listingType | translate }}
                          </span>
                          <span class="bg-slate-100 text-slate-500 text-[9px] font-black tracking-wider px-2 py-0.5 rounded border border-slate-100">
                            {{ 'PROPERTY.STATUSES.' + p.status | translate }}
                          </span>
                        </div>
                      }
                    </div>

                    <!-- Row 7: Furnishing & View -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.FURNISHING_VIEW' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 text-xs font-bold text-slate-700 flex items-center gap-3">
                          <span class="bg-amber-500/5 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-md border border-amber-500/10">
                            {{ getFurnishingLabel(p.amenity?.furnishingStatus) }}
                          </span>
                          <span class="bg-blue-500/5 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-md border border-blue-500/10">
                            👀 {{ getViewTypeLabel(p.amenity?.viewType) }}
                          </span>
                        </div>
                      }
                    </div>

                    <!-- Row 8: Parking -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.PARKING' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 flex items-center">
                          @if (p.amenity?.hasParking) {
                            <span class="text-emerald-500 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> {{ 'COMPARE.AVAILABLE' | translate }}</span>
                          } @else {
                            <span class="text-slate-300 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-slate-300"></span> {{ 'COMPARE.UNAVAILABLE' | translate }}</span>
                          }
                        </div>
                      }
                    </div>

                    <!-- Row 9: Swimming Pool -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.POOL' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 flex items-center">
                          @if (p.amenity?.hasPool) {
                            <span class="text-emerald-500 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> {{ 'COMPARE.AVAILABLE' | translate }}</span>
                          } @else {
                            <span class="text-slate-300 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-slate-300"></span> {{ 'COMPARE.UNAVAILABLE' | translate }}</span>
                          }
                        </div>
                      }
                    </div>

                    <!-- Row 10: Gym -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.GYM' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 flex items-center">
                          @if (p.amenity?.hasGym) {
                            <span class="text-emerald-500 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> {{ 'COMPARE.AVAILABLE' | translate }}</span>
                          } @else {
                            <span class="text-slate-300 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-slate-300"></span> {{ 'COMPARE.UNAVAILABLE' | translate }}</span>
                          }
                        </div>
                      }
                    </div>

                    <!-- Row 11: Elevator -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.ELEVATOR' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 flex items-center">
                          @if (p.amenity?.hasElevator) {
                            <span class="text-emerald-500 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> {{ 'COMPARE.AVAILABLE' | translate }}</span>
                          } @else {
                            <span class="text-slate-300 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-slate-300"></span> {{ 'COMPARE.UNAVAILABLE' | translate }}</span>
                          }
                        </div>
                      }
                    </div>

                    <!-- Row 12: Balcony -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.BALCONY' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 flex items-center">
                          @if (p.amenity?.hasBalcony) {
                            <span class="text-emerald-500 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> {{ 'COMPARE.AVAILABLE' | translate }}</span>
                          } @else {
                            <span class="text-slate-300 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-slate-300"></span> {{ 'COMPARE.UNAVAILABLE' | translate }}</span>
                          }
                        </div>
                      }
                    </div>

                    <!-- Row 13: Garden -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.GARDEN' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 flex items-center">
                          @if (p.amenity?.hasGarden) {
                            <span class="text-emerald-500 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> {{ 'COMPARE.AVAILABLE' | translate }}</span>
                          } @else {
                            <span class="text-slate-300 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-slate-300"></span> {{ 'COMPARE.UNAVAILABLE' | translate }}</span>
                          }
                        </div>
                      }
                    </div>

                    <!-- Row 14: Central AC -->
                    <div class="contents">
                      <div class="py-4 text-xs font-black text-slate-400 flex items-center">{{ 'COMPARE.AC' | translate }}</div>
                      @for (p of comparedPropertiesDetails(); track p.id) {
                        <div class="py-4 flex items-center">
                          @if (p.amenity?.hasCentralAC) {
                            <span class="text-emerald-500 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> {{ 'COMPARE.AVAILABLE' | translate }}</span>
                          } @else {
                            <span class="text-slate-300 font-bold flex items-center gap-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-slate-300"></span> {{ 'COMPARE.UNAVAILABLE' | translate }}</span>
                          }
                        </div>
                      }
                    </div>

                  </div>
                </div>
              }
            </div>

            <!-- Modal Footer -->
            <div class="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 select-none bg-slate-50/50">
              <button (click)="showCompareModal.set(false)" class="px-6 py-3 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer">
                {{ 'COMPARE.CLOSE' | translate }}
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `,
})
export class PropertyListComponent implements OnInit, AfterViewInit {
  public translate = inject(TranslateService);
  private map?: L.Map;
  private markersLayer = L.layerGroup();
  properties = signal<PropertyListItem[]>([]);
  
  // Comparison Matrix State
  selectedPropertiesForCompare = signal<PropertyListItem[]>([]);
  showCompareModal = signal(false);
  loadingCompareDetails = signal(false);
  comparedPropertiesDetails = signal<Property[]>([]);

  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);
  showFilters = signal(false);
  filters: GetPropertiesParams = { pageNumber: 1, pageSize: 12, city: '', district: '', propertyType: '', listingType: '' };

  // Dropdown States
  showCityDropdown = signal(false);
  showDistrictDropdown = signal(false);
  showTypeDropdown = signal(false);

  // Localization Mappings (Key -> Arabic Backend Value)
  private cityMap: Record<string, string> = {
    'Cairo': 'القاهرة', 'Alexandria': 'الإسكندرية', 'Giza': 'الجيزة', 'Mansoura': 'المنصورة',
    'Tanta': 'طنطا', 'Mahalla': 'المحلة الكبرى', 'PortSaid': 'بور سعيد', 'Suez': 'السويس',
    'Ismailia': 'الإسماعيلية', 'Fayoum': 'الفيوم', 'Zagazig': 'الزقازيق', 'Aswan': 'أسوان',
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

  egyptRegions = EGYPT_REGIONS;

  get cities(): string[] {
    const ids: string[] = [];
    this.egyptRegions.forEach(gov => {
      gov.cities.forEach(city => {
        if (city.id) ids.push(city.id);
      });
    });
    return ids;
  }

  districtsCairo = [
    'Zamalek', 'Maadi', 'NewCairo', 'FifthSettlement', 'FirstSettlement',
    'ThirdSettlement', 'Heliopolis', 'NasrCity', 'GardenCity', 'Dokki',
    'Mohandessin', 'Madinaty', 'Shorouk', 'Obour', 'Rehab', 'Agouza',
    'Shoubra', 'Mokattam', 'Helwan'
  ];

  districtsAlex = [
    'Smouha', 'Miami', 'SidiBishr', 'Gleem', 'Sporting', 'Laurent',
    'KafrAbdo', 'Roushdy', 'SanStefano', 'Agamy', 'Montaza', 'Mandara',
    'MoharamBek', 'CampCesar', 'Ibrahimia', 'Shatby', 'Stanley', 'SidiGaber'
  ];

  propertyTypes = [
    { id: 'Apartment', label: 'PROPERTY.TYPES.Apartment', icon: '🏢' },
    { id: 'Villa', label: 'PROPERTY.TYPES.Villa', icon: '🏡' },
    { id: 'Office', label: 'PROPERTY.TYPES.Office', icon: '💼' },
    { id: 'Land', label: 'PROPERTY.TYPES.Land', icon: '🏜️' }
  ];

  // Smart Map Positioning Logic (Leaflet Coordinates)
  private cityCoords: Record<string, [number, number]> = {
    'Cairo': [30.0444, 31.2357],
    'Alexandria': [31.2001, 29.9187],
    'Giza': [30.0131, 31.2089],
    'Mansoura': [31.0409, 31.3785],
    'Tanta': [30.7865, 31.0004],
    'Mahalla': [30.9700, 31.1600],
    'PortSaid': [31.2653, 32.3019],
    'Suez': [29.9668, 32.5498],
    'Ismailia': [30.5965, 32.2715],
    'Hurghada': [27.2579, 33.8116],
    'SharmElSheikh': [27.9158, 34.3299],
    'October': [29.9712, 30.9422],
    'Zayed': [30.0163, 30.9850],
    'Madinaty': [30.0911, 31.6444],
    'Zamalek': [30.0631, 31.2222],
    'Maadi': [29.9594, 31.2584]
  };

  localImagesMap = signal<Map<string, string>>(new Map());

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap() {
    this.map = L.map('map', {
      center: [30.0444, 31.2357],
      zoom: 7,
      zoomControl: false
    });

    // standard OpenStreetMap tiles to display local Arabic names for Egyptian users
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);
    this.markersLayer.addTo(this.map);

    // Initial markers
    this.updateMarkers();
  }

  private updateMarkers() {
    if (!this.map) return;
    this.markersLayer.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    this.properties().forEach(p => {
      let lat: number;
      let lng: number;

      if (p.latitude && p.longitude) {
        // Use real coordinates from backend
        lat = p.latitude;
        lng = p.longitude;
      } else {
        // Fallback: city center + jitter
        let cityKey = this.getCityKeyFromValue(p.city || 'Cairo');
        let baseCoords = this.cityCoords[cityKey];
        
        // Smart fallback: check if district matches a known city/district coords
        if (!baseCoords && p.district) {
          const districtKey = this.getDistrictKeyFromValue(p.district);
          const cityKeyFromDistrict = this.getCityKeyFromValue(p.district);
          baseCoords = this.cityCoords[districtKey] || this.cityCoords[cityKeyFromDistrict];
        }

        if (!baseCoords) {
          baseCoords = [30.0444, 31.2357];
        }

        const hash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        lat = baseCoords[0] + (hash % 10 - 5) / 2000;
        lng = baseCoords[1] + ((hash >> 3) % 10 - 5) / 2000;
      }

      bounds.push([lat, lng]);

      const price = p.price.toLocaleString();
      const currency = this.translate.instant('PROPERTY.CURRENCY');
      const marker = L.divIcon({
        className: '',
        html: `<div style="
          background: white;
          color: #0a8f96;
          font-size: 10px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 999px;
          box-shadow: 0 4px 16px rgba(10,143,150,0.18), 0 1px 4px rgba(0,0,0,0.10);
          border: 1.5px solid rgba(10,143,150,0.18);
          white-space: nowrap;
          letter-spacing: -0.3px;
          font-family: inherit;
          cursor: pointer;
          transition: transform 0.15s;
        ">${price} ${currency}</div>`,
        iconSize: [80, 26],
        iconAnchor: [40, 13]
      });

      L.marker([lat, lng], { icon: marker })
        .bindPopup(`
          <div style="font-family:inherit; padding:4px 2px; min-width:140px">
            <div style="font-weight:900; font-size:13px; color:#0f172a; margin-bottom:4px">${p.title}</div>
            <div style="font-weight:800; font-size:12px; color:#0a8f96">${price} ${currency}</div>
          </div>`
        )
        .addTo(this.markersLayer);
    });

    // Fit map to show all markers, or center on filtered city
    if (bounds.length > 1) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
    } else if (bounds.length === 1) {
      this.map.setView(bounds[0], 13);
    } else {
      const city = this.filters.city;
      if (city && this.cityCoords[city]) {
        this.map.setView(this.cityCoords[city], 11);
      }
    }
  }

  public getCityKeyFromValue(value: string | undefined): string {
    if (!value) return '';
    const normalized = value.toLowerCase().trim();
    for (const gov of this.egyptRegions) {
      if (gov.nameAr.toLowerCase() === normalized || gov.nameEn.toLowerCase() === normalized || gov.id.toLowerCase() === normalized) {
        return gov.id;
      }
      const city = gov.cities.find(c => 
        c.nameAr.toLowerCase() === normalized || c.nameEn.toLowerCase() === normalized || c.id.toLowerCase() === normalized
      );
      if (city) {
        return city.id;
      }
    }

    const key = Object.keys(this.cityMap).find(k => this.cityMap[k] === value);
    if (key) return key;
    const citiesDict = this.translate.instant('CITIES');
    if (citiesDict && typeof citiesDict === 'object') {
      return Object.keys(citiesDict).find(k => (citiesDict as any)[k] === value) || value;
    }
    return value;
  }

  public getDistrictKeyFromValue(value: string | undefined): string {
    if (!value) return '';
    const key = Object.keys(this.districtMap).find(k => this.districtMap[k] === value);
    if (key) return key;
    const districtsDict = this.translate.instant('DISTRICTS');
    if (districtsDict && typeof districtsDict === 'object') {
      return Object.keys(districtsDict).find(k => (districtsDict as any)[k] === value) || value;
    }
    return value;
  }

  public getCityLabel(cityId: string | undefined): string {
    if (!cityId) return '';
    const isAr = this.translate.currentLang === 'ar';
    for (const gov of this.egyptRegions) {
      if (gov.id === cityId) {
        return isAr ? gov.nameAr : gov.nameEn;
      }
      const city = gov.cities.find(c => c.id === cityId);
      if (city) {
        return isAr ? city.nameAr : city.nameEn;
      }
    }
    const key = 'CITIES.' + cityId;
    const translated = this.translate.instant(key);
    return translated !== key ? translated : cityId;
  }

  public getDistrictLabel(value: string | undefined): string {
    if (!value) return '';
    const key = this.getDistrictKeyFromValue(value);
    const translationKey = 'DISTRICTS.' + key;
    const translated = this.translate.instant(translationKey);
    return translated !== translationKey ? translated : value;
  }

  locateUser() {
    if (this.map) {
      this.map.locate({ setView: true, maxZoom: 13 });
      this.toast.info(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_LOCATING'));
    }
  }

  constructor(
    public propertyService: PropertyService, 
    public auth: AuthService, 
    public toast: ToastService,
    private localImageService: LocalImageService,
    private route: ActivatedRoute
  ) {}

  @HostListener('document:click')
  closeAllDropdowns() {
    this.showCityDropdown.set(false);
    this.showDistrictDropdown.set(false);
    this.showTypeDropdown.set(false);
  }



  selectCity(city: string) {
    this.filters.city = city;
    this.filters.district = '';
    this.showCityDropdown.set(false);
  }

  selectDistrict(district: string) {
    this.filters.district = district;
    this.showDistrictDropdown.set(false);
  }

  selectType(type: string) {
    this.filters.propertyType = type;
    this.showTypeDropdown.set(false);
  }

  getDistricts() {
    if (this.filters.city === 'Cairo') return this.districtsCairo;
    if (this.filters.city === 'Alexandria') return this.districtsAlex;
    return ['Zamalek', 'Smouha', 'Zayed', 'October'];
  }

  getSelectedTypeLabel() {
    if (!this.filters.propertyType) return 'PROPERTY_LIST.QUICK_ALL';
    return this.propertyTypes.find(t => t.id === this.filters.propertyType)?.label || this.filters.propertyType;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      if (params['agentUserId']) {
        this.filters.agentUserId = params['agentUserId'];
      } else {
        delete this.filters.agentUserId;
      }

      // Apply search filters from Home page
      if (params['city']) {
        this.filters.city = this.getCityKeyFromValue(params['city']);
      }
      if (params['district']) {
        this.filters.district = this.getDistrictKeyFromValue(params['district']);
      }
      if (params['propertyType']) {
        this.filters.propertyType = params['propertyType'];
      }
      
      if (this.auth.isBuyer()) {
        await this.loadSavedPropertyIds();
      }
      await this.search();
    });
  }

  resetFilters() {
    this.filters = { 
      pageNumber: 1, 
      pageSize: 12, 
      city: '', 
      district: '', 
      propertyType: '', 
      listingType: '',
      minPrice: undefined,
      maxPrice: undefined,
      minBedrooms: undefined,
      maxBedrooms: undefined,
      minArea: undefined,
      maxArea: undefined
    };
    this.currentPage.set(1);
    this.search();
  }

  isFiltersValid(): boolean {
    const f = this.filters;
    if (f.minPrice !== undefined && f.maxPrice !== undefined && f.minPrice > f.maxPrice) return false;
    if (f.minArea !== undefined && f.maxArea !== undefined && f.minArea > f.maxArea) return false;
    if (f.minBedrooms !== undefined && f.maxBedrooms !== undefined && f.minBedrooms > f.maxBedrooms) return false;
    if (f.minPrice !== undefined && f.minPrice < 0) return false;
    if (f.maxPrice !== undefined && f.maxPrice < 0) return false;
    if (f.minArea !== undefined && f.minArea < 0) return false;
    if (f.maxArea !== undefined && f.maxArea < 0) return false;
    if (f.minBedrooms !== undefined && f.minBedrooms < 0) return false;
    if (f.maxBedrooms !== undefined && f.maxBedrooms < 0) return false;
    return true;
  }

  async search() {
    this.loading.set(true);
    // Clear current properties to avoid showing stale data during/after failed search
    this.properties.set([]);
    
    try {
      this.filters.pageNumber = this.currentPage();
      
      // Map keys to Arabic for backend
      const backendFilters = { ...this.filters };
      if (backendFilters.city) {
        backendFilters.city = this.cityMap[backendFilters.city] || backendFilters.city;
      }
      if (backendFilters.district) {
        backendFilters.district = this.districtMap[backendFilters.district] || backendFilters.district;
      }

      const r = await this.propertyService.getAll(backendFilters);
      
      this.properties.set(r.items);
      this.totalPages.set(r.totalPages);
      this.totalCount.set(r.totalCount);
      
      this.updateMarkers();
    } catch (error) { 
      this.toast.error(this.translate.instant('PROPERTY_LIST.MESSAGES.LOAD_ERROR')); 
      this.totalCount.set(0);
      this.totalPages.set(1);
    }
    finally { this.loading.set(false); }
  }

  goToPage(p: number) { this.currentPage.set(p); this.search(); }

  async loadSavedPropertyIds() {
    if (this.propertyService.savedIds().size === 0) {
      await this.propertyService.syncAllSavedIds();
    }
  }

  async toggleSave(id: string) {
    if (!this.auth.isBuyer()) {
      this.toast.info(this.translate.instant('PROPERTY_LIST.MESSAGES.FAV_BUYER_ONLY'));
      return;
    }
    try {
      if (this.propertyService.savedIds().has(id)) {
        await this.propertyService.unsave(id);
        this.toast.success(this.translate.instant('PROPERTY_LIST.MESSAGES.FAV_REMOVED'));
      } else {
        await this.propertyService.save(id);
        this.toast.success(this.translate.instant('PROPERTY_LIST.MESSAGES.FAV_ADDED'));
      }
    } catch (e: any) {
      if (e?.status === 409) {
        this.toast.info(this.translate.instant('PROPERTY_LIST.MESSAGES.FAV_EXIST'));
      } else {
        this.toast.error(e?.error?.detail || 'Error');
      }
    }
  }

  getListImage(p: PropertyListItem): string | null {
    return p.primaryImageUrl || null;
  }

  async deleteProperty(id: string) {
    if (confirm(this.translate.instant('PROPERTY_LIST.MESSAGES.DELETE_CONFIRM'))) {
      try {
        await this.propertyService.delete(id);
        this.toast.success(this.translate.instant('PROPERTY_LIST.MESSAGES.DELETE_SUCCESS'));
        this.search();
      } catch (error: any) {
        this.toast.error(this.translate.instant('PROPERTY_LIST.MESSAGES.DELETE_ERROR'));
      }
    }
  }

  onImageError(event: any, propertyId: string) {
    const target = event.target as HTMLImageElement;
    // Try to resolve relative URLs
    const currentSrc = target.src;
    if (currentSrc && !currentSrc.startsWith('data:') && !currentSrc.startsWith('http')) {
      const resolved = resolveBackendAssetUrl(currentSrc);
      if (resolved && resolved !== currentSrc) {
        target.src = resolved;
        return;
      }
    }
    target.style.display = 'none';
  }

  // Comparison Matrix Operations
  isCompared(id: string): boolean {
    return this.selectedPropertiesForCompare().some(item => item.id === id);
  }

  toggleCompare(item: PropertyListItem) {
    this.selectedPropertiesForCompare.update(current => {
      const exists = current.some(i => i.id === item.id);
      if (exists) {
        return current.filter(i => i.id !== item.id);
      }
      if (current.length >= 3) {
        this.toast.info(this.translate.instant('COMPARE.TOAST_MAX'));
        return current;
      }
      return [...current, item];
    });
  }

  clearAllCompare() {
    this.selectedPropertiesForCompare.set([]);
  }

  async openCompareModal() {
    if (this.selectedPropertiesForCompare().length < 2) {
      this.toast.info(this.translate.instant('COMPARE.TOAST_MIN'));
      return;
    }
    this.showCompareModal.set(true);
    this.loadingCompareDetails.set(true);
    this.comparedPropertiesDetails.set([]);
    try {
      const fetchPromises = this.selectedPropertiesForCompare().map(p => this.propertyService.getById(p.id));
      const details = await Promise.all(fetchPromises);
      this.comparedPropertiesDetails.set(details);
    } catch (err) {
      this.toast.error(this.translate.instant('COMPARE.TOAST_ERROR'));
      this.showCompareModal.set(false);
    } finally {
      this.loadingCompareDetails.set(false);
    }
  }

  removeComparedProperty(id: string) {
    this.selectedPropertiesForCompare.update(current => current.filter(i => i.id !== id));
    this.comparedPropertiesDetails.update(current => current.filter(i => i.id !== id));
    if (this.selectedPropertiesForCompare().length < 2) {
      this.showCompareModal.set(false);
    }
  }

  getFurnishingLabel(status?: string): string {
    if (!status) return this.translate.instant('COMPARE.NOT_SPECIFIED');
    const dict: Record<string, string> = {
      'Furnished': 'COMPARE.FURNISHING_FULLY',
      'SemiFurnished': 'COMPARE.FURNISHING_SEMI',
      'Unfurnished': 'COMPARE.FURNISHING_UN',
      'FullyFurnished': 'COMPARE.FURNISHING_FULLY',
      'UnfurnishedMuted': 'COMPARE.FURNISHING_UN'
    };
    const key = dict[status];
    return key ? this.translate.instant(key) : status;
  }

  getViewTypeLabel(view?: string): string {
    if (!view) return this.translate.instant('COMPARE.NOT_SPECIFIED');
    const dict: Record<string, string> = {
      'Street': 'COMPARE.VIEW_STREET',
      'Garden': 'COMPARE.VIEW_GARDEN',
      'Pool': 'COMPARE.VIEW_POOL',
      'Sea': 'COMPARE.VIEW_SEA',
      'Nile': 'COMPARE.VIEW_NILE',
      'Back': 'COMPARE.VIEW_BACK',
      'MainRoad': 'COMPARE.VIEW_ROAD'
    };
    const key = dict[view];
    return key ? this.translate.instant(key) : view;
  }

  getCompareImage(p: Property): string {
    if (p.images && p.images.length > 0) {
      const primary = p.images.find(img => img.isPrimary);
      if (primary) return primary.url;
      return p.images[0].url;
    }
    return '/assets/logo.svg';
  }
}
