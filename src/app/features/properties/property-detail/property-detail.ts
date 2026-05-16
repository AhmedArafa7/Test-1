import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AuthService } from '../../../core/auth/auth.service';
import { Property, PropertyListItem } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { FormsModule } from '@angular/forms';
import { ConversationService } from '../../conversations/services/conversation.service';
import { PropertyService } from '../services/property.service';
import { LocalImageService } from '../../../core/services/local-image.service';
import { AiService } from '../../ai/services/ai.service';
import { CurrencyEgpPipe } from '../../../shared/pipes/currency-egp.pipe';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader';
import { buildPropertyPlaceholder, getPropertyImageUrl } from '../../../core/utils/media';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [RouterLink, SkeletonLoaderComponent, DecimalPipe, FormsModule, CurrencyEgpPipe, TranslateModule],
  template: `
    @if (loading()) {
      <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] pt-20 px-6">
        <div class="max-w-[1300px] mx-auto">
          <app-skeleton-loader type="text" containerClass="h-10 w-1/3 mb-10" />
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div class="lg:col-span-8 space-y-8">
              <app-skeleton-loader type="card" containerClass="h-[500px]" />
              <div class="grid grid-cols-4 gap-6">
                <app-skeleton-loader type="card" containerClass="h-24" />
                <app-skeleton-loader type="card" containerClass="h-24" />
                <app-skeleton-loader type="card" containerClass="h-24" />
                <app-skeleton-loader type="card" containerClass="h-24" />
              </div>
            </div>
            <div class="lg:col-span-4">
              <app-skeleton-loader type="card" containerClass="h-[400px]" />
            </div>
          </div>
        </div>
      </div>
    } @else if (property(); as p) {
      <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans pb-32 pt-10 text-gray-800">
        <div class="max-w-[1300px] mx-auto px-6">
          
          <!-- Navigation Breadcrumb Area -->
          <div class="flex items-center gap-2 mb-8 text-xs font-bold text-gray-400">
            <a routerLink="/" class="hover:text-[#0a8f96] transition-colors">{{ 'COMMON.HOME' | translate }}</a>
            <svg class="w-3 h-3 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            <a routerLink="/properties" class="hover:text-[#0a8f96] transition-colors">{{ 'PROPERTY_LIST.TITLE' | translate }}</a>
            <svg class="w-3 h-3 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            <span class="text-gray-900">{{ p.title }}</span>
          </div>

          <!-- Top Header Section -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <div class="flex flex-wrap items-center gap-3 mb-4">
                <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{{ p.title }}</h1>
                <span class="bg-[#0a8f96] text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shadow-[#0a8f96]/20">
                  {{ 'PROPERTY.LISTING_TYPES.' + p.listingType | translate }}
                </span>
                <span class="bg-white text-gray-400 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-gray-100 shadow-sm">
                  {{ 'PROPERTY.TYPES.' + p.propertyType | translate }}
                </span>
              </div>
              <p class="text-sm md:text-base text-gray-500 flex items-center gap-2 font-medium">
                <svg class="w-5 h-5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {{ p.addressLine }} {{ p.district ? ', ' + ('DISTRICTS.' + getDistrictKeyFromValue(p.district) | translate) : '' }} {{ p.city ? ', ' + ('CITIES.' + getCityKeyFromValue(p.city) | translate) : '' }}
              </p>
            </div>
            
            <div class="flex items-center gap-3">
              <button (click)="shareProperty()" class="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#0a8f96] hover:bg-gray-50 transition-all shadow-sm active:scale-90">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              </button>
              @if (auth.isBuyer()) {
                <button (click)="toggleSaveProperty()" class="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all shadow-sm active:scale-90">
                  <svg class="w-6 h-6 transition-colors" [class.fill-red-500]="isSaved()" [class.text-red-500]="isSaved()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </button>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <!-- Main Content (RTL) -->
            <div class="lg:col-span-8 space-y-10">
              
              <!-- Premium Gallery -->
              <div class="bg-white rounded-[32px] p-3 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                <div class="relative h-[500px] rounded-[32px] overflow-hidden mb-3 bg-gray-50">
                  <img [src]="getAllImages()[selectedImageIndex()]" 
                       (error)="onImageError($event, selectedImageIndex())"
                       class="w-full h-full object-cover transition-opacity duration-300">
                  <div class="absolute bottom-6 left-6 bg-gray-900/40 backdrop-blur-xl text-white text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl border border-white/10">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    {{ 'COMMON.VIEW_ALL' | translate }} ({{ getAllImages().length }})
                  </div>
                </div>
                
                @if (getAllImages().length > 1) {
                  <div class="grid grid-cols-4 gap-3 h-[120px]">
                    @for (img of getAllImages().slice(0, 4); track img; let i = $index) {
                      <div (click)="selectedImageIndex.set(i)" 
                           class="rounded-2xl overflow-hidden shadow-sm transition-all cursor-pointer"
                           [class.ring-4]="selectedImageIndex() === i"
                           [class.ring-[#0a8f96]]="selectedImageIndex() === i"
                           [class.opacity-70]="selectedImageIndex() !== i"
                           [class.hover:opacity-100]="selectedImageIndex() !== i"
                           [class.hover:ring-2]="selectedImageIndex() !== i"
                           [class.hover:ring-[#0a8f96]/50]="selectedImageIndex() !== i">
                        <img [src]="img" (error)="onImageError($event, i)" class="w-full h-full object-cover">
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Specs Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0a8f96] mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                  </div>
                  <span class="text-2xl font-black text-gray-900">{{ p.bedrooms }}</span>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{{ 'PROPERTY_DETAIL.BEDROOMS' | translate }}</span>
                </div>
                <div class="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0a8f96] mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
                  </div>
                  <span class="text-2xl font-black text-gray-900">{{ p.bathrooms }}</span>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{{ 'PROPERTY_DETAIL.BATHROOMS' | translate }}</span>
                </div>
                <div class="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0a8f96] mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                  </div>
                  <span class="text-2xl font-black text-gray-900">{{ p.area | number:'1.0-0' }}</span>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{{ 'PROPERTY.AREA_UNIT' | translate }} {{ 'PROPERTY_DETAIL.AREA' | translate }}</span>
                </div>
                <div class="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0a8f96] mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <span class="text-2xl font-black text-gray-900">{{ p.floor }}{{ p.totalFloors ? ' / ' + p.totalFloors : '' }}</span>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{{ 'PROPERTY_DETAIL.FLOOR' | translate }}</span>
                </div>
              </div>

              <!-- Amenities -->
              @if (p.amenity) {
                <div class="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 class="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    <div class="w-2 h-8 bg-[#0a8f96] rounded-full"></div>
                    {{ 'PROPERTY_DETAIL.AMENITIES_TITLE' | translate }}
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    @if (p.amenity.hasParking) { <div class="flex items-center gap-3 text-sm font-bold text-gray-600"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a8f96]">🅿️</div> {{ 'PROPERTY.AMENITIES.Parking' | translate }}</div> }
                    @if (p.amenity.hasPool) { <div class="flex items-center gap-3 text-sm font-bold text-gray-600"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a8f96]">🏊</div> {{ 'PROPERTY.AMENITIES.Pool' | translate }}</div> }
                    @if (p.amenity.hasGym) { <div class="flex items-center gap-3 text-sm font-bold text-gray-600"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a8f96]">💪</div> {{ 'PROPERTY.AMENITIES.Gym' | translate }}</div> }
                    @if (p.amenity.hasElevator) { <div class="flex items-center gap-3 text-sm font-bold text-gray-600"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a8f96]">🛗</div> {{ 'PROPERTY.AMENITIES.Elevator' | translate }}</div> }
                    @if (p.amenity.hasSecurity) { <div class="flex items-center gap-3 text-sm font-bold text-gray-600"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a8f96]">🛡️</div> {{ 'PROPERTY.AMENITIES.Security' | translate }}</div> }
                    @if (p.amenity.hasBalcony) { <div class="flex items-center gap-3 text-sm font-bold text-gray-600"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a8f96]">🌇</div> {{ 'PROPERTY.AMENITIES.Balcony' | translate }}</div> }
                    @if (p.amenity.hasGarden) { <div class="flex items-center gap-3 text-sm font-bold text-gray-600"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a8f96]">🌳</div> {{ 'PROPERTY.AMENITIES.Garden' | translate }}</div> }
                    @if (p.amenity.hasCentralAC) { <div class="flex items-center gap-3 text-sm font-bold text-gray-600"><div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#0a8f96]">❄️</div> {{ 'PROPERTY.AMENITIES.CentralAC' | translate }}</div> }
                  </div>
                  
                  <div class="mt-8 pt-8 border-t border-gray-50 flex flex-wrap gap-4">
                    <span class="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-gray-500 border border-gray-100">{{ 'PROPERTY_FORM.FURNISHING' | translate }}: {{ 'PROPERTY.FURNISHING.' + p.amenity.furnishingStatus | translate }}</span>
                    @if (p.amenity.viewType) {
                      <span class="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-[#0a8f96] border border-[#0a8f96]/10">{{ 'PROPERTY.AMENITIES.VIEW' | translate }}: {{ p.amenity.viewType }}</span>
                    }
                  </div>
                </div>
              }

              <!-- Description -->
              <div class="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                <h3 class="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                  <div class="w-2 h-8 bg-[#0a8f96] rounded-full"></div>
                  {{ 'PROPERTY_DETAIL.DESCRIPTION' | translate }}
                </h3>
                <div class="text-base text-gray-600 leading-[1.8] space-y-6 font-medium">
                  <p>{{ p.description }}</p>
                </div>
              </div>

              <!-- Map Section -->
              @if (p.latitude && p.longitude) {
                <div class="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <h3 class="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    <div class="w-2 h-8 bg-[#0a8f96] rounded-full"></div>
                    {{ 'PROPERTY_DETAIL.MAP_LOCATION' | translate }}
                  </h3>
                  <div class="rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-[350px]">
                    <iframe
                      [src]="getDetailMapUrl(p.latitude, p.longitude)"
                      class="w-full h-full border-0"
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                      allowfullscreen>
                    </iframe>
                  </div>
                  <div class="flex items-center justify-between mt-6 px-2">
                    <a [href]="'https://www.google.com/maps?q=' + p.latitude + ',' + p.longitude" target="_blank" rel="noopener"
                       class="flex items-center gap-2 text-xs font-black text-[#0a8f96] hover:text-[#076b70] transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      {{ 'PROPERTY_DETAIL.OPEN_IN_MAPS' | translate }}
                    </a>
                    <span class="text-[10px] text-gray-400 font-bold">
                      {{ p.latitude.toFixed(5) }}, {{ p.longitude.toFixed(5) }}
                    </span>
                  </div>
                </div>
              }

              @if (loadingSimilar()) {
                <div class="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <div class="flex items-center gap-3 mb-8">
                    <div class="w-2 h-8 bg-[#0a8f96] rounded-full"></div>
                    <div class="flex flex-col">
                      <h3 class="text-xl font-black text-gray-900 leading-none mb-1">{{ 'PROPERTY_DETAIL.ANALYZING_SIMILAR' | translate }}</h3>
                      <span class="text-[9px] font-black text-[#0a8f96] uppercase tracking-[0.3em]">{{ 'RECOMMENDATIONS.TITLE' | translate }}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <app-skeleton-loader type="card" containerClass="h-60" />
                    <app-skeleton-loader type="card" containerClass="h-60" />
                  </div>
                </div>
              } @else if (similarProperties().length > 0) {
                <div class="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
                  <div class="flex items-center gap-3 mb-8">
                    <div class="w-2 h-8 bg-[#0a8f96] rounded-full"></div>
                    <div class="flex flex-col">
                      <h3 class="text-xl font-black text-gray-900 leading-none mb-1">{{ 'PROPERTY_DETAIL.SIMILAR_PROPERTIES' | translate }}</h3>
                      <span class="text-[9px] font-black text-[#0a8f96] uppercase tracking-[0.3em]">{{ 'RECOMMENDATIONS.TITLE' | translate }}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    @for (sp of similarProperties(); track sp.id) {
                      <a [routerLink]="['/properties', sp.id]" class="group block bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-lg transition-all">
                        <div class="flex items-center gap-4">
                          <img [src]="getPropertyImageUrl(sp.primaryImageUrl || '', sp.title)" class="w-20 h-20 rounded-2xl object-cover">
                          <div>
                            <h4 class="font-black text-gray-900 text-sm truncate max-w-[150px]">{{ sp.title }}</h4>
                            <p class="text-xs font-bold text-[#0a8f96] mt-1">{{ sp.price | currencyEgp }}</p>
                          </div>
                        </div>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Sidebar (RTL) -->
            <div class="lg:col-span-4 space-y-8">
              <!-- Price Card -->
              <div class="bg-gradient-to-br from-gray-900 via-gray-900 to-[#0a8f96]/20 rounded-[32px] p-10 text-white shadow-2xl shadow-gray-900/30 relative overflow-hidden">
                <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px;"></div>
                <div class="relative z-10">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{{ 'PROPERTY_DETAIL.EXCLUSIVE_PRICE' | translate }}</p>
                <div class="flex items-baseline gap-2 mb-10">
                  <h2 class="text-5xl font-black">{{ p.price | number:'1.0-0' }}</h2>
                  <span class="text-sm font-bold text-gray-400">{{ 'PROPERTY.CURRENCY' | translate }}</span>
                </div>
                
                <div class="space-y-4">
                   @if (canBookViewing(p) && !isOwner() && (auth.isBuyer())) {
                    <button (click)="contactAgent()" class="w-full bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-black py-5 rounded-[22px] shadow-xl shadow-[#0a8f96]/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                      {{ 'PROPERTY_DETAIL.CONTACT_AGENT' | translate }}
                    </button>
                    <button (click)="bookViewing()" class="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-black py-5 rounded-[22px] transition-all flex items-center justify-center gap-3 active:scale-95 border border-white/10">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"/></svg>
                      {{ 'PROPERTY_DETAIL.BOOK_VIEWING' | translate }}
                    </button>
                  } @else if (!isOwner() && (auth.isBuyer())) {
                    <div class="p-6 bg-white/5 border border-white/10 rounded-[22px] text-center">
                      <p class="text-sm font-bold text-gray-400">{{ 'PROPERTY_DETAIL.VIEWING_UNAVAILABLE' | translate }}</p>
                    </div>
                  }
                  @if (isOwner()) {
                    <div class="flex flex-col gap-3">
                      <a [routerLink]="['/properties', p.id, 'edit']" class="w-full bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-black py-5 rounded-[22px] shadow-xl shadow-[#0a8f96]/20 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        {{ 'PROPERTY_DETAIL.EDIT_BTN' | translate }}
                      </a>
                      <button (click)="deleteProperty()" class="w-full bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-black py-4 rounded-[18px] transition-all flex items-center justify-center gap-3 active:scale-95 border border-red-100">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        {{ 'PROPERTY_DETAIL.DELETE_BTN' | translate }}
                      </button>
                    </div>
                  }
                </div>
              </div>
                </div>

              <!-- Agent Card -->
              <div class="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm text-center">
                <a [routerLink]="['/agents', p.agentUserId]" class="block group">
                  <div class="w-24 h-24 rounded-full bg-white mx-auto mb-6 overflow-hidden ring-4 ring-gray-50 border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-105">
                    @if (p.agent?.avatarUrl && (p.agent?.avatarUrl?.length || 0) > 20) {
                      <img [src]="p.agent?.avatarUrl" (error)="p.agent!.avatarUrl = ''" class="w-full h-full object-contain">
                    } @else {
                      <svg class="w-12 h-12 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    }
                  </div>
                  <h4 class="text-xl font-black text-gray-900 mb-1 group-hover:text-[#0a8f96] transition-colors">{{ p.agent?.displayName }}</h4>
                </a>
                <p class="text-xs font-bold text-[#0a8f96] uppercase tracking-widest mb-6">{{ p.agent?.agencyName }}</p>
                <div class="pt-6 border-t border-gray-50 flex justify-center gap-8">
                  <div class="text-center">
                    <p class="text-xl font-black text-gray-900">{{ p.agent?.isVerified ? ('PROPERTY_DETAIL.VERIFIED' | translate) : ('ADMIN.USERS.STATUS.ACTIVE' | translate) }}</p>
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ 'ADMIN.USERS.TABLE.STATUS' | translate }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-xl font-black text-gray-900">{{ p.agent?.rating }}</p>
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ 'ADMIN.AGENTS.TABLE.RATING' | translate }}</p>
                  </div>
                </div>

                <!-- Review Form -->
                @if (auth.isAuthenticated() && !isOwner() && (auth.isBuyer())) {
                  <div class="mt-10 pt-10 border-t border-gray-50">
                    <h5 class="text-sm font-black text-gray-900 mb-6">{{ 'PROPERTY_DETAIL.RATE_AGENT' | translate }}</h5>
                    <div class="flex justify-center gap-2 mb-6">
                      @for (star of [1,2,3,4,5]; track star) {
                        <button (click)="reviewRating.set(star)" class="w-10 h-10 transition-all hover:scale-110">
                          <svg class="w-8 h-8" [class.text-yellow-400]="reviewRating() >= star" [class.fill-yellow-400]="reviewRating() >= star" [class.text-gray-200]="reviewRating() < star" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                        </button>
                      }
                    </div>
                    <textarea [(ngModel)]="reviewComment" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4 text-xs font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all min-h-[100px] resize-none mb-4" [placeholder]="'PROPERTY_DETAIL.REVIEW_PLACEHOLDER' | translate"></textarea>
                    <button (click)="submitReview()" [disabled]="submittingReview() || reviewRating() === 0" class="w-full bg-gray-900 text-white text-xs font-black py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50">
                      {{ submittingReview() ? ('PROPERTY_DETAIL.SUBMITTING' | translate) : ('PROPERTY_DETAIL.SUBMIT_REVIEW' | translate) }}
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class PropertyDetailComponent implements OnInit {
  property = signal<Property | null>(null);
  getPropertyImageUrl = getPropertyImageUrl;
  loading = signal(true);
  isSaved = signal(false);
  localImages = signal<string[]>([]);
  isOwner = signal(false);
  similarProperties = signal<PropertyListItem[]>([]);
  loadingSimilar = signal(false);

  reviewRating = signal(0);
  reviewComment = '';
  submittingReview = signal(false);

  selectedImageIndex = signal(0);
  private translate = inject(TranslateService);

  // Localization Mappings
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

  getAllImages(): string[] {
    const property = this.property();
    if (!property) return [];
    return (property.images || []).map(img => getPropertyImageUrl(img.url, property.title));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private conversationService: ConversationService,
    private aiService: AiService,
    public auth: AuthService,
    private toast: ToastService,
    private localImageService: LocalImageService,
    private sanitizer: DomSanitizer
  ) {}

  private destroyRef = inject(DestroyRef);
  private destroyed = false;

  async ngOnInit() {
    this.destroyRef.onDestroy(() => this.destroyed = true);
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadProperty(id);
        }
      });
  }

  private async loadProperty(id: string) {
    this.loading.set(true);
    this.property.set(null);
    this.similarProperties.set([]);
    this.loadingSimilar.set(false);
    this.selectedImageIndex.set(0);
    this.reviewRating.set(0);
    this.reviewComment = '';

    try {
      const property = await this.propertyService.getById(id);
      this.property.set(property);
      
      // Load local images if they exist
      // Local storage logic removed as per user request

      const ownsProperty = this.auth.userId() === property.agentUserId;
      this.isOwner.set(ownsProperty);
      if (this.auth.isBuyer() && !ownsProperty) {
        await this.loadSavedState(property.id);
      }
      this.propertyService.recordView(id).catch(() => {});
      
      // Load similar properties via AI recommendations
      if (this.auth.isAuthenticated()) {
        this.loadSimilarProperties(id);
      }
    } catch {
      this.toast.error(this.translate.instant('PROPERTY_LIST.MESSAGES.LOAD_ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  canBookViewing(property: Property): boolean {
    const status = property.status.toLowerCase();
    return status === 'available';
  }

  async loadSavedState(id: string) {
    try {
      this.isSaved.set(await this.propertyService.isSaved(id));
    } catch {
      this.isSaved.set(false);
    }
  }

  async toggleSaveProperty() {
    const property = this.property();
    if (!property) return;
    try {
      if (this.isSaved()) {
        await this.propertyService.unsave(property.id);
        this.isSaved.set(false);
        this.toast.success(this.translate.instant('PROPERTY_LIST.MESSAGES.FAV_REMOVED'));
      } else {
        await this.propertyService.save(property.id);
        this.isSaved.set(true);
        this.toast.success(this.translate.instant('PROPERTY_LIST.MESSAGES.FAV_ADDED'));
      }
    } catch {
      this.toast.error(this.translate.instant('PROPERTY_LIST.MESSAGES.LOAD_ERROR'));
    }
  }

  async contactAgent() {
    const property = this.property();
    if (!property) return;

    if (!this.auth.isAuthenticated()) {
      this.toast.info(this.translate.instant('PROPERTY_DETAIL.MESSAGES.LOGIN_REQUIRED'));
      setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      return;
    }

    try {
      const response = await this.conversationService.create(property.id);
      this.toast.success(this.translate.instant('PROPERTY_DETAIL.MESSAGES.CONVERSATION_STARTED'));
      this.router.navigate(['/conversations', response.conversationId], { queryParams: { propertyId: property.id } });
    } catch (error: any) {
      if (error?.status === 401) {
        this.toast.error('انتهت جلستك، يرجى تسجيل الدخول مرة أخرى');
        this.router.navigate(['/auth/login']);
      } else {
        this.toast.error('تعذر بدء المحادثة');
      }
    }
  }

  bookViewing() {
    const property = this.property();
    if (!property) return;

    if (!this.auth.isAuthenticated()) {
      this.toast.info('يجب تسجيل الدخول لتتمكن من حجز موعد معاينة');
      setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      return;
    }

    this.router.navigate(['/bookings/new'], { queryParams: { propertyId: property.id } });
  }

  async shareProperty() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.toast.success(this.translate.instant('PROPERTY_DETAIL.MESSAGES.LINK_COPIED'));
    } catch {
      this.toast.error(this.translate.instant('PROPERTY_DETAIL.MESSAGES.COPY_FAILED'));
    }
  }

  async deleteProperty() {
    const property = this.property();
    if (!property) return;
    
    if (confirm(this.translate.instant('PROPERTY_LIST.MESSAGES.DELETE_CONFIRM'))) {
      try {
        await this.propertyService.delete(property.id);
        this.toast.success(this.translate.instant('PROPERTY_LIST.MESSAGES.DELETE_SUCCESS'));
        this.router.navigate(['/properties']);
      } catch (error: any) {
        const message = error?.error?.detail || 'حدث خطأ أثناء حذف العقار';
        this.toast.error(message);
      }
    }
  }

  async submitReview() {
    const property = this.property();
    if (!property || !property.agentUserId) return;

    this.submittingReview.set(true);
    try {
      await this.propertyService.createReview({
        agentUserId: property.agentUserId,
        propertyId: property.id,
        rating: this.reviewRating(),
        comment: this.reviewComment
      });
      this.toast.success('شكرًا لتقييمك!');
      this.reviewRating.set(0);
      this.reviewComment = '';
    } catch (e: any) {
      console.error('Review submission failed:', e);
      let errorMessage = 'تعذر إرسال التقييم';
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

  private async loadSimilarProperties(propertyId: string) {
    this.loadingSimilar.set(true);
    try {
      const res = await this.aiService.createRecommendation({
        sourceEntityType: 'property',
        sourceEntityId: propertyId,
        topN: 4
      });

      // Poll until completed
      let attempts = 0;
      while (attempts < 15 && !this.destroyed) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (this.destroyed) break;
        const status = await this.aiService.getRecommendationStatus(res.requestId);
        if (status.status !== 'Pending') {
          if (status.results && status.results.length > 0) {
            // Fetch full property data for each recommended property
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
                  // Property might be deleted, use snapshot as fallback
                  if (r.snapshotTitle) {
                    properties.push({
                      id: r.recommendedPropertyId,
                      agentUserId: '',
                      title: r.snapshotTitle,
                      price: r.snapshotPrice || 0,
                      area: 0,
                      bedrooms: 0,
                      bathrooms: 0,
                      propertyType: '',
                      listingType: '',
                      status: 'unavailable',
                      isFeatured: false
                    });
                  }
                }
              }
            }
            this.similarProperties.set(properties);
          }
          break;
        }
        attempts++;
      }
    } catch {
      // Silently fail — recommendations are non-critical
    } finally {
      this.loadingSimilar.set(false);
    }
  }

  getPlaceholder(): string {
    return buildPropertyPlaceholder(this.property()?.title);
  }

  getSimilarImage(sp: PropertyListItem): string {
    return getPropertyImageUrl(sp.primaryImageUrl, sp.title);
  }

  onImageError(event: any, index: number) {
    const target = event.target as HTMLImageElement;
    // Use SVG placeholder
    target.src = buildPropertyPlaceholder(this.property()?.title);
  }

  getDetailMapUrl(lat: number, lng: number): SafeResourceUrl {
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008},${lat - 0.008},${lng + 0.008},${lat + 0.008}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
