import { Component, signal, computed, OnInit, HostListener, OnDestroy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../properties/services/property.service';
import { PropertyListItem } from '../../core/models';
import { AuthService } from '../../core/auth/auth.service';
import { AiService } from '../ai/services/ai.service';
import { AgentService } from '../agents/services/agent.service';
import { AgentDetail } from '../../core/models/profile.models';
import { CurrencyEgpPipe } from '../../shared/pipes/currency-egp.pipe';
import { LocalImageService } from '../../core/services/local-image.service';
import { resolveBackendAssetUrl, getPropertyImageUrl, buildPropertyPlaceholder } from '../../core/utils/media';
import { EGYPT_REGIONS, Governorate, City } from '../../core/constants/egypt-regions';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecimalPipe, CurrencyEgpPipe, FormsModule, TranslateModule, SlicePipe],
  template: `
    <div class="font-sans overflow-x-hidden">
      <!-- Luxury Hero Section -->
      <section class="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center py-20">
        <!-- Background Image with Overlay -->
        <div class="absolute inset-0 z-0 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
               class="w-full h-full object-cover scale-105 animate-pulse-slow">
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60 backdrop-blur-[1px]"></div>
        </div>

        <div class="relative z-10 max-w-[1400px] mx-auto px-8 flex flex-col justify-center items-center text-center">
          <!-- Agent View -->
          @if (auth.isAgent()) {
            <!-- Agent Badge -->
            <div class="mb-4 opacity-0 animate-[fadeInUp_0.8s_ease_forwards]">
              <span class="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[10px] font-black tracking-[0.3em] uppercase px-6 py-2.5 rounded-full shadow-2xl">
                {{ 'HOME.AGENT_HERO_BADGE' | translate }}
              </span>
            </div>

            <!-- Agent Headline -->
            <div class="mb-6 max-w-5xl opacity-0 animate-[fadeInUp_1s_0.2s_ease_forwards]">
              <h1 class="text-white tracking-tight">
                <span class="block text-5xl md:text-7xl font-medium mb-4 leading-tight">
                  {{ 'HOME.AGENT_HERO_TITLE_1' | translate }} <span class="font-extralight opacity-60 italic">{{ 'HOME.AGENT_HERO_TITLE_2' | translate }}</span> {{ 'HOME.AGENT_HERO_TITLE_3' | translate }}.
                </span>
                <div class="flex items-center justify-center gap-4 mb-4">
                  <div class="h-px w-12 bg-emerald-400/30"></div>
                  <span class="text-lg md:text-xl font-light tracking-[0.2em] text-emerald-300 uppercase">{{ 'HOME.AGENT_HERO_TITLE_SUB' | translate }}</span>
                  <div class="h-px w-12 bg-emerald-400/30"></div>
                </div>
              </h1>
            </div>

            <!-- Agent Subtext -->
            <p class="text-lg md:text-xl text-emerald-200/80 font-medium max-w-2xl mb-8 leading-loose opacity-0 animate-[fadeInUp_1s_0.4s_ease_forwards]">
              {{ 'HOME.AGENT_HERO_DESC' | translate }}
            </p>

            <!-- Agent CTA -->
            <div class="mt-8 opacity-0 animate-[fadeInUp_1s_0.6s_ease_forwards]">
              <a routerLink="/agent/dashboard"
                 class="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black px-12 py-5 rounded-[32px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                {{ 'HOME.AGENT_HERO_CTA' | translate }}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </a>
            </div>
          }

          <!-- Buyer View (Default) -->
          @else {
            <!-- Animated Badge -->
            <div class="mb-4 opacity-0 animate-[fadeInUp_0.8s_ease_forwards]">
              <span class="bg-gray-900/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-black tracking-[0.3em] uppercase px-6 py-2.5 rounded-full shadow-2xl">
                {{ 'HOME.HERO_BADGE' | translate }}
              </span>
            </div>

            <!-- Minimalist Luxury Headline -->
            <div class="mb-6 max-w-5xl opacity-0 animate-[fadeInUp_1s_0.2s_ease_forwards]">
              <h1 class="text-white tracking-tight">
                <span class="block text-5xl md:text-7xl font-medium mb-4 leading-tight">
                  {{ 'HOME.HERO_TITLE_1' | translate }} <span class="font-extralight opacity-60 italic">{{ 'HOME.HERO_TITLE_2' | translate }}</span> {{ 'HOME.HERO_TITLE_3' | translate }}.
                </span>
                <div class="flex items-center justify-center gap-4 mb-4">
                  <div class="h-px w-12 bg-white/20"></div>
                  <span class="text-lg md:text-xl font-light tracking-[0.2em] text-white/50 uppercase">{{ 'HOME.HERO_TITLE_SUB' | translate }}</span>
                  <div class="h-px w-12 bg-white/20"></div>
                </div>
              </h1>
            </div>

            <!-- Subtext -->
            <p class="text-lg md:text-xl text-white/60 font-medium max-w-2xl mb-8 leading-loose opacity-0 animate-[fadeInUp_1s_0.4s_ease_forwards]">
              {{ 'HOME.HERO_DESC' | translate }}
            </p>

            <!-- Refined Search Bar -->
            <div class="mt-8 w-full max-w-5xl opacity-0 animate-[fadeInUp_1s_0.6s_ease_forwards]">
              <div class="bg-white/10 backdrop-blur-3xl border border-white/20 p-2 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-2">
                
                <!-- City Search -->
                <div class="flex-1 w-full relative z-52" (click)="$event.stopPropagation()">
                  <div class="flex items-center px-8 py-4 gap-4 border-b md:border-b-0 md:border-l border-white/10 cursor-text" (click)="cityInput.focus()">
                    <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input #cityInput type="text"
                           [ngModel]="citySearchQuery()"
                           (ngModelChange)="onCityQueryChange($event)"
                           (focus)="showCityDropdown.set(true)"
                           [placeholder]="'HOME.SEARCH_CITY' | translate" 
                           class="w-full bg-transparent text-white placeholder:text-white/40 text-lg outline-none font-medium text-inherit cursor-text">
                  </div>
                
                @if (showCityDropdown()) {
                  <div class="absolute top-full left-0 right-0 mt-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[24px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.18)] border border-slate-200/50 dark:border-slate-800/80 overflow-hidden z-50 animate-slide-up md:w-[600px] md:mx-auto">
                    <div class="flex h-[340px] divide-x divide-slate-100 dark:divide-slate-800/80 rtl:divide-x-reverse text-slate-800 dark:text-slate-200 font-sans">
                      
                      <!-- Column 1: Governorates -->
                      <div class="w-1/2 overflow-y-auto custom-scrollbar py-4 px-2">
                        <div class="px-4 py-2 mb-2 flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <svg class="w-3.5 h-3.5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span>{{ 'PROPERTY_LIST.GOVERNORATE' | translate }}</span>
                        </div>
                        
                        <div class="flex flex-col gap-0.5">
                          @for (gov of filteredGovernorates(); track gov.id) {
                            <button type="button" 
                                    (click)="selectGovernorate(gov)"
                                    (mouseenter)="hoverGovernorate(gov)"
                                    [class.bg-[#0a8f96]/10]="activeGov()?.id === gov.id"
                                    [class.text-[#0a8f96]]="activeGov()?.id === gov.id"
                                    [class.font-semibold]="activeGov()?.id === gov.id"
                                    [class.font-medium]="activeGov()?.id !== gov.id"
                                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ltr:text-left rtl:text-right hover:bg-slate-50 dark:hover:bg-slate-800/40 relative">
                              
                              <!-- Selected Governorate Bar Indicator -->
                              @if (activeGov()?.id === gov.id) {
                                <div class="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0a8f96] rounded-full ltr:left-1 rtl:right-1"></div>
                              }
                              
                              <span class="ltr:pl-2 rtl:pr-2 text-sm">{{ translate.currentLang === 'ar' ? gov.nameAr : gov.nameEn }}</span>
                              
                              <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#0a8f96] transition-all duration-200 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" 
                                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                              </svg>
                            </button>
                          }
                          @if (filteredGovernorates().length === 0) {
                            <div class="px-6 py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                              {{ 'COMMON.NO_RESULTS' | translate }}
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Column 2: Cities of Selected Governorate -->
                      <div class="w-1/2 overflow-y-auto custom-scrollbar py-4 px-2 bg-slate-50/30 dark:bg-slate-900/10">
                        <div class="px-4 py-2 mb-2 flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <svg class="w-3.5 h-3.5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                          <span>{{ 'PROPERTY_LIST.LABEL_CITY' | translate }}</span>
                        </div>
                        
                        @if (activeGov(); as gov) {
                          <div class="flex flex-col gap-0.5">
                            <!-- All Cities option -->
                            @let isAllCitiesSelected = !searchCity || searchCity === '';
                            <button type="button"
                                    (click)="selectCityOfGov({ id: '', nameAr: '', nameEn: '' })"
                                    [class.bg-[#0a8f96]/10]="isAllCitiesSelected"
                                    [class.text-[#0a8f96]]="isAllCitiesSelected"
                                    [class.font-semibold]="isAllCitiesSelected"
                                    [class.font-medium]="!isAllCitiesSelected"
                                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#0a8f96]/5 dark:hover:bg-[#0a8f96]/5 transition-all duration-200 text-sm ltr:text-left rtl:text-right">
                              <span class="flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full transition-all duration-200"
                                      [class.bg-[#0a8f96]]="isAllCitiesSelected"
                                      [class.bg-slate-300]="!isAllCitiesSelected"
                                      [class.dark:bg-slate-600]="!isAllCitiesSelected"></span>
                                <span>{{ 'HOME.ALL_CITIES' | translate }}</span>
                              </span>
                              @if (isAllCitiesSelected) {
                                <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                </svg>
                              }
                            </button>
                            
                            @for (city of gov.cities; track city.id) {
                              @let isCitySelected = searchCity === city.id;
                              <button type="button" 
                                      (click)="selectCityOfGov(city)"
                                      [class.bg-[#0a8f96]/10]="isCitySelected"
                                      [class.text-[#0a8f96]]="isCitySelected"
                                      [class.font-semibold]="isCitySelected"
                                      [class.font-medium]="!isCitySelected"
                                      class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#0a8f96]/5 dark:hover:bg-[#0a8f96]/5 transition-all duration-200 text-slate-700 dark:text-slate-300 text-sm ltr:text-left rtl:text-right">
                                <span class="flex items-center gap-2">
                                  <span class="w-1.5 h-1.5 rounded-full transition-all duration-200"
                                        [class.bg-[#0a8f96]]="isCitySelected"
                                        [class.bg-transparent]="!isCitySelected"></span>
                                  <span>{{ translate.currentLang === 'ar' ? city.nameAr : city.nameEn }}</span>
                                </span>
                                @if (isCitySelected) {
                                  <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                  </svg>
                                }
                              </button>
                            }
                          </div>
                        } @else {
                          <div class="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-semibold px-6 py-8">
                            {{ 'HOME.SELECT_GOVERNORATE_FIRST' | translate }}
                          </div>
                        }
                      </div>

                    </div>
                  </div>
                }
              </div>

              <!-- Property Type -->
              <div class="relative w-full md:w-64" (click)="$event.stopPropagation()">
                <button (click)="showTypeDropdown.set(!showTypeDropdown())"
                        class="w-full hidden md:flex items-center px-8 py-4 gap-4 border-l border-white/10 text-white hover:bg-white/5 transition-all">
                  <svg class="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  <div class="flex-1 ltr:text-left rtl:text-right">
                    <p class="text-[10px] text-white/40 font-black uppercase tracking-widest leading-none mb-1">{{ 'HOME.SEARCH_PROPERTY_TYPE' | translate }}</p>
                    <p class="text-sm font-bold truncate">{{ (selectedType() ? ('PROPERTY.TYPES.' + selectedType() | translate) : ('COMMON.ALL' | translate)) }}</p>
                  </div>
                  <svg class="w-4 h-4 text-white/30 transition-transform" [class.rotate-180]="showTypeDropdown()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                </button>

                @if (showTypeDropdown()) {
                  <div class="absolute top-full right-0 w-64 mt-4 bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/20 overflow-hidden z-50 py-4 animate-slide-up">
                    <div class="max-h-64 overflow-y-auto custom-scrollbar">
                      @for (type of propertyTypes; track type.id) {
                        <button (click)="selectType(type.id)" 
                                class="w-full flex items-center gap-3 px-8 py-3.5 hover:bg-[#0a8f96]/5 text-gray-900 font-bold transition-all group ltr:text-left rtl:text-right">
                          <div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#0a8f96]/10 group-hover:text-[#0a8f96] transition-all">
                            <span class="text-lg">{{ type.icon }}</span>
                          </div>
                          {{ 'PROPERTY.TYPES.' + type.id | translate }}
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>

              <button routerLink="/properties" [queryParams]="{ city: searchCity, propertyType: selectedType() }"
                      class="w-full md:w-auto bg-[#0a8f96] hover:bg-[#076b70] text-white font-black px-12 py-5 rounded-[32px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                {{ 'HOME.SEARCH_BTN' | translate }}
              </button>
            </div>
          </div>
      } <!-- close @else -->
    </div> <!-- close z-10 container -->
  </section>

  <!-- Featured Exclusives -->
      <section class="py-32 bg-white">
        <div class="max-w-[1400px] mx-auto px-6 md:px-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div class="max-w-xl">
              <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">{{ 'HOME.FEATURED_TITLE' | translate | slice:0:6 }} <span class="text-[#0a8f96]">{{ 'HOME.FEATURED_TITLE' | translate | slice:6 }}</span></h2>
              <p class="text-gray-400 font-bold text-sm uppercase tracking-widest">{{ 'HOME.FEATURED_SUB' | translate }}</p>
            </div>
            <a routerLink="/properties" class="group flex items-center gap-3 px-8 py-4 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 hover:bg-[#0a8f96] hover:text-white transition-all shadow-sm">
              {{ 'COMMON.VIEW_ALL' | translate }}
              <svg class="w-5 h-5 transition-transform rtl:rotate-180 group-hover:translate-x-2 ltr:group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </a>
          </div>

          <!-- 1 Large, 2 Stacked Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            @if (featured().length > 0) {
              <!-- Right Large Card (RTL) -->
              <a [routerLink]="['/properties', featured()[0].id]" class="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-[32px] h-[500px] lg:h-[650px] shadow-2xl block bg-gray-100">
                @let mainImg = featured()[0].primaryImageUrl || localImagesMap().get(featured()[0].id);
                @if (mainImg) {
                  <img [src]="mainImg" (error)="onImageError($event, featured()[0])" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110">
                } @else {
                  <div class="w-full h-full flex items-center justify-center text-gray-200">
                    <svg class="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                  </div>
                }
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div class="absolute top-10 right-10 flex gap-3">
                  <span class="bg-[#0a8f96] text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg">{{ 'PROPERTY_DETAIL.EXCLUSIVE_PRICE' | translate }}</span>
                  <span class="bg-white/20 backdrop-blur-xl text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-white/20">{{ 'PROPERTY.LISTING_TYPES.' + featured()[0].listingType | translate }}</span>
                </div>

                <div class="absolute bottom-12 right-12 left-12 flex flex-col md:flex-row justify-between items-end gap-8">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 text-white/60 text-xs font-bold mb-4">
                      <svg class="w-4 h-4 text-[#0a8f96]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                      {{ getDistrictLabel(featured()[0].district) }}{{ featured()[0].city ? ', ' + getCityLabel(featured()[0].city) : '' }}
                    </div>
                    <h3 class="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{{ featured()[0].title }}</h3>
                    <div class="flex flex-wrap items-center gap-8 text-white text-sm font-bold">
                      <span class="flex items-center gap-3"><svg class="w-5 h-5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> {{ featured()[0].bedrooms }} {{ 'PROPERTY_DETAIL.BEDROOMS' | translate }}</span>
                      <span class="flex items-center gap-3"><svg class="w-5 h-5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg> {{ featured()[0].bathrooms }} {{ 'PROPERTY_DETAIL.BATHROOMS' | translate }}</span>
                      <span class="flex items-center gap-3"><svg class="w-5 h-5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg> {{ featured()[0].area | number }} {{ 'PROPERTY.AREA_UNIT' | translate }}</span>
                    </div>
                  </div>
                  <div class="text-right shrink-0 bg-white/10 backdrop-blur-3xl p-6 rounded-[32px] border border-white/20 ltr:text-left rtl:text-right">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">{{ 'PROPERTY.ASKING_PRICE' | translate }}</p>
                    <p class="text-3xl font-black text-white leading-none">{{ featured()[0].price | currencyEgp }}</p>
                  </div>
                </div>
              </a>

              <!-- Left 2 Stacked Cards (RTL) -->
              <div class="flex flex-col gap-8">
                @for (property of featured().slice(1, 3); track property.id) {
                  <a [routerLink]="['/properties', property.id]" class="flex-1 relative group cursor-pointer overflow-hidden rounded-[32px] shadow-xl min-h-[250px] block bg-gray-50">
                    @let stackImg = property.primaryImageUrl || localImagesMap().get(property.id);
                    @if (stackImg) {
                      <img [src]="stackImg" (error)="onImageError($event, property)" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110">
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-gray-200">
                        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                      </div>
                    }
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div class="absolute top-6 right-6">
                      <span class="bg-white/90 backdrop-blur-md text-gray-900 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">{{ 'RELATIVE_TIME.JUST_NOW' | translate }}</span>
                    </div>
                    <div class="absolute bottom-8 right-8 left-8">
                      <p class="text-[11px] font-bold text-white/60 mb-2">{{ 'CITIES.' + getCityKeyFromValue(property.city) | translate }}</p>
                      <h4 class="text-xl font-black text-white mb-3">{{ property.title }}</h4>
                      <p class="text-xl font-black text-[#0a8f96] bg-white/95 backdrop-blur-xl inline-block px-4 py-2 rounded-xl shadow-xl">{{ property.price | currencyEgp }}</p>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Recommended for You -->
      @if (auth.isAuthenticated() && (recommendedProperties().length > 0 || loadingRecommendations())) {
        <section class="py-24 bg-white">
          <div class="max-w-[1400px] mx-auto px-6 md:px-10">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div class="max-w-xl">
                <div class="flex items-center gap-2 mb-4">
                  <span class="w-2 h-2 rounded-full bg-[#0a8f96] animate-pulse"></span>
                  <span class="text-[10px] font-black text-[#0a8f96] uppercase tracking-[0.3em]">{{ 'HOME.RECOMMENDED_BADGE' | translate }}</span>
                </div>
                <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">{{ 'HOME.RECOMMENDED_TITLE' | translate | slice:0:6 }} <span class="text-[#0a8f96]">{{ 'HOME.RECOMMENDED_TITLE' | translate | slice:6 }}</span></h2>
                <p class="text-gray-400 font-bold text-sm leading-relaxed">{{ 'HOME.RECOMMENDED_DESC' | translate }}</p>
              </div>
              <a routerLink="/properties" class="group flex items-center gap-3 px-8 py-4 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 hover:bg-[#0a8f96] hover:text-white transition-all shadow-sm">
                {{ 'COMMON.VIEW_ALL' | translate }}
                <svg class="w-5 h-5 transition-transform rtl:rotate-180 group-hover:translate-x-2 ltr:group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>

            @if (loadingRecommendations()) {
              <div class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="w-12 h-12 border-2 border-gray-100 border-t-[#0a8f96] rounded-full animate-spin"></div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">{{ 'HOME.LOADING_RECOMMENDATIONS' | translate }}</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                @for (rp of recommendedProperties(); track rp.id) {
                  <a [routerLink]="['/properties', rp.id]" class="group block bg-white rounded-[20px] overflow-hidden border border-gray-100/80 hover:shadow-[0_16px_48px_rgba(10,143,150,0.1)] hover:-translate-y-1 transition-all duration-500 shadow-sm">
                    <div class="relative h-48 overflow-hidden bg-gray-50">
                      @let recImg = rp.primaryImageUrl || localImagesMap().get(rp.id);
                      @if (recImg) {
                        <img [src]="recImg" (error)="onImageError($event, rp)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                      } @else {
                        <div class="w-full h-full flex items-center justify-center text-gray-100">
                          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                        </div>
                      }
                      <div class="absolute top-4 right-4">
                        <span class="bg-[#0a8f96] text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">{{ 'PROPERTY_DETAIL.ANALYZING_SIMILAR' | translate | slice:0:7 }}</span>
                      </div>
                    </div>
                    <div class="p-6">
                      <h4 class="text-base font-black text-gray-900 mb-2 truncate">{{ rp.title }}</h4>
                      <p class="text-xs font-bold text-gray-400 mb-4 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                        {{ getDistrictLabel(rp.district) }}{{ rp.district && rp.city ? ', ' : '' }}{{ rp.city ? getCityLabel(rp.city) : '' }}
                      </p>
                      <div class="flex items-center justify-between">
                        <span class="text-lg font-black text-[#0a8f96]">{{ rp.price | currencyEgp }}</span>
                        <div class="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                          @if (rp.bedrooms) { <span>{{ rp.bedrooms }} {{ 'PROPERTY_DETAIL.BEDROOMS' | translate }}</span> }
                          @if (rp.area) { <span>{{ rp.area | number:'1.0-0' }} {{ 'PROPERTY.AREA_UNIT' | translate }}</span> }
                        </div>
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </section>
      }

      <!-- Top Agents -->
      <section class="py-24 bg-white">
        <div class="max-w-[1400px] mx-auto px-6 md:px-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div class="max-w-xl">
              <div class="flex items-center gap-2 mb-4">
                <span class="w-2 h-2 rounded-full bg-[#0a8f96]"></span>
                <span class="text-[10px] font-black text-[#0a8f96] uppercase tracking-[0.3em]">{{ 'HOME.AGENTS_BADGE' | translate }}</span>
              </div>
              <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">{{ 'HOME.AGENTS_TITLE' | translate | slice:0:9 }} <span class="text-[#0a8f96]">{{ 'HOME.AGENTS_TITLE' | translate | slice:9 }}</span></h2>
              <p class="text-gray-400 font-bold text-sm leading-relaxed">{{ 'HOME.AGENTS_DESC' | translate }}</p>
            </div>

            <!-- Agent Search -->
            <div class="relative w-full md:w-80">
              <input type="text"
                     [placeholder]="'HOME.AGENTS_SEARCH_PLACEHOLDER' | translate"
                     [ngModel]="agentSearchQuery()"
                     (ngModelChange)="onAgentSearch($event)"
                     class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all">
              <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          @if (searchingAgents()) {
            <div class="flex justify-center py-16">
              <div class="w-10 h-10 border-4 border-[#0a8f96] border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else if (displayedAgents().length === 0) {
            <div class="text-center py-16">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p class="text-gray-400 font-bold text-sm">{{ 'HOME.AGENTS_NO_RESULTS' | translate }}</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              @for (agent of displayedAgents(); track agent.userId) {
                <a [routerLink]="['/agents', agent.userId]" class="group block bg-white rounded-[20px] overflow-hidden border border-gray-100/80 hover:shadow-[0_16px_48px_rgba(10,143,150,0.1)] hover:-translate-y-1 transition-all duration-500 shadow-sm p-6 text-center">
                  <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-100 mx-auto mb-4 ring-4 ring-[#0a8f96]/10 group-hover:ring-[#0a8f96]/30 transition-all">
                    @if (agent.avatarUrl) {
                      <img [src]="agent.avatarUrl" [alt]="agent.displayName" class="w-full h-full object-cover">
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-[#0a8f96] text-2xl font-black bg-[#0a8f96]/10">
                        {{ agent.displayName?.charAt(0) || 'W' }}
                      </div>
                    }
                  </div>
                  <h4 class="text-base font-black text-gray-900 mb-1 group-hover:text-[#0a8f96] transition-colors">{{ agent.displayName }}</h4>
                  @if (agent.agencyName) {
                    <p class="text-xs font-bold text-gray-400 mb-3">{{ agent.agencyName }}</p>
                  }
                  <div class="flex items-center justify-center gap-1 mb-3">
                    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    <span class="text-sm font-black text-gray-900">{{ agent.rating | number:'1.1-1' }}</span>
                    <span class="text-xs font-bold text-gray-400">({{ agent.reviewCount }})</span>
                  </div>
                  @if (agent.isVerified) {
                    <span class="inline-flex items-center gap-1 px-3 py-1 bg-[#0a8f96]/10 text-[#0a8f96] rounded-full text-[10px] font-black uppercase tracking-wider">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="verify"/></svg>
                      {{ 'HOME.VERIFIED' | translate }}
                    </span>
                  }
                </a>
              }
            </div>
          }
        </div>
      </section>

      <!-- Recently Sold Properties -->
      <section class="py-32 bg-white">
        <div class="max-w-[1400px] mx-auto px-6 md:px-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div class="max-w-xl">
              <div class="flex items-center gap-2 mb-4">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">{{ 'HOME.SOLD_BADGE' | translate }}</span>
              </div>
              <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">{{ 'HOME.SOLD_TITLE' | translate | slice:0:9 }} <span class="text-emerald-500">{{ 'HOME.SOLD_TITLE' | translate | slice:9 }}</span></h2>
              <p class="text-gray-400 font-bold text-sm leading-relaxed">{{ 'HOME.SOLD_DESC' | translate }}</p>
            </div>
            <a routerLink="/properties" [queryParams]="{ status: 'Sold' }" class="group flex items-center gap-3 px-8 py-4 bg-gray-50 rounded-2xl text-sm font-black text-gray-900 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
              {{ 'COMMON.VIEW_ALL' | translate }}
              <svg class="w-5 h-5 transition-transform rtl:rotate-180 group-hover:translate-x-2 ltr:group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </a>
          </div>

          @if (loadingSold()) {
            <div class="flex flex-col items-center justify-center py-20 gap-4">
              <div class="w-12 h-12 border-2 border-gray-100 border-t-emerald-500 rounded-full animate-spin"></div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">{{ 'HOME.LOADING_SOLD' | translate }}</p>
            </div>
          } @else if (soldProperties().length === 0) {
            <div class="text-center py-16">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p class="text-gray-400 font-bold text-sm">{{ 'HOME.SOLD_NO_RESULTS' | translate }}</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              @for (property of soldProperties(); track property.id) {
                <a [routerLink]="['/properties', property.id]" class="group block bg-white rounded-[20px] overflow-hidden border border-gray-100/80 hover:shadow-[0_16px_48px_rgba(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-500 shadow-sm">
                  <div class="relative h-48 overflow-hidden bg-gray-50">
                    @let soldImg = property.primaryImageUrl || localImagesMap().get(property.id);
                    @if (soldImg) {
                      <img [src]="soldImg" (error)="onImageError($event, property)" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-gray-100">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                      </div>
                    }
                    <div class="absolute top-4 right-4">
                      <span class="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg">{{ 'HOME.SOLD_LABEL' | translate }}</span>
                    </div>
                  </div>
                  <div class="p-6">
                    <h4 class="text-base font-black text-gray-900 mb-2 truncate">{{ property.title }}</h4>
                    <p class="text-xs font-bold text-gray-400 mb-4 flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                      {{ getDistrictLabel(property.district) }}{{ property.district && property.city ? ', ' : '' }}{{ property.city ? getCityLabel(property.city) : '' }}
                    </p>
                    <div class="flex items-center justify-between">
                      <span class="text-lg font-black text-emerald-500">{{ property.price | currencyEgp }}</span>
                      <div class="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                        @if (property.bedrooms) { <span>{{ property.bedrooms }} {{ 'PROPERTY_DETAIL.BEDROOMS' | translate }}</span> }
                        @if (property.area) { <span>{{ property.area | number:'1.0-0' }} {{ 'PROPERTY.AREA_UNIT' | translate }}</span> }
                      </div>
                    </div>
                  </div>
                </a>
              }
            </div>
          }
        </div>
      </section>

      <!-- The Difference -->
      <section class="py-32 bg-sky-50 relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 32px 32px;"></div>
        <div class="absolute top-20 right-20 w-72 h-72 bg-[#0a8f96]/10 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-20 left-20 w-96 h-96 bg-[#076b70]/10 rounded-full blur-[150px]"></div>
        <div class="max-w-7xl mx-auto px-6 relative z-10">
          <div class="text-center mb-20">
            <h2 class="text-4xl md:text-5xl font-black text-black mb-5 tracking-tighter">{{ 'HOME.WHY_TITLE' | translate | slice:0:11 }} <span class="text-[#12b5bd]">{{ 'HOME.WHY_TITLE' | translate | slice:11 }}</span></h2>
            <div class="w-40 h-1.5 bg-primary rounded-full mx-auto my-4"></div>
            <p class="text-gray-600 font-bold max-w-2xl mx-auto leading-relaxed">{{ 'HOME.WHY_SUB' | translate }}</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="group p-10 bg-white backdrop-blur-xl border border-white/10 rounded-[32px] transition-all duration-500 hover:bg-white/10 hover:border-[#0a8f96]/30 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(10,143,150,0.15)] relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0a8f96] to-transparent rounded-l-[32px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-14 h-14 rounded-2xl bg-[#0a8f96]/20 flex items-center justify-center text-[#12b5bd] mb-8 transition-transform group-hover:rotate-12 group-hover:scale-110 border border-[#0a8f96]/20">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 class="text-xl font-black text-black mb-4">{{ 'HOME.WHY_1_TITLE' | translate }}</h3>
              <p class="text-sm text-gray-600 leading-relaxed font-medium">{{ 'HOME.WHY_1_DESC' | translate }}</p>
            </div>
            
            <div class="group p-10 bg-white backdrop-blur-xl border border-white/10 rounded-[32px] transition-all duration-500 hover:bg-white/10 hover:border-[#0a8f96]/30 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(10,143,150,0.15)] relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0a8f96] to-transparent rounded-l-[32px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-14 h-14 rounded-2xl bg-[#0a8f96]/20 flex items-center justify-center text-[#12b5bd] mb-8 transition-transform group-hover:rotate-12 group-hover:scale-110 border border-[#0a8f96]/20">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <h3 class="text-xl font-black text-black mb-4">{{ 'HOME.WHY_2_TITLE' | translate }}</h3>
              <p class="text-sm text-gray-600 leading-relaxed font-medium">{{ 'HOME.WHY_2_DESC' | translate }}</p>
            </div>

            <div class="group p-10 bg-white backdrop-blur-xl border border-white/10 rounded-[32px] transition-all duration-500 hover:bg-white/10 hover:border-[#0a8f96]/30 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(10,143,150,0.15)] relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0a8f96] to-transparent rounded-l-[32px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="w-14 h-14 rounded-2xl bg-[#0a8f96]/20 flex items-center justify-center text-[#12b5bd] mb-8 transition-transform group-hover:rotate-12 group-hover:scale-110 border border-[#0a8f96]/20">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 class="text-xl font-black text-black mb-4">{{ 'HOME.WHY_3_TITLE' | translate }}</h3>
              <p class="text-sm text-gray-600 leading-relaxed font-medium">{{ 'HOME.WHY_3_DESC' | translate }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  featured = signal<PropertyListItem[]>([]);
  recommendedProperties = signal<PropertyListItem[]>([]);
  topAgents = signal<AgentDetail[]>([]);
  agentSearchQuery = signal('');
  searchingAgents = signal(false);
  displayedAgents = computed(() => {
    const q = this.agentSearchQuery().trim().toLowerCase();
    if (!q) return this.topAgents();
    return this.topAgents().filter(a =>
      (a.displayName || '').toLowerCase().includes(q) ||
      (a.agencyName || '').toLowerCase().includes(q)
    );
  });
  loadingRecommendations = signal(false);
  soldProperties = signal<PropertyListItem[]>([]);
  loadingSold = signal(false);
  localImagesMap = signal<Map<string, string>>(new Map());
  aiRequestId = '';
  private destroyed = false;

  // Search State
  searchCity = '';
  citySearchQuery = signal('');
  selectedType = signal('');
  showCityDropdown = signal(false);
  showTypeDropdown = signal(false);

  egyptRegions = EGYPT_REGIONS;
  activeGov = signal<Governorate | null>(EGYPT_REGIONS[0]);

  filteredGovernorates = computed(() => {
    const query = this.citySearchQuery().toLowerCase().trim();
    if (!query) return this.egyptRegions;
    return this.egyptRegions.filter(gov => {
      const matchGov = gov.nameAr.toLowerCase().includes(query) || gov.nameEn.toLowerCase().includes(query);
      const matchCities = gov.cities.some(city => 
        city.nameAr.toLowerCase().includes(query) || city.nameEn.toLowerCase().includes(query)
      );
      return matchGov || matchCities;
    });
  });

  // Backend Filter Mapping (English key -> Arabic value expected by API).
  // These are DATA constants used for backend communication, not user-facing text.
  // They mirror the CITIES/DISTRICTS entries in public/i18n/ar.json and must be
  // kept in sync when adding new locations. User-facing display uses
  // translate.instant('CITIES.Cairo') etc. directly.
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

  public getCityLabel(value: string | undefined): string {
    if (!value) return '';
    const key = this.getCityKeyFromValue(value);
    const isAr = this.translate.currentLang === 'ar';
    for (const gov of this.egyptRegions) {
      if (gov.id === key) {
        return isAr ? gov.nameAr : gov.nameEn;
      }
      const city = gov.cities.find(c => c.id === key);
      if (city) {
        return isAr ? city.nameAr : city.nameEn;
      }
    }
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

  get cities(): string[] {
    const ids: string[] = [];
    this.egyptRegions.forEach(gov => {
      gov.cities.forEach(city => {
        if (city.id) ids.push(city.id);
      });
    });
    return ids;
  }

  propertyTypes = [
    { id: 'Apartment', icon: '🏢' },
    { id: 'Villa', icon: '🏡' },
    { id: 'Office', icon: '💼' },
    { id: 'Land', icon: '🏜️' }
  ];

  constructor(
    private propertyService: PropertyService, 
    public auth: AuthService, 
    private aiService: AiService,
    private agentService: AgentService,
    private localImageService: LocalImageService,
    public translate: TranslateService
  ) {}

  @HostListener('document:click')
  closeDropdowns() {
    this.showCityDropdown.set(false);
    this.showTypeDropdown.set(false);

    const query = this.citySearchQuery().trim();
    if (!query) {
      this.searchCity = '';
      this.citySearchQuery.set('');
    } else {
      const isAr = this.translate.currentLang === 'ar';
      const gov = this.activeGov();
      if (gov) {
        const govName = isAr ? gov.nameAr : gov.nameEn;
        const allCitiesLabel = `${govName} - ${this.translate.instant('HOME.ALL_CITIES')}`;
        if (query === allCitiesLabel) {
          this.searchCity = '';
          this.citySearchQuery.set(allCitiesLabel);
          return;
        }
      }

      let matchedCity: any = null;
      for (const g of this.egyptRegions) {
        const city = g.cities.find(c => {
          const expected = isAr ? c.nameAr : c.nameEn;
          return query.toLowerCase() === expected.toLowerCase() || query.toLowerCase() === c.id.toLowerCase();
        });
        if (city) {
          matchedCity = city;
          break;
        }
      }

      if (matchedCity) {
        this.searchCity = matchedCity.id;
        this.citySearchQuery.set(isAr ? matchedCity.nameAr : matchedCity.nameEn);
      } else {
        this.searchCity = query;
        this.citySearchQuery.set(query);
      }
    }
  }

  hoverGovernorate(gov: Governorate) {
    this.activeGov.set(gov);
  }

  selectGovernorate(gov: Governorate) {
    this.activeGov.set(gov);
  }

  selectCityOfGov(city: { id: string, nameAr: string, nameEn: string }) {
    const isAr = this.translate.currentLang === 'ar';
    const gov = this.activeGov();
    
    if (!city.id) {
      this.searchCity = '';
      const govName = gov ? (isAr ? gov.nameAr : gov.nameEn) : '';
      this.citySearchQuery.set(govName ? `${govName} - ${this.translate.instant('HOME.ALL_CITIES')}` : '');
    } else {
      this.searchCity = city.id;
      this.citySearchQuery.set(isAr ? city.nameAr : city.nameEn);
    }
    
    this.showCityDropdown.set(false);
  }

  onCityQueryChange(query: string) {
    this.citySearchQuery.set(query);
    this.showCityDropdown.set(true);

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      this.searchCity = '';
      return;
    }

    const normalizedQuery = trimmedQuery.toLowerCase();
    
    let matchedCity: any = null;
    let matchedGov: any = null;
    
    for (const gov of this.egyptRegions) {
      const city = gov.cities.find(c => 
        c.nameAr.toLowerCase() === normalizedQuery || 
        c.nameEn.toLowerCase() === normalizedQuery ||
        c.id.toLowerCase() === normalizedQuery
      );
      if (city) {
        matchedCity = city;
        matchedGov = gov;
        break;
      }
    }
    
    if (matchedCity) {
      this.searchCity = matchedCity.id;
      this.activeGov.set(matchedGov);
    } else {
      const gov = this.egyptRegions.find(g => 
        g.nameAr.toLowerCase() === normalizedQuery || 
        g.nameEn.toLowerCase() === normalizedQuery ||
        g.id.toLowerCase() === normalizedQuery
      );
      if (gov) {
        this.searchCity = '';
        this.activeGov.set(gov);
      } else {
        this.searchCity = trimmedQuery;
      }
    }
  }

  selectType(typeId: string) {
    this.selectedType.set(typeId);
    this.showTypeDropdown.set(false);
  }

  private agentSearchTimeout: any;
  async onAgentSearch(query: string) {
    this.agentSearchQuery.set(query);
    clearTimeout(this.agentSearchTimeout);
    if (query.trim().length >= 2) {
      this.searchingAgents.set(true);
      this.agentSearchTimeout = setTimeout(async () => {
        try {
          const results = await this.agentService.search(query.trim(), 8);
          this.topAgents.set(results);
        } catch {}
        this.searchingAgents.set(false);
      }, 400);
    } else if (query.trim().length === 0) {
      this.searchingAgents.set(true);
      try {
        const agents = await this.agentService.getTopAgents(4);
        this.topAgents.set(agents);
      } catch {}
      this.searchingAgents.set(false);
    }
  }

  async ngOnInit() {
    try {
      const result = await this.propertyService.getAll({ pageSize: 8 });
      this.featured.set(result.items);
      this.loadLocalImages(result.items);
    } catch { /* ignore on homepage */ }

    // Load top agents
    try {
      const agents = await this.agentService.getTopAgents(4);
      this.topAgents.set(agents);
    } catch { /* ignore */ }

    // Load sold properties
    this.loadSoldProperties();

    // Load personalized recommendations for authenticated buyers
    if (this.auth.isAuthenticated() && (this.auth.isBuyer() || this.auth.isAdmin())) {
      this.loadRecommendations();
    }
  }

  private async loadSoldProperties() {
    this.loadingSold.set(true);
    try {
      const result = await this.propertyService.getAll({ status: 'Sold', pageSize: 8 });
      this.soldProperties.set(result.items);
      this.loadLocalImages(result.items);
    } catch {
      // Silently fail — sold properties are non-critical
    } finally {
      this.loadingSold.set(false);
    }
  }

  private async loadRecommendations() {
    this.loadingRecommendations.set(true);
    try {
      const res = await this.aiService.createRecommendation({
        sourceEntityType: 'history',
        topN: 8
      });
      this.aiRequestId = res.requestId;

      let attempts = 0;
      while (attempts < 15 && !this.destroyed) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (this.destroyed) break;
        const status = await this.aiService.getRecommendationStatus(res.requestId);
        if (status.status !== 'Pending') {
          if (status.results && status.results.length > 0) {
            const properties: PropertyListItem[] = [];
            for (const r of status.results) {
              if (r.recommendedPropertyId) {
                try {
                  const prop = await this.propertyService.getById(r.recommendedPropertyId);
                  let imgUrl = prop.images?.[0]?.url || '';
                  if (imgUrl) imgUrl = getPropertyImageUrl(imgUrl, prop.title);
                  else imgUrl = this.localImageService.getThumbnail(prop.id) || buildPropertyPlaceholder(prop.title);
                  
                  properties.push({
                    id: prop.id,
                    agentUserId: prop.agentUserId,
                    title: prop.title,
                    price: prop.price,
                    area: prop.area,
                    bedrooms: prop.bedrooms,
                    bathrooms: prop.bathrooms,
                    city: prop.city,
                    district: prop.district,
                    propertyType: prop.propertyType,
                    listingType: prop.listingType,
                    status: prop.status,
                    isFeatured: prop.isFeatured,
                    primaryImageUrl: imgUrl
                  });
                } catch {
                  // Fallback: use snapshot data if property was deleted
                  if (r.snapshotTitle) {
                    properties.push({
                      id: r.recommendedPropertyId,
                      agentUserId: '',
                      title: r.snapshotTitle,
                      price: r.snapshotPrice || 0,
                      area: 0, bedrooms: 0, bathrooms: 0,
                      propertyType: '', listingType: '',
                      status: 'unavailable', isFeatured: false
                    });
                  }
                }
              }
            }
            this.recommendedProperties.set(properties);
            this.loadLocalImages(properties);
          }
          break;
        }
        attempts++;
      }
    } catch {
      // Silently fail — recommendations are non-critical
    } finally {
      this.loadingRecommendations.set(false);
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  private async loadLocalImages(properties: PropertyListItem[]) {
    const map = new Map(this.localImagesMap());
    for (const p of properties) {
      // Normalize primaryImageUrl to absolute URL if it's relative
      if (p.primaryImageUrl) {
        p.primaryImageUrl = getPropertyImageUrl(p.primaryImageUrl, p.title) || '';
      }

      // Check fast localStorage cache first
      const thumb = this.localImageService.getThumbnail(p.id);
      if (thumb) {
        map.set(p.id, thumb);
        continue;
      }

      // Check IndexedDB
      const local = await this.localImageService.getImages(p.id);
      if (local && local.length > 0) {
        map.set(p.id, local[0]);
        this.localImageService.saveThumbnail(p.id, local[0]);
      } else if (!p.primaryImageUrl) {
        map.set(p.id, buildPropertyPlaceholder(p.title));
      }
    }
    this.localImagesMap.set(map);
  }

  async onImageError(event: any, property: PropertyListItem) {
    // If the primary image fails, clear it and use local images
    if (property.primaryImageUrl) {
      property.primaryImageUrl = '';
      
      // Force refresh signals to trigger re-render of @let variables
      this.featured.set([...this.featured()]);
      this.recommendedProperties.set([...this.recommendedProperties()]);

      // Ensure local image is in the map
      const local = await this.localImageService.getImages(property.id);
      if (local && local.length > 0) {
        this.localImagesMap.update(map => {
          const newMap = new Map(map);
          newMap.set(property.id, local[0]);
          return newMap;
        });
      }
    }
  }
}
