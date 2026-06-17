import { Component, input, output, signal, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { Property, PropertyListItem } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { PropertyService } from '../../../features/properties/services/property.service';
import { extractApiError } from '../../../core/utils/api-error';
import { CurrencyEgpPipe } from '../../pipes/currency-egp.pipe';
import { buildPropertyPlaceholder } from '../../../core/utils/media';
import { LocalizedDatePipe } from '../../pipes/localized-date.pipe';

@Component({
  selector: 'app-property-compare',
  standalone: true,
  imports: [
    TranslateModule, 
    RouterLink, 
    DecimalPipe, 
    CurrencyEgpPipe,
    LocalizedDatePipe
  ],
  template: `
    <!-- Floating Comparison Tray -->
    @if (selectedProperties().length > 0) {
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex items-center justify-between gap-4 animate-slide-up select-none">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-[#0a8f96]/10 text-[#0a8f96] flex items-center justify-center font-black text-sm select-none animate-scale-in">
            {{ selectedProperties().length }}
          </span>
          <div class="text-right">
            <h3 class="text-xs font-black text-slate-800 leading-none mb-1">{{ 'COMPARE.TRAY_TITLE' | translate }}</h3>
            <p class="text-[9px] text-slate-400 font-bold">{{ 'COMPARE.TRAY_HELP' | translate }}</p>
          </div>
        </div>
        
        <!-- Selected Thumbnails with Drag & Drop -->
        <div class="hidden sm:flex items-center gap-2 overflow-hidden max-w-[200px]">
          @for (item of selectedProperties(); track item.id; let i = $index) {
            <div draggable="true"
                 (dragstart)="onDragStart(i)"
                 (dragover)="onDragOver(i)"
                 (drop)="onDrop()"
                 (dragend)="onDragEnd()"
                 [class.opacity-50]="dragIndex() === i"
                 [class.ring-2]="dragOverIndex() === i"
                 [class.ring-[#0a8f96]]="dragOverIndex() === i"
                 [class.scale-110]="dragOverIndex() === i"
                 class="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0 group/thumb animate-scale-in cursor-grab active:cursor-grabbing transition-all">
              <img [src]="item.primaryImageUrl || propertyFallback(item.title)" class="w-full h-full object-cover pointer-events-none">
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
                  [disabled]="selectedProperties().length < 2"
                  [class.opacity-50]="selectedProperties().length < 2"
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
          <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-[#0a8f96]/10 flex items-center justify-center text-lg">⚖️</div>
              <div>
                <h2 class="text-lg font-black text-slate-900 leading-none mb-1">{{ 'COMPARE.MATRIX_TITLE' | translate }}</h2>
                <p class="text-[10px] text-slate-400 font-bold">{{ 'COMPARE.MATRIX_SUBTITLE' | translate }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button (click)="shareComparison()" class="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-[#0a8f96] transition-colors cursor-pointer" [title]="'COMPARE.SHARE' | translate">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              </button>
              <button (click)="showCompareModal.set(false)" class="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
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
              <!-- Score Cards Section -->
              <div class="mb-8">
                <h3 class="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                  <span class="w-1.5 h-5 bg-[#0a8f96] rounded-full"></span>
                  {{ 'COMPARE.SCORE_TITLE' | translate }}
                </h3>
                <div class="grid gap-4" [style.grid-template-columns]="'repeat(' + comparedPropertiesDetails().length + ', 1fr)'">
                  @for (p of comparedPropertiesDetails(); track p.id) {
                    <div class="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                      <p class="text-xs font-black text-slate-800 truncate mb-3">{{ p.title }}</p>
                      <!-- Overall Score -->
                      <div class="text-center mb-4">
                        <div class="text-3xl font-black" [class]="getScoreColor(getOverallScore(p))">{{ getOverallScore(p) }}</div>
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{{ 'COMPARE.SCORE_TITLE' | translate }}</p>
                      </div>
                      <!-- Breakdown -->
                      <div class="space-y-2">
                        <div>
                          <div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>{{ 'COMPARE.SCORE_VALUE' | translate }}</span>
                            <span>{{ getValueScore(p) }}%</span>
                          </div>
                          <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all" [class]="getScoreBarColor(getValueScore(p))" [style.width.%]="getValueScore(p)"></div>
                          </div>
                        </div>
                        <div>
                          <div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>{{ 'COMPARE.SCORE_SPACE' | translate }}</span>
                            <span>{{ getSpaceScore(p) }}%</span>
                          </div>
                          <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all" [class]="getScoreBarColor(getSpaceScore(p))" [style.width.%]="getSpaceScore(p)"></div>
                          </div>
                        </div>
                        <div>
                          <div class="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>{{ 'COMPARE.SCORE_AMENITIES' | translate }}</span>
                            <span>{{ getAmenitiesPercent(p) }}%</span>
                          </div>
                          <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all" [class]="getScoreBarColor(getAmenitiesPercent(p))" [style.width.%]="getAmenitiesPercent(p)"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Local AI-powered Summary Card -->
              <div class="mb-8 bg-gradient-to-br from-[#0a8f96]/5 via-teal-500/5 to-transparent border border-[#0a8f96]/15 rounded-[24px] p-6 shadow-sm">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0a8f96] to-teal-400 text-white flex items-center justify-center text-xl shadow-md shrink-0">✨</div>
                  <div class="flex-1">
                    <h3 class="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                      <span>{{ 'FAQ.HELP_CHAT_BTN' | translate }}</span>
                      <span class="bg-[#0a8f96]/10 text-[#0a8f96] text-[8px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-[#0a8f96]/10">LOCAL AI</span>
                    </h3>
                    <p class="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line">{{ generateLocalAiSummary() }}</p>
                  </div>
                </div>
              </div>

              <!-- Comparison Matrix Grid Table -->
              <div class="overflow-x-auto min-w-full">
                <div class="grid gap-y-0 gap-x-6 min-w-[700px] divide-y divide-slate-100"
                     [style.grid-template-columns]="'140px repeat(' + comparedPropertiesDetails().length + ', 1fr)'">
                  
                  <!-- Row 1: Property Images & Titles -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-400 flex items-center">📷 {{ 'COMPARE.PROPERTY' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 relative flex flex-col group/col">
                        <!-- Delete Column button -->
                        <button (click)="removeComparedProperty(p.id)" class="absolute top-2 left-2 z-20 w-7 h-7 bg-white/95 rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer" [title]="'COMPARE.REMOVE' | translate">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                        
                        <!-- Property Visual Thumbnail Carousel -->
                        <div class="w-full h-36 rounded-2xl overflow-hidden border border-slate-100 mb-3 relative bg-slate-50 group/img select-none">
                          <!-- Image -->
                          <img [src]="getCompareImage(p)" 
                               class="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover/img:scale-105" 
                               (click)="activeLightboxImage.set(getCompareImage(p))">
                          
                          <!-- Carousel Navigation Controls -->
                          @if (p.images && p.images.length > 1) {
                            <button (click)="prevCompareImage(p, $event)" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-md flex items-center justify-center text-slate-700 hover:bg-white hover:scale-105 active:scale-95 opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button (click)="nextCompareImage(p, $event)" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-md flex items-center justify-center text-slate-700 hover:bg-white hover:scale-105 active:scale-95 opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
                            </button>
                          }
                          
                          <!-- Image Index Badge -->
                          <span class="absolute top-5 left-2 bg-slate-950/60 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/10 select-none">
                            {{ getCompareImageIndex(p.id) + 1 }} / {{ p.images?.length || 1 }}
                          </span>

                          <!-- Property Type Badge -->
                          <span class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md text-[9px] font-black px-2 py-0.5 rounded text-[#0a8f96] border border-[#0a8f96]/10 select-none">
                            {{ 'PROPERTY.TYPES.' + p.propertyType | translate }}
                          </span>
                        </div>
                        
                        <a [routerLink]="['/properties', p.id]" (click)="showCompareModal.set(false)" class="text-sm font-black text-slate-900 hover:text-[#0a8f96] transition-colors leading-tight line-clamp-2">{{ p.title }}</a>
                      </div>
                    }
                  </div>

                  <!-- Group 1 Header: Core Specs (المواصفات الأساسية) -->
                  <div class="col-span-full py-3 px-4 bg-slate-100/60 backdrop-blur-sm rounded-xl text-xs font-black text-[#0a8f96] flex items-center gap-2 mt-6 mb-2 select-none border border-slate-200/10">
                    <span>📊</span>
                    <span>{{ 'COMPARE.CORE_SPECS' | translate }}</span>
                  </div>

                  <!-- Row 2: Price with visual bar + diff -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">💰 {{ 'COMPARE.PRICE' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex flex-col gap-1">
                        <div class="text-lg font-black tracking-tight flex flex-wrap items-center gap-2"
                             [class.text-emerald-600]="isWinner(p.id, 'price')"
                             [style.color]="!isWinner(p.id, 'price') ? '#0a8f96' : ''">
                          <span>{{ p.price | currencyEgp }}</span>
                          @if (isWinner(p.id, 'price')) {
                            <span class="bg-emerald-500/10 text-emerald-600 text-[8px] font-black px-2.5 py-1 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                              🏆 {{ 'COMPARE.WINNER_PRICE' | translate }}
                            </span>
                          }
                          @if (getDiff(p.id, 'price'); as diff) {
                            <span class="text-[10px] font-bold flex items-center gap-0.5"
                                  [class.text-red-500]="diff.isHigher"
                                  [class.text-emerald-500]="!diff.isHigher">
                              {{ diff.isHigher ? '▲' : '▼' }} {{ diff.value | currencyEgp }}
                              <span class="text-slate-400 font-normal">({{ 'COMPARE.DIFF_PREFIX' | translate }})</span>
                            </span>
                          }
                        </div>
                        <!-- Visual price bar -->
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[180px]">
                          <div class="h-full bg-gradient-to-r from-[#0a8f96] to-teal-400 rounded-full" 
                               [style.width.%]="(p.price / getMaxValue('price')) * 100"></div>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Price per Square Meter -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🏷️ {{ 'COMPARE.PRICE_SQM' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 text-sm font-black flex flex-wrap items-center gap-2"
                           [class.text-emerald-600]="isWinner(p.id, 'pricePerSqm')"
                           [class.text-slate-900]="!isWinner(p.id, 'pricePerSqm')">
                        <span>{{ (p.price / p.area) | currencyEgp }} <span class="text-[10px] font-normal text-slate-400">/ {{ 'PROPERTY.AREA_UNIT' | translate }}</span></span>
                        @if (isWinner(p.id, 'pricePerSqm')) {
                          <span class="bg-emerald-500/10 text-emerald-600 text-[8px] font-black px-2.5 py-1 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                            🏆 {{ 'COMPARE.WINNER_SQM' | translate }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row 4: Area with visual bar + diff -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">📐 {{ 'COMPARE.AREA' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex flex-col gap-1">
                        <div class="text-sm font-black text-slate-900 flex flex-wrap items-center gap-2">
                          <span>{{ p.area | number }} <span class="text-[10px] font-normal text-slate-400 mr-1">{{ 'PROPERTY.AREA_UNIT' | translate }}</span></span>
                          @if (isWinner(p.id, 'area')) {
                            <span class="bg-indigo-500/10 text-indigo-600 text-[8px] font-black px-2.5 py-1 rounded-full border border-indigo-500/10 uppercase tracking-wider">
                              🏆 {{ 'COMPARE.WINNER_AREA' | translate }}
                            </span>
                          }
                          @if (getDiff(p.id, 'area'); as diff) {
                            <span class="text-[10px] font-bold flex items-center gap-0.5"
                                  [class.text-red-500]="diff.isHigher"
                                  [class.text-emerald-500]="!diff.isHigher">
                              {{ diff.isHigher ? '▲' : '▼' }} {{ diff.value | number }}
                              <span class="text-slate-400 font-normal">{{ 'PROPERTY.AREA_UNIT' | translate }} ({{ 'COMPARE.DIFF_PREFIX' | translate }})</span>
                            </span>
                          }
                        </div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[180px]">
                          <div class="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full" 
                               [style.width.%]="(p.area / getMaxValue('area')) * 100"></div>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Row 5: Bedrooms & Bathrooms with diff -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🛏️ {{ 'COMPARE.ROOMS_BATHS' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 text-xs font-bold text-slate-700 flex flex-wrap items-center gap-4">
                        <div class="flex items-center gap-1">
                           <span class="text-slate-400">🚪</span>
                           <span [class.text-indigo-600]="isWinner(p.id, 'bedrooms')" [class.font-black]="isWinner(p.id, 'bedrooms')">
                             {{ p.bedrooms }} {{ 'COMPARE.ROOMS' | translate }}
                           </span>
                           @if (isWinner(p.id, 'bedrooms')) {
                             <span class="bg-indigo-500/10 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-indigo-500/10">
                               {{ 'COMPARE.WINNER_BEDS' | translate }}
                             </span>
                           }
                           @if (getDiff(p.id, 'bedrooms'); as diff) {
                             <span class="text-[10px] font-bold"
                                   [class.text-red-500]="diff.isHigher"
                                   [class.text-emerald-500]="!diff.isHigher">
                               {{ diff.isHigher ? '▲' : '▼' }} {{ diff.value }} ({{ 'COMPARE.DIFF_PREFIX' | translate }})
                             </span>
                           }
                        </div>
                        <div class="flex items-center gap-1">
                           <span class="text-slate-400">🛁</span>
                           <span>{{ p.bathrooms }} {{ 'COMPARE.BATHS' | translate }}</span>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Row 3: City & District -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">📍 {{ 'COMPARE.LOCATION' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-[#0a8f96] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span>{{ getDistrictLabel(p.district) }}، {{ getCityLabel(p.city) }}</span>
                      </div>
                    }
                  </div>

                  <!-- Row 6: Listing Type & Status -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">💼 {{ 'COMPARE.TYPE_STATUS' | translate }}</div>
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

                  <!-- Row: Floor -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🏢 {{ 'COMPARE.FLOOR' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 text-xs font-bold text-slate-700">
                        @if (p.floor != null) {
                          <span>{{ p.floor }}{{ p.totalFloors ? ' / ' + p.totalFloors : '' }}</span>
                        } @else {
                          <span class="text-slate-400">{{ 'COMPARE.NOT_SPECIFIED' | translate }}</span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row: Images Count -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🖼️ {{ 'COMPARE.IMAGES_COUNT' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 text-xs font-bold text-slate-700">
                        {{ p.images?.length || 0 }}
                      </div>
                    }
                  </div>

                  <!-- Row: Created Date -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">📅 {{ 'COMPARE.CREATED' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 text-xs font-bold text-slate-700">
                        {{ p.createdOnUtc | localizedDate:'medium' }}
                      </div>
                    }
                  </div>

                  <!-- Row: Agent -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">👤 {{ 'COMPARE.AGENT' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 text-xs font-bold text-slate-700 flex items-center gap-2">
                        @if (p.agent) {
                          <span>{{ p.agent.agencyName || p.agent.displayName }}</span>
                          @if (p.agent.rating) {
                            <span class="text-amber-500 text-[10px]">★ {{ p.agent.rating.toFixed(1) }}</span>
                          }
                        } @else {
                          <span class="text-slate-400">{{ 'COMPARE.NOT_SPECIFIED' | translate }}</span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row: Description (truncated) -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">📄 {{ 'COMPARE.DESCRIPTION' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 text-xs font-bold text-slate-600 leading-relaxed line-clamp-3">
                        @if (p.description) {
                          {{ p.description.length > 150 ? (p.description.slice(0, 150) + '...') : p.description }}
                        } @else {
                          <span class="text-slate-400">{{ 'COMPARE.NOT_SPECIFIED' | translate }}</span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Group 2 Header: Amenities & Additional Specs (المرافق والخدمات الإضافية) -->
                  <div class="col-span-full py-3 px-4 bg-slate-100/60 backdrop-blur-sm rounded-xl text-xs font-black text-[#0a8f96] flex items-center gap-2 mt-8 mb-2 select-none border border-slate-200/10">
                    <span>🏡</span>
                    <span>{{ 'COMPARE.AMENITIES_SPECS' | translate }}</span>
                  </div>

                  <!-- Row 7: Furnishing & View -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🛋️ {{ 'COMPARE.FURNISHING_VIEW' | translate }}</div>
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

                  <!-- Amenities Match Rate -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">📊 {{ 'COMPARE.AMENITIES_INTEGRATION' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex flex-col gap-1.5 max-w-[180px]">
                        <div class="flex justify-between items-center text-[10px] font-bold text-slate-600">
                          <span>{{ getAmenitiesScore(p) }} / 7</span>
                          <span class="bg-slate-100 text-slate-500 text-[8px] px-1.5 py-0.5 rounded-md font-black">
                            {{ getAmenitiesScore(p) >= 5 ? ('COMPARE.AMENITIES_HIGH' | translate) : getAmenitiesScore(p) >= 3 ? ('COMPARE.AMENITIES_MED' | translate) : ('COMPARE.AMENITIES_LOW' | translate) }}
                          </span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-gradient-to-r from-[#0a8f96] to-teal-400 rounded-full transition-all duration-500" [style.width.%]="(getAmenitiesScore(p) / 7) * 100"></div>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Row 8: Parking -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🚗 {{ 'COMPARE.PARKING' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex items-center">
                        @if (p.amenity?.hasParking) {
                          <span class="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            {{ 'COMPARE.AVAILABLE' | translate }}
                          </span>
                        } @else {
                          <span class="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">•</span>
                            {{ 'COMPARE.UNAVAILABLE' | translate }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row 9: Swimming Pool -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🏊 {{ 'COMPARE.POOL' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex items-center">
                        @if (p.amenity?.hasPool) {
                          <span class="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            {{ 'COMPARE.AVAILABLE' | translate }}
                          </span>
                        } @else {
                          <span class="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">•</span>
                            {{ 'COMPARE.UNAVAILABLE' | translate }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row 10: Gym -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🏋️ {{ 'COMPARE.GYM' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex items-center">
                        @if (p.amenity?.hasGym) {
                          <span class="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            {{ 'COMPARE.AVAILABLE' | translate }}
                          </span>
                        } @else {
                          <span class="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">•</span>
                            {{ 'COMPARE.UNAVAILABLE' | translate }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row 11: Elevator -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🛗 {{ 'COMPARE.ELEVATOR' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex items-center">
                        @if (p.amenity?.hasElevator) {
                          <span class="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            {{ 'COMPARE.AVAILABLE' | translate }}
                          </span>
                        } @else {
                          <span class="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">•</span>
                            {{ 'COMPARE.UNAVAILABLE' | translate }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row 12: Balcony -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🌅 {{ 'COMPARE.BALCONY' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex items-center">
                        @if (p.amenity?.hasBalcony) {
                          <span class="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            {{ 'COMPARE.AVAILABLE' | translate }}
                          </span>
                        } @else {
                          <span class="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">•</span>
                            {{ 'COMPARE.UNAVAILABLE' | translate }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row 13: Garden -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">🏡 {{ 'COMPARE.GARDEN' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex items-center">
                        @if (p.amenity?.hasGarden) {
                          <span class="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            {{ 'COMPARE.AVAILABLE' | translate }}
                          </span>
                        } @else {
                          <span class="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">•</span>
                            {{ 'COMPARE.UNAVAILABLE' | translate }}
                          </span>
                        }
                      </div>
                    }
                  </div>

                  <!-- Row 14: Central AC -->
                  <div class="contents">
                    <div class="py-4 text-xs font-black text-slate-500 flex items-center gap-1.5">❄️ {{ 'COMPARE.AC' | translate }}</div>
                    @for (p of comparedPropertiesDetails(); track p.id) {
                      <div class="py-4 flex items-center">
                        @if (p.amenity?.hasCentralAC) {
                          <span class="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                            {{ 'COMPARE.AVAILABLE' | translate }}
                          </span>
                        } @else {
                          <span class="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                            <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">•</span>
                            {{ 'COMPARE.UNAVAILABLE' | translate }}
                          </span>
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

    <!-- Lightbox Popup for full-screen image view -->
    @if (activeLightboxImage()) {
      <div class="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" (click)="activeLightboxImage.set(null)">
        <!-- Backdrop Close Button -->
        <button (click)="activeLightboxImage.set(null)" class="absolute top-6 right-6 z-[410] w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center cursor-pointer transition-all border border-white/20 shadow-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        
        <!-- Image Container -->
        <div class="relative max-w-4xl max-h-[85vh] bg-transparent overflow-hidden p-2 animate-zoom-in" (click)="$event.stopPropagation()">
          <img [src]="activeLightboxImage()" class="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10">
        </div>
      </div>
    }
  `,
})
export class PropertyCompareComponent {
  selectedProperties = input.required<PropertyListItem[]>();
  compareChange = output<PropertyListItem[]>();

  showCompareModal = signal(false);
  loadingCompareDetails = signal(false);
  comparedPropertiesDetails = signal<Property[]>([]);
  comparedImageIndices = signal<Record<string, number>>({});
  activeLightboxImage = signal<string | null>(null);

  // Drag & drop state
  dragIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  private toast = inject(ToastService);
  private propertyService = inject(PropertyService);
  private translate = inject(TranslateService);

  toggleCompare(item: PropertyListItem) {
    const updated = this.selectedProperties().filter(i => i.id !== item.id);
    this.compareChange.emit(updated);
    if (updated.length < 2) {
      this.showCompareModal.set(false);
    }
  }

  clearAllCompare() {
    this.compareChange.emit([]);
    this.showCompareModal.set(false);
  }

  async openCompareModal() {
    if (this.selectedProperties().length < 2) {
      this.toast.info(this.translate.instant('COMPARE.TOAST_MIN'));
      return;
    }
    this.showCompareModal.set(true);
    this.loadingCompareDetails.set(true);
    this.comparedPropertiesDetails.set([]);
    this.comparedImageIndices.set({});
    try {
      const fetchPromises = this.selectedProperties().map(p => this.propertyService.getById(p.id));
      const details = await Promise.all(fetchPromises);
      this.comparedPropertiesDetails.set(details);
    } catch (err: any) {
      const extracted = extractApiError(err, this.translate);
      if (extracted) { this.toast.error(extracted); this.showCompareModal.set(false); return; }
      this.toast.error(this.translate.instant('COMPARE.TOAST_ERROR'));
      this.showCompareModal.set(false);
    } finally {
      this.loadingCompareDetails.set(false);
    }
  }

  removeComparedProperty(id: string) {
    const updated = this.selectedProperties().filter(i => i.id !== id);
    this.compareChange.emit(updated);
    this.comparedPropertiesDetails.update(current => current.filter(i => i.id !== id));
    if (updated.length < 2) {
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

  getCompareImageIndex(propertyId: string): number {
    return this.comparedImageIndices()[propertyId] || 0;
  }

  getCompareImage(p: Property): string {
    if (p.images && p.images.length > 0) {
      const idx = this.getCompareImageIndex(p.id);
      const validIdx = idx >= 0 && idx < p.images.length ? idx : 0;
      return p.images[validIdx].url;
    }
    return buildPropertyPlaceholder(p.title);
  }

  prevCompareImage(p: Property, event: Event) {
    event.stopPropagation();
    if (!p.images || p.images.length <= 1) return;
    const current = this.getCompareImageIndex(p.id);
    const next = current === 0 ? p.images.length - 1 : current - 1;
    this.comparedImageIndices.update(state => ({
      ...state,
      [p.id]: next
    }));
  }

  nextCompareImage(p: Property, event: Event) {
    event.stopPropagation();
    if (!p.images || p.images.length <= 1) return;
    const current = this.getCompareImageIndex(p.id);
    const next = current === p.images.length - 1 ? 0 : current + 1;
    this.comparedImageIndices.update(state => ({
      ...state,
      [p.id]: next
    }));
  }

  getDistrictLabel(key: string | undefined): string {
    if (!key) return '';
    return this.translate.instant('DISTRICTS.' + key);
  }

  getCityLabel(key: string | undefined): string {
    if (!key) return '';
    return this.translate.instant('CITIES.' + key);
  }

  propertyFallback(title?: string): string {
    return buildPropertyPlaceholder(title);
  }

  isWinner(propertyId: string, metric: 'price' | 'area' | 'bedrooms' | 'bathrooms' | 'pricePerSqm'): boolean {
    const props = this.comparedPropertiesDetails();
    if (props.length < 2) return false;

    const targetProp = props.find(p => p.id === propertyId);
    if (!targetProp) return false;

    if (metric === 'price') {
      const minPrice = Math.min(...props.map(p => p.price));
      return targetProp.price === minPrice;
    }
    if (metric === 'area') {
      const maxArea = Math.max(...props.map(p => p.area));
      return targetProp.area === maxArea;
    }
    if (metric === 'bedrooms') {
      const maxBeds = Math.max(...props.map(p => p.bedrooms));
      return targetProp.bedrooms === maxBeds;
    }
    if (metric === 'bathrooms') {
      const maxBaths = Math.max(...props.map(p => p.bathrooms));
      return targetProp.bathrooms === maxBaths;
    }
    if (metric === 'pricePerSqm') {
      const minPricePerSqm = Math.min(...props.map(p => p.price / p.area));
      return (targetProp.price / targetProp.area) === minPricePerSqm;
    }
    return false;
  }

  getAmenitiesScore(p: Property): number {
    let score = 0;
    if (p.amenity) {
      if (p.amenity.hasParking) score++;
      if (p.amenity.hasPool) score++;
      if (p.amenity.hasGym) score++;
      if (p.amenity.hasElevator) score++;
      if (p.amenity.hasBalcony) score++;
      if (p.amenity.hasGarden) score++;
      if (p.amenity.hasCentralAC) score++;
    }
    return score;
  }

  generateLocalAiSummary(): string {
    const props = this.comparedPropertiesDetails();
    if (props.length < 2) return '';

    const isAr = this.translate.currentLang === 'ar';

    const realisticProps = props.filter(p => p.price > 1000);
    const hasRealisticPrices = realisticProps.length >= 1;

    let lowestPriceProp = props[0];
    let largestAreaProp = props[0];
    let bestPricePerSqmProp = props[0];
    let bestSqmValue = props[0].price / props[0].area;
    let mostAmenitiesProp = props[0];
    let maxAmenitiesCount = 0;

    const getAmenitiesCount = (p: Property) => {
      let count = 0;
      if (p.amenity) {
        if (p.amenity.hasParking) count++;
        if (p.amenity.hasPool) count++;
        if (p.amenity.hasGym) count++;
        if (p.amenity.hasElevator) count++;
        if (p.amenity.hasBalcony) count++;
        if (p.amenity.hasGarden) count++;
        if (p.amenity.hasCentralAC) count++;
      }
      return count;
    };

    props.forEach(p => {
      if (p.price < lowestPriceProp.price) {
        lowestPriceProp = p;
      }
      if (p.area > largestAreaProp.area) {
        largestAreaProp = p;
      }
      const sqmPrice = p.price / p.area;
      if (sqmPrice < bestSqmValue) {
        bestSqmValue = sqmPrice;
        bestPricePerSqmProp = p;
      }
      const amCount = getAmenitiesCount(p);
      if (amCount > maxAmenitiesCount) {
        maxAmenitiesCount = amCount;
        mostAmenitiesProp = p;
      }
    });

    const priceAnalysisProp = hasRealisticPrices 
      ? realisticProps.reduce((prev, curr) => (curr.price / curr.area) < (prev.price / prev.area) ? curr : prev, realisticProps[0]) 
      : bestPricePerSqmProp;
    const lowestTotalCostProp = hasRealisticPrices 
      ? realisticProps.reduce((prev, curr) => curr.price < prev.price ? curr : prev, realisticProps[0]) 
      : lowestPriceProp;

    if (isAr) {
      let summary = `🧬 **التحليل الذكي لبيتولوجي للمقارنة:**\n\n`;

      if (hasRealisticPrices) {
        summary += `💰 **القيمة والجدوى المالية:**\n`;
        summary += `• يعد عقار **"${priceAnalysisProp.title}"** هو الأفضل من حيث القيمة الاستثمارية (سعر المتر)، حيث يبلغ سعر المتر المربع فيه **${Math.round(priceAnalysisProp.price / priceAnalysisProp.area).toLocaleString()} ج.م**.\n`;
        if (lowestTotalCostProp.id !== priceAnalysisProp.id) {
          summary += `• بينما يقدم عقار **"${lowestTotalCostProp.title}"** أقل ميزانية إجمالية بسعر **${lowestTotalCostProp.price.toLocaleString()} ج.م**.\n`;
        }
        summary += `\n`;
      } else {
        summary += `💰 **ملاحظة حول الأسعار:** تظهر بعض الأسعار كقيم تجريبية، لذا يركز التحليل التالي على المساحة والمواصفات:\n\n`;
      }

      summary += `📐 **المساحة والاتساع الداخلي:**\n`;
      summary += `• يوفر عقار **"${largestAreaProp.title}"** أكبر مساحة معيشية تبلغ **${largestAreaProp.area.toLocaleString()} م²** ويضم **${largestAreaProp.bedrooms} غرف نوم** و **${largestAreaProp.bathrooms} حمامات**، وهو ما يجعله الخيار الأول للسكن العائلي الواسع.\n\n`;

      summary += `✨ **المرافق وأسلوب الحياة:**\n`;
      const viewLabels: Record<string, string> = { 'Street': 'شارع رئيسي', 'Garden': 'حديقة', 'Pool': 'مسبح', 'Sea': 'بحر/مياه', 'Nile': 'نيل', 'Back': 'خلفي', 'MainRoad': 'طريق رئيسي' };
      const furnishLabels: Record<string, string> = { 'Furnished': 'جاهز ومفروش بالكامل', 'FullyFurnished': 'جاهز ومفروش بالكامل', 'SemiFurnished': 'نصف مفروش', 'Unfurnished': 'غير مفروش' };

      const viewsText = props.map(p => {
        const view = p.amenity?.viewType ? (viewLabels[p.amenity.viewType] || p.amenity.viewType) : null;
        const furnish = p.amenity?.furnishingStatus ? (furnishLabels[p.amenity.furnishingStatus] || p.amenity.furnishingStatus) : null;
        if (view || furnish) {
          return `• عقار **"${p.title}"** ${furnish ? furnish : ''} ${view ? 'ويتمتع بإطلالة على ' + view : ''}.`;
        }
        return null;
      }).filter(Boolean);

      if (viewsText.length > 0) {
        summary += viewsText.join('\n') + `\n\n`;
      }

      const mostAmenitiesCount = getAmenitiesCount(mostAmenitiesProp);
      if (mostAmenitiesCount > 0) {
        summary += `• يعد عقار **"${mostAmenitiesProp.title}"** هو الأكثر تكاملاً من حيث المرافق الإضافية المتاحة (يضم **${mostAmenitiesCount} من أصل 7** خدمات مدمجة تشمل مواقف السيارات، حمام السباحة، أو التكييف المركزي).\n\n`;
      }

      summary += `💡 **التوصية النهائية لبيتولوجي:**\n`;
      if (hasRealisticPrices) {
        summary += `إذا كان هدفك الأساسي هو الاستثمار الذكي والحصول على أفضل سعر للمتر، فننصحك بعقار **"${priceAnalysisProp.title}"**. أما إذا كانت أولويتك هي المساحة الكبيرة والراحة العائلية الفائقة، فإن عقار **"${largestAreaProp.title}"** هو الخيار المثالي لك.`;
      } else {
        summary += `ننصح باختيار عقار **"${largestAreaProp.title}"** للمساحة الأكبر وسكن العائلات، أو **"${mostAmenitiesProp.title}"** إذا كانت الرفاهية والخدمات المتاحة هي أولويتك.`;
      }

      return summary;
    } else {
      let summary = `🧬 **Baytology Smart Comparison Analysis:**\n\n`;

      if (hasRealisticPrices) {
        summary += `💰 **Financial & Investment Value:**\n`;
        summary += `• **"${priceAnalysisProp.title}"** offers the best investment efficiency (lowest price per sqm) at **EGP ${Math.round(priceAnalysisProp.price / priceAnalysisProp.area).toLocaleString()}/sqm**.\n`;
        if (lowestTotalCostProp.id !== priceAnalysisProp.id) {
          summary += `• **"${lowestTotalCostProp.title}"** offers the lowest entry budget at **EGP ${lowestTotalCostProp.price.toLocaleString()}**.\n`;
        }
        summary += `\n`;
      }

      summary += `📐 **Space & Interior Layout:**\n`;
      summary += `• **"${largestAreaProp.title}"** provides the largest living space of **${largestAreaProp.area.toLocaleString()} sqm** featuring **${largestAreaProp.bedrooms} bedrooms** and **${largestAreaProp.bathrooms} bathrooms**, ideal for large families.\n\n`;

      summary += `✨ **Amenities & Lifestyle:**\n`;
      const viewsText = props.map(p => {
        const view = p.amenity?.viewType || null;
        const furnish = p.amenity?.furnishingStatus || null;
        if (view || furnish) {
          return `• **"${p.title}"** is ${furnish ? furnish.toLowerCase() : ''} ${view ? 'with a view facing the ' + view.toLowerCase() : ''}.`;
        }
        return null;
      }).filter(Boolean);

      if (viewsText.length > 0) {
        summary += viewsText.join('\n') + `\n\n`;
      }

      const mostAmenitiesCount = getAmenitiesCount(mostAmenitiesProp);
      if (mostAmenitiesCount > 0) {
        summary += `• **"${mostAmenitiesProp.title}"** has the highest amenities match rate (**${mostAmenitiesCount} out of 7** available features).\n\n`;
      }

      summary += `💡 **Baytology Recommendation:**\n`;
      if (hasRealisticPrices) {
        summary += `Choose **"${priceAnalysisProp.title}"** for optimal financial value per sqm. Select **"${largestAreaProp.title}"** if family comfort and spacious layout are your main criteria.`;
      } else {
        summary += `We recommend **"${largestAreaProp.title}"** for the best living space, or **"${mostAmenitiesProp.title}"** if having more amenities is your key requirement.`;
      }

      return summary;
    }
  }

  // ---- Drag & Drop ----
  onDragStart(index: number) {
    this.dragIndex.set(index);
  }

  onDragOver(index: number) {
    this.dragOverIndex.set(index);
  }

  onDrop() {
    const from = this.dragIndex();
    const to = this.dragOverIndex();
    if (from === null || to === null || from === to) {
      this.dragIndex.set(null);
      this.dragOverIndex.set(null);
      return;
    }
    const items = [...this.selectedProperties()];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    this.compareChange.emit(items);
    this.dragIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onDragEnd() {
    this.dragIndex.set(null);
    this.dragOverIndex.set(null);
  }

  // ---- Share ----
  shareComparison() {
    const ids = this.selectedProperties().map(p => p.id).join(',');
    const url = `${window.location.origin}/properties?compare=${ids}`;
    navigator.clipboard.writeText(url).then(() => {
      this.toast.success(this.translate.instant('COMPARE.SHARE_COPIED'));
    }).catch(() => {
      // Fallback: create a temporary input
      const el = document.createElement('input');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.toast.success(this.translate.instant('COMPARE.SHARE_COPIED'));
    });
  }

  // ---- Score Calculation ----
  getValueScore(p: Property): number {
    const props = this.comparedPropertiesDetails();
    if (props.length < 2) return 50;
    const maxPrice = Math.max(...props.map(x => x.price));
    const minPrice = Math.min(...props.map(x => x.price));
    const range = maxPrice - minPrice || 1;
    return Math.round(((maxPrice - p.price) / range) * 100);
  }

  getSpaceScore(p: Property): number {
    const props = this.comparedPropertiesDetails();
    if (props.length < 2) return 50;
    const maxArea = Math.max(...props.map(x => x.area));
    const minArea = Math.min(...props.map(x => x.area));
    const areaRange = maxArea - minArea || 1;
    const areaScore = ((p.area - minArea) / areaRange) * 70;
    const maxBeds = Math.max(...props.map(x => x.bedrooms));
    const minBeds = Math.min(...props.map(x => x.bedrooms));
    const bedsRange = maxBeds - minBeds || 1;
    const bedsScore = ((p.bedrooms - minBeds) / bedsRange) * 30;
    return Math.round(areaScore + bedsScore);
  }

  getAmenitiesPercent(p: Property): number {
    return Math.round((this.getAmenitiesScore(p) / 7) * 100);
  }

  getOverallScore(p: Property): number {
    let score = 0;
    const props = this.comparedPropertiesDetails();
    if (props.length < 2) return 50;

    // Price score (lower is better): 0-40 points
    const maxPrice = Math.max(...props.map(x => x.price));
    const minPrice = Math.min(...props.map(x => x.price));
    const priceRange = maxPrice - minPrice || 1;
    const priceScore = ((maxPrice - p.price) / priceRange) * 40;
    score += priceScore;

    // Area score (higher is better): 0-25 points
    const maxArea = Math.max(...props.map(x => x.area));
    const minArea = Math.min(...props.map(x => x.area));
    const areaRange = maxArea - minArea || 1;
    const areaScore = ((p.area - minArea) / areaRange) * 25;
    score += areaScore;

    // Amenities score: 0-20 points
    const amenityScore = (this.getAmenitiesScore(p) / 7) * 20;
    score += amenityScore;

    // Bedrooms score: 0-15 points
    const maxBeds = Math.max(...props.map(x => x.bedrooms));
    const minBeds = Math.min(...props.map(x => x.bedrooms));
    const bedsRange = maxBeds - minBeds || 1;
    const bedsScore = ((p.bedrooms - minBeds) / bedsRange) * 15;
    score += bedsScore;

    return Math.round(score);
  }

  getScoreColor(score: number): string {
    if (score >= 75) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-slate-500';
  }

  getScoreBarColor(score: number): string {
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-slate-400';
  }

  getMaxValue(metric: 'price' | 'area' | 'bedrooms'): number {
    const props = this.comparedPropertiesDetails();
    if (props.length < 2) return 1;
    if (metric === 'price') return Math.max(...props.map(p => p.price));
    if (metric === 'area') return Math.max(...props.map(p => p.area));
    if (metric === 'bedrooms') return Math.max(...props.map(p => p.bedrooms));
    return 1;
  }

  // ---- +/- Difference ----
  getDiff(propertyId: string, metric: 'price' | 'area' | 'bedrooms'): { value: number; isHigher: boolean } | null {
    const props = this.comparedPropertiesDetails();
    if (props.length < 2) return null;

    const target = props.find(p => p.id === propertyId);
    if (!target) return null;

    if (metric === 'price') {
      const best = Math.min(...props.map(p => p.price));
      const diff = target.price - best;
      return { value: Math.abs(diff), isHigher: diff > 0 };
    }
    if (metric === 'area') {
      const best = Math.max(...props.map(p => p.area));
      const diff = best - target.area;
      return { value: Math.abs(diff), isHigher: diff > 0 };
    }
    if (metric === 'bedrooms') {
      const best = Math.max(...props.map(p => p.bedrooms));
      const diff = best - target.bedrooms;
      return { value: Math.abs(diff), isHigher: diff > 0 };
    }
    return null;
  }
}
