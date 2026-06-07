import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PropertyListItem } from '../../../core/models';
import { CurrencyEgpPipe } from '../../pipes/currency-egp.pipe';
import { buildPropertyPlaceholder, getPropertyImageUrl } from '../../../core/utils/media';
import { LocalImageService } from '../../../core/services/local-image.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink, CurrencyEgpPipe, TranslateModule],
  template: `
    <a [routerLink]="['/properties', property().id]" class="block overflow-hidden group bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(10,143,150,0.08)] hover:border-[#0a8f96]/20 transition-all duration-500 hover:-translate-y-2 relative">
      <!-- Image Section -->
      <div class="relative h-56 overflow-hidden bg-slate-50">
        <img [src]="getImageUrl()" [alt]="property().title"
          class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
          (error)="onImageError($event)">
        <!-- Gradient Overlay on hover -->
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <!-- Badges & Action Buttons -->
        <!-- Listing Type Badge ("SALE") on the Right (RTL) / Left (LTR) -->
        <div class="absolute top-4.5 ltr:left-4.5 rtl:right-4.5 flex gap-2">
          <span class="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#0a8f96] text-white shadow-md shadow-[#0a8f96]/20">{{ 'PROPERTY.LISTING_TYPES.' + property().listingType | translate }}</span>
          @if (property().isFeatured) {
            <span class="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20">⭐ {{ 'PROPERTY.FEATURED' | translate }}</span>
          }
        </div>
        
        <!-- Save Button on the Left (RTL) / Right (LTR) -->
        @if (showSave()) {
          <button (click)="onSave($event)" class="absolute top-4.5 ltr:right-4.5 rtl:left-4.5 w-9.5 h-9.5 rounded-xl bg-white/70 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all border border-slate-200/30 shadow-md group/heart cursor-pointer">
            <svg class="w-5 h-5 transition-all duration-300" 
                 [class.fill-red-500]="saved()" 
                 [class.text-red-500]="saved()" 
                 [class.text-slate-600]="!saved()" 
                 [class.group-hover/heart:scale-110]="true"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        }
        
        <!-- Status Badge ("Available") on the bottom-left always -->
        <div class="absolute bottom-4.5 left-4.5">
          <span class="px-3 py-1.5 bg-white/90 backdrop-blur-md border border-slate-200/10 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm">
            {{ 'PROPERTY.STATUSES.' + property().status | translate }}
          </span>
        </div>
      </div>

      <!-- Content Section -->
      <div class="p-5.5 space-y-4">
        <!-- Title & Price (RTL: Title on right, Price on left) -->
        <div class="flex items-center justify-between gap-4">
          <h3 class="font-extrabold text-slate-800 truncate group-hover:text-[#0a8f96] transition-colors text-[15px] flex-1 text-start">
            {{ property().title }}
          </h3>
          <p class="text-[#0a8f96] font-black text-lg tracking-tight shrink-0">
            {{ property().price | currencyEgp }}
          </p>
        </div>

        <!-- Divider & Stats/Location Row -->
        <div class="flex items-center justify-between gap-4 pt-4 border-t border-slate-100/70 text-xs font-bold text-slate-400">
          <!-- Stats: Beds, Baths, Area on the Right (RTL) / Left (LTR) -->
          <div class="flex items-center gap-3.5 text-slate-500 font-extrabold">
            <span class="flex items-center gap-1.5">
              <span>{{ property().bedrooms }}</span>
              <span class="text-base">🛏️</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span>{{ property().bathrooms }}</span>
              <span class="text-base">🚿</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span>{{ property().area }} {{ 'PROPERTY.AREA_UNIT' | translate }}</span>
              <span class="text-base">📐</span>
            </span>
          </div>

          <!-- Location with Map Pin on the Left (RTL) / Right (LTR) -->
          @if (property().city || property().district) {
            <span class="flex items-center gap-1.5 text-slate-400 font-bold shrink-0">
              <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ property().district ? ('DISTRICTS.' + property().district | translate) + ('COMMON.LOCATION_SEPARATOR' | translate) : '' }}{{ 'CITIES.' + property().city | translate }}
            </span>
          }
        </div>
      </div>
    </a>
  `,
})
export class PropertyCardComponent {
  property = input.required<PropertyListItem>();
  showSave = input(false);
  saved = input(false);
  saveToggle = output<string>();
  
  private localImageService = inject(LocalImageService);

  getImageUrl(): string {
    if (this.property().primaryImageUrl) {
      return getPropertyImageUrl(this.property().primaryImageUrl, this.property().title);
    }
    const thumb = this.localImageService.getThumbnail(this.property().id);
    if (thumb) return thumb;
    return buildPropertyPlaceholder(this.property().title);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = buildPropertyPlaceholder(this.property().title);
  }

  onSave(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.saveToggle.emit(this.property().id);
  }
}
