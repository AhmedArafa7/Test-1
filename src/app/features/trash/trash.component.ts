import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { TrashService } from '../../core/services/trash.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { PropertyService } from '../properties/services/property.service';
import { TrashItem, TrashImageData, TrashPropertyData } from '../../core/models';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans p-6 lg:p-8 pt-28">
      <div class="max-w-5xl mx-auto">

        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="text-3xl font-black text-gray-900 tracking-tight">{{ 'TRASH.TITLE' | translate }}</h1>
            <p class="text-sm text-gray-500 font-bold mt-1">{{ 'TRASH.SUBTITLE' | translate }}</p>
          </div>
          @if (items().length > 0) {
            <button (click)="restoreAll()" class="text-sm font-black text-[#0a8f96] hover:text-[#076b70] px-4 py-2 rounded-xl hover:bg-[#0a8f96]/5 transition-all">{{ 'TRASH.RESTORE_ALL' | translate }}</button>
          }
        </div>

        <div class="flex gap-1 mb-8 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 w-fit">
          <button (click)="activeTab.set('images')" [class]="activeTab() === 'images' ? 'bg-[#0a8f96] text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'" class="px-6 py-2.5 rounded-xl text-sm font-black transition-all">{{ 'TRASH.TAB_IMAGES' | translate }} ({{ imageItems().length }})</button>
          <button (click)="activeTab.set('properties')" [class]="activeTab() === 'properties' ? 'bg-[#0a8f96] text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'" class="px-6 py-2.5 rounded-xl text-sm font-black transition-all">{{ 'TRASH.TAB_PROPERTIES' | translate }} ({{ propertyItems().length }})</button>
        </div>

        @if (activeTab() === 'images') {
          @if (imageItems().length === 0) {
            <div class="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
              <div class="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <p class="text-sm font-bold text-gray-400">{{ 'TRASH.NO_IMAGES' | translate }}</p>
            </div>
          } @else {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              @for (item of imageItems(); track item.id) {
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
                  <div class="aspect-square relative">
                    <img [src]="imageData(item).imageUrl" class="w-full h-full object-cover" loading="lazy">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button (click)="restoreItem(item)" class="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" [attr.title]="'TRASH.RESTORE' | translate">
                        <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                      </button>
                      <button (click)="deleteForever(item)" class="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" [attr.title]="'COMMON.DELETE' | translate">
                        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                  <div class="p-3">
                    <p class="text-[11px] font-bold text-gray-800 truncate">{{ imageData(item).propertyTitle }}</p>
                    <p class="text-[10px] text-gray-400 font-bold mt-1">{{ 'TRASH.DELETED_AT' | translate }} {{ item.deletedAt | date:'shortDate' }}</p>
                    <p class="text-[9px] text-amber-500 font-bold">{{ 'TRASH.EXPIRES_IN' | translate }} {{ getDaysLeft(item) }} {{ 'TRASH.DAYS' | translate }}</p>
                  </div>
                </div>
              }
            </div>
          }
        }

        @if (activeTab() === 'properties') {
          @if (propertyItems().length === 0) {
            <div class="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
              <div class="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              </div>
              <p class="text-sm font-bold text-gray-400">{{ 'TRASH.NO_PROPERTIES' | translate }}</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (item of propertyItems(); track item.id) {
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 group hover:shadow-md transition-all">
                  <div class="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                    @if (propertyData(item).propertyImageUrl) {
                      <img [src]="propertyData(item).propertyImageUrl" class="w-full h-full object-cover" loading="lazy">
                    } @else {
                      <div class="w-full h-full flex items-center justify-center text-gray-300">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                      </div>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-black text-gray-900 truncate">{{ propertyData(item).propertyTitle }}</p>
                    <p class="text-[11px] text-gray-400 font-bold mt-1">{{ 'TRASH.DELETED_AT' | translate }} {{ item.deletedAt | date:'shortDate' }}</p>
                    <p class="text-[10px] text-amber-500 font-bold">{{ 'TRASH.EXPIRES_IN' | translate }} {{ getDaysLeft(item) }} {{ 'TRASH.DAYS' | translate }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="restoreItem(item)" class="px-4 py-2 text-xs font-black text-[#0a8f96] bg-[#0a8f96]/5 hover:bg-[#0a8f96]/10 rounded-xl transition-all">{{ 'TRASH.RESTORE' | translate }}</button>
                    <button (click)="deleteForever(item)" class="px-4 py-2 text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all">{{ 'COMMON.DELETE' | translate }}</button>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class TrashComponent implements OnInit {
  private trashService = inject(TrashService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private propertyService = inject(PropertyService);
  private translate = inject(TranslateService);

  activeTab = signal<'images' | 'properties'>('images');

  readonly items = this.trashService.items;

  readonly imageItems = computed(() => this.items().filter(i => i.type === 'image'));
  readonly propertyItems = computed(() => this.items().filter(i => i.type === 'property'));

  ngOnInit() {
    this.trashService.fetchFromApi();
  }

  imageData(item: TrashItem): TrashImageData {
    return item.data as TrashImageData;
  }

  propertyData(item: TrashItem): TrashPropertyData {
    return item.data as TrashPropertyData;
  }

  getDaysLeft(item: TrashItem): number {
    const diff = new Date(item.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  async restoreItem(item: TrashItem) {
    if (item.type === 'image') {
      const data = item.data as TrashImageData;
      try {
        await this.propertyService.addImages(data.propertyId, [data.imageUrl]);
        this.toast.success(this.translate.instant('TRASH.RESTORE_IMAGE_SUCCESS'));
        this.trashService.restoreItem(item);
      } catch {
        this.toast.error(this.translate.instant('TRASH.RESTORE_ERROR'));
      }
    } else {
      const data = item.data as TrashPropertyData;
      try {
        await this.propertyService.create(data.createRequest);
        this.toast.success(this.translate.instant('TRASH.RESTORE_PROPERTY_SUCCESS'));
        this.trashService.restoreItem(item);
      } catch {
        this.toast.error(this.translate.instant('TRASH.RESTORE_ERROR'));
      }
    }
  }

  async deleteForever(item: TrashItem) {
    const ok = await this.confirmService.ask({
      title: this.translate.instant('COMMON.CONFIRM_DELETE_TITLE'),
      message: item.type === 'image'
        ? this.translate.instant('TRASH.DELETE_IMAGE_FOREVER_CONFIRM')
        : this.translate.instant('TRASH.DELETE_PROPERTY_FOREVER_CONFIRM'),
      confirmText: this.translate.instant('COMMON.DELETE'),
      cancelText: this.translate.instant('COMMON.CANCEL'),
      variant: 'danger',
    });
    if (!ok) return;

    try {
      if (item.type === 'image') {
        const data = item.data as TrashImageData;
        await this.propertyService.deleteImage(data.propertyId, data.imageId);
        this.toast.success(this.translate.instant('TRASH.DELETE_IMAGE_FOREVER_SUCCESS'));
      } else {
        this.toast.success(this.translate.instant('TRASH.DELETE_PROPERTY_FOREVER_SUCCESS'));
      }
      this.trashService.remove(item.id);
    } catch {
      this.toast.error(this.translate.instant('TRASH.DELETE_ERROR'));
    }
  }

  async restoreAll() {
    const items = [...this.items()];
    let restored = 0;
    for (const item of items) {
      try {
        if (item.type === 'image') {
          const data = item.data as TrashImageData;
          await this.propertyService.addImages(data.propertyId, [data.imageUrl]);
        } else {
          const data = item.data as TrashPropertyData;
          await this.propertyService.create(data.createRequest);
        }
        this.trashService.restoreItem(item);
        restored++;
      } catch {
        // skip failed items
      }
    }
    if (restored > 0) {
      this.toast.success(this.translate.instant('TRASH.RESTORE_ALL_SUCCESS'));
    } else {
      this.toast.error(this.translate.instant('TRASH.RESTORE_ERROR'));
    }
  }
}
