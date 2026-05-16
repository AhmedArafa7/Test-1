import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PropertyListItem } from '../../../core/models';
import { CurrencyEgpPipe } from '../../pipes/currency-egp.pipe';
import { buildPropertyPlaceholder, getPropertyImageUrl } from '../../../core/utils/media';
import { LocalImageService } from '../../../core/services/local-image.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink, CurrencyEgpPipe],
  template: `
    <a [routerLink]="['/properties', property().id]" class="block overflow-hidden group bg-white rounded-[20px] border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(10,143,150,0.12)] transition-all duration-500 hover:-translate-y-2 relative">
      <!-- Teal Top Accent -->
      <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#076b70] via-[#0a8f96] to-[#12b5bd] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[20px]"></div>
      <!-- Image -->
      <div class="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <img [src]="getImageUrl()" [alt]="property().title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          (error)="onImageError($event)">
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <!-- Badges -->
        <div class="absolute top-3 left-3 flex gap-2">
          <span class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#0a8f96] text-white shadow-lg shadow-[#0a8f96]/30">{{ property().listingType }}</span>
          @if (property().isFeatured) {
            <span class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/30">⭐ Featured</span>
          }
        </div>
        <!-- Save Button -->
        @if (showSave()) {
          <button (click)="onSave($event)" class="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all border border-white/20 shadow-lg group/heart">
            <svg class="w-5 h-5 transition-all duration-300" 
                 [class.fill-red-500]="saved()" 
                 [class.text-red-500]="saved()" 
                 [class.text-white]="!saved()" 
                 [class.group-hover/heart:scale-110]="true"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        }
        <!-- Status -->
        <div class="absolute bottom-3 right-3">
          <span [class]="'status-' + property().status.toLowerCase()">{{ property().status }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5">
        <h3 class="font-bold text-gray-900 truncate group-hover:text-[#0a8f96] transition-colors text-[15px]">{{ property().title }}</h3>
        <p class="text-[#0a8f96] font-black text-xl mt-2 tracking-tight">{{ property().price | currencyEgp }}</p>

        <div class="flex items-center gap-4 mt-3.5 pt-3.5 border-t border-gray-50 text-sm text-gray-400">
          <span class="flex items-center gap-1.5">🛏️ {{ property().bedrooms }}</span>
          <span class="flex items-center gap-1.5">🚿 {{ property().bathrooms }}</span>
          <span class="flex items-center gap-1.5">📐 {{ property().area }} m²</span>
        </div>

        @if (property().city || property().district) {
          <p class="text-xs text-gray-400 mt-3 flex items-center gap-1.5 font-medium">
            📍 {{ property().district ? property().district + ', ' : '' }}{{ property().city }}
          </p>
        }
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
