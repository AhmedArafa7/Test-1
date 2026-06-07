import { Component, OnInit, signal, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { PropertyListItem } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card';
import { PropertyService } from '../services/property.service';
import { PropertyCompareComponent } from '../../../shared/components/property-compare/property-compare';

@Component({
  selector: 'app-saved-properties',
  standalone: true,
  imports: [
    PropertyCardComponent, 
    EmptyStateComponent, 
    LoadingSpinnerComponent, 
    PaginationComponent, 
    TranslateModule, 
    PropertyCompareComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans py-16">
      <div class="max-w-7xl mx-auto px-6">
        
        <div class="mb-12 text-center ltr:md:text-left rtl:md:text-right">
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">{{ 'SAVED_PROPERTIES.TITLE' | translate }}</h1>
          <p class="text-sm text-gray-500 font-bold">
            {{ 'SAVED_PROPERTIES.SUBTITLE_COUNT' | translate:{ count: totalCount() } }}
          </p>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-32"><app-loading-spinner [message]="'SAVED_PROPERTIES.LOADING' | translate" /></div>
        } @else if (items().length === 0) {
          <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <app-empty-state 
              [title]="'SAVED_PROPERTIES.EMPTY_TITLE' | translate" 
              [message]="'SAVED_PROPERTIES.EMPTY_MSG' | translate"
              [actionText]="'SAVED_PROPERTIES.BROWSE_BTN' | translate"
              actionRoute="/properties">
              <div icon class="w-12 h-12 text-red-500">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
            </app-empty-state>
          </div>
        } @else {
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            @for (property of items(); track property.id) {
              <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group relative">
                
                <!-- Property Card -->
                <div class="flex-1 relative">
                  <app-property-card [property]="property" />
                </div>
                
                <!-- Actions Footer (Compare & Delete) -->
                <div class="p-5 bg-slate-50/80 border-t border-slate-100 shrink-0 flex gap-3">
                  <button (click)="toggleCompare(property)" 
                          class="flex-1 border text-xs font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          [style.backgroundColor]="isCompared(property.id) ? '#0a8f96' : 'white'"
                          [style.color]="isCompared(property.id) ? 'white' : '#0a8f96'"
                          [style.borderColor]="isCompared(property.id) ? '#0a8f96' : '#0a8f9633'">
                    ⚖️ {{ (isCompared(property.id) ? 'COMPARE.REMOVE' : 'COMPARE.BTN_COMPARE') | translate }}
                  </button>
                  <button (click)="remove(property.id)" class="w-12 bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer" [title]="'SAVED_PROPERTIES.REMOVE_BTN' | translate">
                    <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="mt-12 flex justify-center">
            <app-pagination 
              [currentPage]="currentPage()" 
              [totalPages]="totalPages()" 
              (pageChange)="goToPage($event)" />
          </div>
        }
      </div>

      <!-- Comparison Matrix -->
      <app-property-compare [selectedProperties]="selectedPropertiesForCompare()" (compareChange)="selectedPropertiesForCompare.set($event)" />

    </div>
  `,
})
export class SavedPropertiesComponent implements OnInit {
  items = signal<PropertyListItem[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  totalCount = signal(0);

  // Comparison Matrix Signals
  selectedPropertiesForCompare = signal<PropertyListItem[]>([]);

  public translate = inject(TranslateService);

  constructor(
    private propertyService: PropertyService, 
    private toast: ToastService
  ) {}

  async ngOnInit() {
    await this.loadSaved();
  }

  async loadSaved(page = 1) {
    this.loading.set(true);
    this.currentPage.set(page);
    try {
      const response = await this.propertyService.getSaved(page, 12);
      this.items.set(response.items);
      this.totalPages.set(response.totalPages);
      this.totalCount.set(response.totalCount);
    } catch {
      this.toast.error('SAVED_PROPERTIES.ERROR_LOAD');
    } finally {
      this.loading.set(false);
    }
  }

  async goToPage(page: number) {
    await this.loadSaved(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async remove(id: string) {
    try {
      await this.propertyService.unsave(id);
      this.items.update(items => items.filter(item => item.id !== id));
      this.totalCount.update(c => Math.max(0, c - 1));
      
      // Also remove from comparison if removed from saved
      this.selectedPropertiesForCompare.update(current => current.filter(i => i.id !== id));
      
      if (this.items().length === 0 && this.currentPage() > 1) {
        this.goToPage(this.currentPage() - 1);
      } else if (this.items().length === 0 && this.currentPage() === 1) {
        this.loadSaved(1);
      }
      
      this.toast.success('SAVED_PROPERTIES.SUCCESS_REMOVE');
    } catch (error: any) {
      this.toast.error(error?.error?.detail || 'SAVED_PROPERTIES.ERROR_REMOVE');
    }
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