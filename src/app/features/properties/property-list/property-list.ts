import { Component, signal, OnInit, HostListener, AfterViewInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { PropertyService } from '../services/property.service';
import { PropertyListItem, GetPropertiesParams, Property, CreatePropertyRequest } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TrashService } from '../../../core/services/trash.service';
import { LocalImageService } from '../../../core/services/local-image.service';
import { DecimalPipe, CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { resolveBackendAssetUrl, buildPropertyPlaceholder } from '../../../core/utils/media';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PropertyCompareComponent } from '../../../shared/components/property-compare/property-compare';
import { extractApiError } from '../../../core/utils/api-error';
import * as L from 'leaflet';
import { EGYPT_REGIONS, Governorate, City } from '../../../core/constants/egypt-regions';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [FormsModule, RouterLink, PaginationComponent, SkeletonLoaderComponent, EmptyStateComponent, DecimalPipe, CurrencyEgpPipe, TranslateModule, CommonModule, PropertyCompareComponent],
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
                        {{ 'PROPERTY_LIST.ALL_CITIES' | translate }}
                      </button>
                      <div class="w-full border-t border-slate-100 my-1"></div>
                      
                      @for (gov of egyptRegions; track gov.id) {
                        <div class="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                          {{ translate.currentLang === 'ar' ? gov.nameAr : gov.nameEn }}
                        </div>
                        <!-- Option for All Cities in this Governorate -->
                        <button type="button" (click)="selectCity(gov.id)" 
                                class="w-full px-8 py-2 text-start hover:bg-[#0a8f96]/5 text-xs font-black text-[#0a8f96] transition-all">
                          {{ 'PROPERTY_LIST.ALL_CITIES_IN' | translate:{ name: translate.currentLang === 'ar' ? gov.nameAr : gov.nameEn } }}
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
                            [title]="'COMPARE.TOOLTIP' | translate">
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
                        <span class="text-[8px] font-black uppercase tracking-widest opacity-30">{{ 'PROPERTY_LIST.BAYTOLOGY_PREMIUM' | translate }}</span>
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
                          <button (click)="deleteProperty(p); $event.stopPropagation()" class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
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

      <app-property-compare [selectedProperties]="selectedPropertiesForCompare()" (compareChange)="selectedPropertiesForCompare.set($event)" />

    </div>
  `
})
export class PropertyListComponent implements OnInit, AfterViewInit {
  public translate = inject(TranslateService);
  private map?: L.Map;
  private markersLayer = L.layerGroup();
  properties = signal<PropertyListItem[]>([]);
  
  // Comparison Matrix State
  selectedPropertiesForCompare = signal<PropertyListItem[]>([]);

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

  // Backend Filter Mapping (English key -> Arabic value expected by API).
  // These are DATA constants used for backend communication, not user-facing text.
  // They mirror the CITIES/DISTRICTS entries in public/i18n/ar.json and must be
  // kept in sync when adding new locations. User-facing display uses
  // 'CITIES.' + key | translate etc. directly (see getCityLabel/getDistrictLabel).
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
        let cityKey = this.getCityKeyFromValue(p.city || this.translate.instant('CITIES.Cairo'));
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
      this.toast.info(this.translate.instant('MESSAGES.GEO_LOCATING'));
    }
  }

  private trashService = inject(TrashService);

  constructor(
    public propertyService: PropertyService,
    public auth: AuthService,
    public toast: ToastService,
    private confirmService: ConfirmService,
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
      const extracted = extractApiError(error, this.translate);
      if (extracted) {
        this.toast.error(extracted);
      } else {
        this.toast.error(this.translate.instant('PROPERTY_LIST.MESSAGES.LOAD_ERROR'));
      }
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
      const extracted = extractApiError(e, this.translate);
      if (extracted) {
        this.toast.error(extracted);
      } else if (e?.status === 409) {
        this.toast.info(this.translate.instant('PROPERTY_LIST.MESSAGES.FAV_EXIST'));
      } else {
        this.toast.error(e?.error?.detail || this.translate.instant('COMMON.ERROR'));
      }
    }
  }

  getListImage(p: PropertyListItem): string | null {
    return p.primaryImageUrl || null;
  }

  async deleteProperty(item: PropertyListItem) {
    const ok = await this.confirmService.ask({
      title: this.translate.instant('COMMON.CONFIRM_DELETE_TITLE'),
      message: this.translate.instant('COMMON.CONFIRM_DELETE_DESC'),
      confirmText: this.translate.instant('COMMON.DELETE'),
      cancelText: this.translate.instant('COMMON.CANCEL'),
      variant: 'danger',
    });
    if (!ok) return;

    try {
      const full = await this.propertyService.getById(item.id);
      const createRequest: CreatePropertyRequest = {
        title: full.title,
        description: full.description,
        propertyType: full.propertyType as any,
        listingType: full.listingType as any,
        price: full.price,
        area: full.area,
        bedrooms: full.bedrooms,
        bathrooms: full.bathrooms,
        floor: full.floor,
        totalFloors: full.totalFloors,
        addressLine: full.addressLine,
        city: full.city,
        district: full.district,
        zipCode: full.zipCode,
        latitude: full.latitude,
        longitude: full.longitude,
        hasParking: full.amenity?.hasParking ?? false,
        hasPool: full.amenity?.hasPool ?? false,
        hasGym: full.amenity?.hasGym ?? false,
        hasElevator: full.amenity?.hasElevator ?? false,
        hasSecurity: full.amenity?.hasSecurity ?? false,
        hasBalcony: full.amenity?.hasBalcony ?? false,
        hasGarden: full.amenity?.hasGarden ?? false,
        hasCentralAC: full.amenity?.hasCentralAC ?? false,
        furnishingStatus: (full.amenity?.furnishingStatus ?? 'Unfurnished') as any,
        viewType: full.amenity?.viewType as any,
        imageUrls: full.images?.map(i => i.url) ?? [],
      };
      this.trashService.addProperty(item.id, item.title, item.primaryImageUrl, createRequest);
      await this.propertyService.delete(item.id);
      this.toast.success(this.translate.instant('PROPERTY_LIST.MESSAGES.MOVED_TO_TRASH'));
      this.search();
    } catch (err: any) {
      const extracted = extractApiError(err, this.translate);
      if (extracted) {
        this.toast.error(extracted);
      } else {
        const status = err?.status ?? err?.statusCode;
        if (status === 409) {
          this.toast.error(this.translate.instant('TRASH.DELETE_HAS_RELATED'));
        } else if (status === 403) {
          this.toast.error(this.translate.instant('TRASH.DELETE_ACCESS_DENIED'));
        } else if (status === 404) {
          this.toast.error(this.translate.instant('TRASH.DELETE_NOT_FOUND'));
        } else {
          this.toast.error(this.translate.instant('TRASH.DELETE_ERROR'));
        }
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

}
