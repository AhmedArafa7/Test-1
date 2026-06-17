import { Component, OnInit, signal, computed, inject, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as L from 'leaflet';
import { PropertyService } from '../services/property.service';
import { CreatePropertyRequest, FurnishingStatus, ListingType, PropertyType, ViewType, PropertyImage } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { LocalImageService } from '../../../core/services/local-image.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { TrashService } from '../../../core/services/trash.service';
import { compressImage } from '../../../core/utils/media';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans p-6 lg:p-8 pt-24">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="mb-10 text-center">
            <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">
                {{ (isEdit() ? 'PROPERTY_FORM.TITLE_EDIT' : 'PROPERTY_FORM.TITLE_CREATE') | translate }}
            </h1>
            <p class="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
                {{ 'PROPERTY_FORM.SUBTITLE' | translate }}
            </p>
        </div>

        <!-- Stepper -->
        <div class="flex items-center justify-center gap-4 mb-12">
            @for (step of [1, 2, 3, 4]; track step) {
                <div class="flex flex-col items-center cursor-pointer" (click)="navigateToStep(step)">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-2 transition-colors"
                         [class]="currentStep() >= step ? 'bg-[#0a8f96] text-white' : 'bg-gray-200 text-gray-500'">{{step}}</div>
                    <span class="text-xs font-bold" [class]="currentStep() >= step ? 'text-gray-900' : 'text-gray-400'">
                        {{ step === 1 ? ('PROPERTY_FORM.STEPS.DETAILS' | translate) : step === 2 ? ('PROPERTY_FORM.STEPS.IMAGES' | translate) : step === 3 ? ('PROPERTY_FORM.STEPS.AMENITIES' | translate) : ('PROPERTY_FORM.STEPS.LOCATION' | translate) }}
                    </span>
                </div>
                @if (step < 4) {
                    <div class="w-16 h-px" [class]="currentStep() > step ? 'bg-[#0a8f96]' : 'bg-gray-300'"></div>
                }
            }
        </div>

        <form (ngSubmit)="submit()" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- Main Content (Right) -->
          <div class="lg:col-span-8 space-y-8" [class.lg:col-start-3]="currentStep() !== 4">
            
            <!-- Basic Details -->
            <div [class.hidden]="currentStep() !== 1" class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 relative mx-auto">
                
                <!-- Draft Restore Alert -->
                @if (hasDraftAvailable() && !isEdit()) {
                  <div class="mb-8 p-5 bg-[#0a8f96]/5 border border-[#0a8f96]/10 rounded-2xl flex items-center justify-between gap-4 animate-pulse select-none mx-auto" dir="rtl">
                    <div class="flex items-center gap-3">
                      <span class="text-xl">💾</span>
                      <div class="text-right">
                        <h4 class="text-xs font-black text-slate-800 leading-none mb-1">{{ 'PROPERTY_FORM.DRAFT.TITLE' | translate }}</h4>
                        <p class="text-[9px] text-slate-400 font-bold">{{ 'PROPERTY_FORM.DRAFT.DESC' | translate }}</p>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" (click)="restoreDraft()" class="bg-[#0a8f96] hover:bg-[#076b70] text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95">{{ 'PROPERTY_FORM.DRAFT.RESTORE' | translate }}</button>
                      <button type="button" (click)="discardDraft()" class="text-slate-400 hover:text-red-500 px-2 py-1.5 text-[10px] font-bold transition-all">{{ 'PROPERTY_FORM.DRAFT.DISCARD' | translate }}</button>
                    </div>
                  </div>
                }

                <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-10 border-b border-gray-50 pb-6 ltr:flex-row rtl:flex-row-reverse">
                  <h3 class="text-xl font-black text-gray-900">{{ 'PROPERTY_FORM.SECTION_BASIC' | translate }}</h3>
                  <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </div>
                </div>

                <div class="space-y-8 ltr:text-left rtl:text-right">
                  <div class="space-y-3">
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_TITLE' | translate }} <span class="text-red-500">*</span></label>
                    <input type="text" [(ngModel)]="form.title" name="title" id="title"
                           (ngModelChange)="triggerDraftSave(); markFieldTouched('title')"
                           (blur)="markFieldTouched('title')"
                           [class]="getFieldClasses('title', touchedFields()['title'], getFieldError('title')) + ' rounded-[28px] px-8 py-5 text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-[#0a8f96]/5 font-bold text-lg shadow-sm'"
                           [class.border-red-500]="validationErrors['title']"
                           [placeholder]="'PROPERTY_FORM.PLACEHOLDER_TITLE' | translate">
                    <div class="flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-1 mt-1">
                      @if (touchedFields()['title'] && getFieldError('title')) {
                        <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        <span class="text-red-600">{{ 'PROPERTY_FORM.VALIDATION.TITLE_REQUIRED' | translate }}</span>
                      } @else {
                        <span class="text-gray-400">{{ 'PROPERTY_FORM.HINT.TITLE' | translate }}</span>
                      }
                    </div>
                  </div>

                  <!-- WYSIWYG Rich Text Editor -->
                  <div class="space-y-3">
                    <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_DESC' | translate }} <span class="text-red-500">*</span></label>
                    <div class="border border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                      <!-- Toolbar (disabled: feature not yet enabled) -->
                      <!-- Editor Editable Area -->
                      <div #editorContent 
                           contenteditable="true"
                           (input)="onEditorInput(editorContent.innerHTML)"
                           class="w-full px-6 py-5 text-sm font-bold focus:outline-none min-h-[180px] max-h-[300px] overflow-y-auto custom-scrollbar ltr:text-left rtl:text-right"
                           [innerHTML]="initialDescriptionHtml"
                           [attr.placeholder]="'PROPERTY_FORM.PLACEHOLDER_DESC' | translate">
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_PROPERTY_TYPE' | translate }} <span class="text-red-500">*</span></label>
                      <select [(ngModel)]="form.propertyType" name="type" [disabled]="isEdit()" class="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        <option [ngValue]="'Apartment'">{{ 'PROPERTY.TYPES.Apartment' | translate }}</option>
                        <option [ngValue]="'Villa'">{{ 'PROPERTY.TYPES.Villa' | translate }}</option>
                        <option [ngValue]="'Office'">{{ 'PROPERTY.TYPES.Office' | translate }}</option>
                        <option [ngValue]="'Land'">{{ 'PROPERTY.TYPES.Land' | translate }}</option>
                      </select>
                    </div>
                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_LISTING_TYPE' | translate }} <span class="text-red-500">*</span></label>
                      <select [(ngModel)]="form.listingType" name="listing" [disabled]="isEdit()" class="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        <option [ngValue]="'Sale'">{{ 'PROPERTY.LISTING_TYPES.Sale' | translate }}</option>
                        <option [ngValue]="'Rent'">{{ 'PROPERTY.LISTING_TYPES.Rent' | translate }}</option>
                      </select>
                    </div>
                  </div>

                  <!-- Price & Area Row -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">
                        {{ 'PROPERTY_FORM.LABEL_PRICE' | translate }} <span class="text-red-500">*</span>
                      </label>
                      <div class="relative flex items-center">
                        <input type="number" [(ngModel)]="form.price" name="price" id="price"
                               (ngModelChange)="markFieldTouched('price')"
                               (blur)="markFieldTouched('price')"
                               [class]="getFieldClasses('price', touchedFields()['price'], getFieldError('price')) + ' focus:ring-4 focus:ring-[#0a8f96]/5 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner placeholder:text-gray-300'"
                               [class.border-red-500]="validationErrors['price']"
                               [placeholder]="'PROPERTY_FORM.PLACEHOLDER_PRICE' | translate" min="1">
                        <span class="absolute ltr:right-6 rtl:left-6 text-xs font-extrabold text-[#0a8f96] pointer-events-none">{{ 'PROPERTY.CURRENCY' | translate }}</span>
                      </div>
                      @if (touchedFields()['price'] && getFieldError('price')) {
                        <div class="flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-1 mt-1">
                          <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                          <span class="text-red-600">{{ 'PROPERTY_FORM.VALIDATION.PRICE_POSITIVE' | translate }}</span>
                        </div>
                      } @else {
                        <div class="text-[11px] font-bold tracking-wide text-gray-400 px-1 mt-1">{{ 'PROPERTY_FORM.HINT.PRICE' | translate }}</div>
                      }
                    </div>

                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">
                        {{ 'PROPERTY_FORM.LABEL_AREA' | translate }} <span class="text-red-500">*</span>
                      </label>
                      <div class="relative flex items-center">
                        <input type="number" [(ngModel)]="form.area" name="area" id="area"
                               (ngModelChange)="markFieldTouched('area')"
                               (blur)="markFieldTouched('area')"
                               [class]="getFieldClasses('area', touchedFields()['area'], getFieldError('area')) + ' focus:ring-4 focus:ring-[#0a8f96]/5 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner placeholder:text-gray-300'"
                               [class.border-red-500]="validationErrors['area']"
                               [placeholder]="'PROPERTY_FORM.PLACEHOLDER_AREA' | translate" min="1">
                        <span class="absolute ltr:right-6 rtl:left-6 text-xs font-extrabold text-[#0a8f96] pointer-events-none">{{ 'PROPERTY.AREA_UNIT' | translate }}</span>
                      </div>
                      @if (touchedFields()['area'] && getFieldError('area')) {
                        <div class="flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-1 mt-1">
                          <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                          <span class="text-red-600">{{ 'PROPERTY_FORM.VALIDATION.AREA_POSITIVE' | translate }}</span>
                        </div>
                      } @else {
                        <div class="text-[11px] font-bold tracking-wide text-gray-400 px-1 mt-1">{{ 'PROPERTY_FORM.HINT.AREA' | translate }}</div>
                      }
                    </div>
                  </div>

                  <!-- Bedrooms, Bathrooms, Floor & Total Floors Row -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_BEDROOMS' | translate }} <span class="text-red-500"></span></label>
                       <input type="number" [(ngModel)]="form.bedrooms" name="bedrooms" id="bedrooms" min="0" [placeholder]="'PROPERTY_FORM.PLACEHOLDER_BEDROOMS' | translate"
                             class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner text-center">
                    </div>

                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_BATHROOMS' | translate }} <span class="text-red-500"></span></label>
                       <input type="number" [(ngModel)]="form.bathrooms" name="bathrooms" id="bathrooms" min="0" [placeholder]="'PROPERTY_FORM.PLACEHOLDER_BATHROOMS' | translate"
                             class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner text-center">
                    </div>

                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_FLOOR' | translate }}</label>
                      <input type="number" [(ngModel)]="form.floor" name="floor" id="floor" min="0" [placeholder]="'PROPERTY_FORM.PLACEHOLDER_FLOOR' | translate"
                             class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner text-center">
                    </div>

                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_TOTAL_FLOORS' | translate }}</label>
                      <input type="number" [(ngModel)]="form.totalFloors" name="totalFloors" id="totalFloors" min="0" [placeholder]="'PROPERTY_FORM.PLACEHOLDER_TOTAL_FLOORS' | translate"
                             class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner text-center">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Per-Stage Required-Field Notice (steps 2, 3, 4) -->
              @if (currentStep() > 1) {
                @let missingFields = getMissingRequiredFieldsInPreviousSteps();
                @if (missingFields.length > 0) {
                  <div class="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl animate-scale-in" dir="rtl">
                    <div class="flex items-start gap-3">
                      <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z"/>
                      </svg>
                      <div class="flex-1">
                        <h4 class="text-sm font-black text-amber-800 mb-1">{{ 'PROPERTY_FORM.NOTICE.MISSING_TITLE' | translate }}</h4>
                        <p class="text-xs text-amber-700 mb-3 leading-relaxed">{{ 'PROPERTY_FORM.NOTICE.MISSING_DESC' | translate }}</p>
                        <div class="flex flex-wrap gap-2">
                          @for (item of missingFields; track item.id) {
                            <button type="button"
                                    (click)="focusMissingField(item)"
                                    [attr.aria-label]="'PROPERTY_FORM.GO_TO' | translate:{step: (item.labelKey | translate)}"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-800 hover:bg-amber-100 hover:border-amber-400 transition-all active:scale-95 cursor-pointer">
                              <span class="w-4 h-4 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black">{{ item.step }}</span>
                              <span>{{ item.labelKey | translate }}</span>
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                              </svg>
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              }

              <!-- Media Section -->
              <div [class.hidden]="currentStep() !== 2" class="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-8 border-b border-gray-50 pb-4 ltr:flex-row rtl:flex-row-reverse">
                  <h3 class="text-lg font-black text-gray-900">{{ 'PROPERTY_FORM.SECTION_MEDIA' | translate }}</h3>
                  <svg class="w-5 h-5 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>

                <div class="space-y-6 ltr:text-left rtl:text-right">
                  
                  <!-- Individual Images Upload Progress Panel -->
                  @if (uploadProgressList().length > 0) {
                    <div class="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4 mb-6 animate-scale-in" dir="rtl">
                      <h4 class="text-xs font-black text-slate-800 flex items-center gap-2">
                        <span>{{ 'PROPERTY_FORM.MESSAGES.UPLOADING_CLOUD' | translate }}</span>
                      </h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @for (img of uploadProgressList(); track img.id) {
                          <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                            <div class="flex items-center gap-3">
                              <div class="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                                <img [src]="img.preview" class="w-full h-full object-cover">
                              </div>
                              <div class="text-right">
                                <h5 class="text-[10px] font-black text-slate-700 leading-none mb-1.5">{{ 'PROPERTY_FORM.IMAGE_NUMBER' | translate:{ index: img.index } }}</h5>
                                <span class="text-[9px] font-black tracking-wide" 
                                      [class.text-[#0a8f96]]="img.status === 'uploading'" 
                                      [class.text-emerald-500]="img.status === 'success'" 
                                      [class.text-red-500]="img.status === 'error'">
                                  {{ img.status === 'uploading' ? ('IMAGE.STATUS_UPLOADING' | translate) : img.status === 'success' ? ('IMAGE.STATUS_SUCCESS' | translate) : ('IMAGE.STATUS_FAILED' | translate) }}
                                </span>
                              </div>
                            </div>
                            <div class="flex items-center gap-3 w-32 shrink-0">
                              <div class="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div class="bg-[#0a8f96] h-full transition-all duration-300" [style.width.%]="img.progress"></div>
                              </div>
                              <span class="text-[10px] font-black text-slate-600 w-8 text-left">{{ img.progress }}%</span>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Existing Images Grid (Edit Mode) -->
                  @if (isEdit() && existingImages().length > 0) {
                    <div class="space-y-4 mb-8">
                      <h4 class="text-xs font-black text-slate-800 flex items-center gap-2">
                        <span>{{ 'PROPERTY_FORM.CURRENT_IMAGES_HINT' | translate }}</span>
                      </h4>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        @for (img of existingImages(); track img.id) {
                          <div class="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                            <img [src]="img.url" class="w-full h-full object-cover">
                            @if (img.isPrimary) {
                              <div class="absolute top-2 ltr:left-2 rtl:right-2 bg-amber-400 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                {{ 'PROPERTY_FORM.PRIMARY_IMAGE' | translate }}
                              </div>
                            }
                            <div class="absolute bottom-2 inset-x-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              @if (!img.isPrimary) {
                                <button type="button" (click)="setPrimaryImage(img)" 
                                        class="flex-1 h-8 bg-amber-400/90 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center gap-1 text-[10px] font-black shadow-md cursor-pointer transition-all">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                  </svg>
                                  {{ 'PROPERTY_FORM.SET_AS_PRIMARY' | translate }}
                                </button>
                              }
                              <button type="button" (click)="removeExistingImage(img)" [disabled]="isLastRemainingImage()" 
                                      class="h-8 w-8 bg-red-500/90 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-md cursor-pointer transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- File Upload Button -->
                  <div class="relative">
                    <input type="file" multiple (change)="onFileSelected($event)" #fileInput class="hidden">
                    <button type="button" (click)="fileInput.click()" class="w-full py-10 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-[#0a8f96]/30 hover:bg-[#0a8f96]/5 transition-all group">
                      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#0a8f96] transition-colors">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                      </div>
                      <span class="text-sm font-black text-gray-400 group-hover:text-gray-900 transition-colors">{{ 'PROPERTY_FORM.BTN_UPLOAD' | translate }}</span>
                    </button>
                  </div>

                  <!-- Local Preview Grid -->
                  @if (localImages().length > 0) {
                    <div class="space-y-3 mb-6">
                      <h4 class="text-xs font-black text-slate-800 flex items-center gap-2">
                        <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        <span>{{ 'PROPERTY_FORM.SELECT_PRIMARY_HINT' | translate }}</span>
                      </h4>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        @for (img of localImages(); track img; let i = $index) {
                          <div class="relative group aspect-square rounded-2xl overflow-hidden shadow-sm">
                            <img [src]="img" class="w-full h-full object-cover">
                            @if (i === primaryLocalIndex()) {
                              <div class="absolute top-2 ltr:left-2 rtl:right-2 bg-amber-400 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md flex items-center gap-1 z-10">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                {{ 'PROPERTY_FORM.PRIMARY_IMAGE' | translate }}
                              </div>
                            }
                            <div class="absolute bottom-2 inset-x-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              @if (i !== primaryLocalIndex()) {
                                <button type="button" (click)="setPrimaryLocalImage(i)"
                                        class="flex-1 h-8 bg-amber-400/90 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center gap-1 text-[10px] font-black shadow-md cursor-pointer transition-all">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                  </svg>
                                  {{ 'PROPERTY_FORM.SET_AS_PRIMARY' | translate }}
                                </button>
                              }
                              <button type="button" (click)="removeLocalImage(i)" [disabled]="isLastRemainingImage()" class="h-8 w-8 bg-red-500/90 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-md cursor-pointer transition-all">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <div class="pt-6 border-t border-gray-50">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ltr:text-left rtl:text-right">{{ 'PROPERTY_FORM.MEDIA_HELP' | translate }}</p>
                    <textarea [(ngModel)]="imageUrlsText" name="images" class="w-full bg-gray-50 border-transparent rounded-[24px] px-6 py-5 text-xs font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all min-h-[100px] resize-none" [placeholder]="'PROPERTY_FORM.PLACEHOLDER_MEDIA_URLS' | translate"></textarea>
                  </div>
                </div>
              </div>


              <!-- Amenities & Details -->
              <div [class.hidden]="currentStep() !== 3" class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
                <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-10 border-b border-gray-50 pb-6 ltr:flex-row rtl:flex-row-reverse">
                  <h3 class="text-xl font-black text-gray-900">{{ 'PROPERTY_FORM.SECTION_AMENITIES' | translate }}</h3>
                  <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 ltr:text-left rtl:text-right">
                  <label class="flex items-center gap-3 cursor-pointer group ltr:flex-row rtl:flex-row-reverse">
                    <input type="checkbox" [(ngModel)]="form.hasParking" name="parking" class="w-5 h-5 rounded-lg border-gray-200 text-[#0a8f96] focus:ring-[#0a8f96]">
                    <span class="text-sm font-bold text-gray-600 group-hover:text-gray-900">{{ 'PROPERTY_FORM.AMENITY_PARKING' | translate }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group ltr:flex-row rtl:flex-row-reverse">
                    <input type="checkbox" [(ngModel)]="form.hasPool" name="pool" class="w-5 h-5 rounded-lg border-gray-200 text-[#0a8f96] focus:ring-[#0a8f96]">
                    <span class="text-sm font-bold text-gray-600 group-hover:text-gray-900">{{ 'PROPERTY_FORM.AMENITY_POOL' | translate }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group ltr:flex-row rtl:flex-row-reverse">
                    <input type="checkbox" [(ngModel)]="form.hasGym" name="gym" class="w-5 h-5 rounded-lg border-gray-200 text-[#0a8f96] focus:ring-[#0a8f96]">
                    <span class="text-sm font-bold text-gray-600 group-hover:text-gray-900">{{ 'PROPERTY_FORM.AMENITY_GYM' | translate }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group ltr:flex-row rtl:flex-row-reverse">
                    <input type="checkbox" [(ngModel)]="form.hasElevator" name="elevator" class="w-5 h-5 rounded-lg border-gray-200 text-[#0a8f96] focus:ring-[#0a8f96]">
                    <span class="text-sm font-bold text-gray-600 group-hover:text-gray-900">{{ 'PROPERTY_FORM.AMENITY_ELEVATOR' | translate }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group ltr:flex-row rtl:flex-row-reverse">
                    <input type="checkbox" [(ngModel)]="form.hasSecurity" name="security" class="w-5 h-5 rounded-lg border-gray-200 text-[#0a8f96] focus:ring-[#0a8f96]">
                    <span class="text-sm font-bold text-gray-600 group-hover:text-gray-900">{{ 'PROPERTY_FORM.AMENITY_SECURITY' | translate }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group ltr:flex-row rtl:flex-row-reverse">
                    <input type="checkbox" [(ngModel)]="form.hasBalcony" name="balcony" class="w-5 h-5 rounded-lg border-gray-200 text-[#0a8f96] focus:ring-[#0a8f96]">
                    <span class="text-sm font-bold text-gray-600 group-hover:text-gray-900">{{ 'PROPERTY_FORM.AMENITY_BALCONY' | translate }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group ltr:flex-row rtl:flex-row-reverse">
                    <input type="checkbox" [(ngModel)]="form.hasGarden" name="garden" class="w-5 h-5 rounded-lg border-gray-200 text-[#0a8f96] focus:ring-[#0a8f96]">
                    <span class="text-sm font-bold text-gray-600 group-hover:text-gray-900">{{ 'PROPERTY_FORM.AMENITY_GARDEN' | translate }}</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group ltr:flex-row rtl:flex-row-reverse">
                    <input type="checkbox" [(ngModel)]="form.hasCentralAC" name="ac" class="w-5 h-5 rounded-lg border-gray-200 text-[#0a8f96] focus:ring-[#0a8f96]">
                    <span class="text-sm font-bold text-gray-600 group-hover:text-gray-900">{{ 'PROPERTY_FORM.AMENITY_AC' | translate }}</span>
                  </label>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 ltr:text-left rtl:text-right">
                  <div class="space-y-3">
                    <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_FURNISHING' | translate }}</label>
                    <select [(ngModel)]="form.furnishingStatus" name="furnishing" class="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all appearance-none cursor-pointer">
                      <option [ngValue]="'Unfurnished'">{{ 'PROPERTY.FURNISHING.Unfurnished' | translate }}</option>
                      <option [ngValue]="'SemiFurnished'">{{ 'PROPERTY.FURNISHING.SemiFurnished' | translate }}</option>
                      <option [ngValue]="'FullyFurnished'">{{ 'PROPERTY.FURNISHING.FullyFurnished' | translate }}</option>
                    </select>
                  </div>
                  <div class="space-y-3">
                    <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_VIEW' | translate }}</label>
                    <select [(ngModel)]="form.viewType" name="view" class="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all appearance-none cursor-pointer">
                      <option [ngValue]="undefined">{{ 'PROPERTY.AMENITIES.VIEW.TITLE' | translate }}</option>
                      <option [ngValue]="'Sea'">{{ 'PROPERTY.AMENITIES.VIEW.Sea' | translate }}</option>
                      <option [ngValue]="'Garden'">{{ 'PROPERTY.AMENITIES.VIEW.Garden' | translate }}</option>
                      <option [ngValue]="'Street'">{{ 'PROPERTY.AMENITIES.VIEW.Street' | translate }}</option>
                      <option [ngValue]="'City'">{{ 'PROPERTY.AMENITIES.VIEW.City' | translate }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Location -->
              <div [class.hidden]="currentStep() !== 4" class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
                <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-10 border-b border-gray-50 pb-6 ltr:flex-row rtl:flex-row-reverse">
                  <h3 class="text-xl font-black text-gray-900">{{ 'PROPERTY_FORM.SECTION_LOCATION' | translate }}</h3>
                  <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 ltr:text-left rtl:text-right">
                  
                  <!-- Smart Geocoding search input with autocomplete -->
                  <div class="space-y-3 md:col-span-2 relative">
                    <label class="block text-[11px] font-black text-[#0a8f96] uppercase tracking-wider mb-1 px-1">{{ 'PROPERTY_FORM.GEO_SEARCH_LABEL' | translate }}</label>
                    <div class="relative flex items-start gap-2">
                      <div class="relative flex-1">
                        <input type="text" #geoSearchInput
                               (input)="onGeoSearchInput(geoSearchInput.value)"
                               (keyup.enter)="searchLocation(geoSearchInput.value)"
                               (focus)="showSearchResults.set(searchResults().length > 0)"
                               (blur)="scheduleCloseResults()"
                               [placeholder]="'PROPERTY_FORM.GEO_SEARCH_PLACEHOLDER' | translate"
                               class="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold shadow-sm"
                               autocomplete="off">
                        @if (showSearchResults() && searchResults().length > 0) {
                          <div class="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-72 overflow-y-auto">
                            @for (result of searchResults(); track result.place_id; let i = $index) {
                              <button type="button"
                                      (mousedown)="selectSearchResult(result)"
                                      class="w-full text-right px-4 py-3 hover:bg-[#0a8f96]/5 transition-colors border-b border-gray-50 last:border-b-0 cursor-pointer"
                                      [class.bg-[#0a8f96]/10]="i === selectedSearchIndex()">
                                <div class="text-sm font-bold text-gray-800">{{ result.display_name }}</div>
                                <div class="text-[11px] text-gray-400 mt-0.5">
                                  {{ ('PROPERTY_FORM.GEO_RESULT_TYPE' | translate) + ': ' + result.type }}
                                </div>
                              </button>
                            }
                          </div>
                        }
                      </div>
                      <button type="button" (click)="searchLocation(geoSearchInput.value)"
                              class="bg-[#0a8f96] hover:bg-[#076b70] text-white text-xs font-black px-6 py-4 rounded-2xl transition-all active:scale-95 cursor-pointer shrink-0">
                        {{ 'PROPERTY_FORM.GEO_SEARCH_BTN' | translate }}
                      </button>
                    </div>
                  </div>

                  <div class="space-y-3">
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_CITY' | translate }} <span class="text-red-500">*</span></label>
                            <input type="text" [(ngModel)]="form.city" name="city" id="city"
                                   list="cities-form-list"
                                   (ngModelChange)="markFieldTouched('city')"
                                   (blur)="markFieldTouched('city')"
                                   [class]="getFieldClasses('city', touchedFields()['city'], getFieldError('city')) + ' rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-[#0a8f96]/5 font-bold shadow-sm'"
                                   [class.border-red-500]="validationErrors['city']"
                                   [placeholder]="'PROPERTY_FORM.PLACEHOLDER_CITY' | translate">
                            <datalist id="cities-form-list">
                              <option *ngFor="let city of cities" [value]="'CITIES.' + city | translate"></option>
                            </datalist>
                          </div>
                          <div class="space-y-3">
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_DISTRICT' | translate }} <span class="text-red-500">*</span></label>
                            <input type="text" [(ngModel)]="form.district" name="district" id="district"
                                   [attr.list]="getDistrictListId()"
                                   (ngModelChange)="markFieldTouched('district')"
                                   (blur)="markFieldTouched('district')"
                                   [class]="getFieldClasses('district', touchedFields()['district'], getFieldError('district')) + ' rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-[#0a8f96]/5 font-bold shadow-sm'"
                                   [class.border-red-500]="validationErrors['district']"
                                   [placeholder]="'PROPERTY_FORM.PLACEHOLDER_DISTRICT' | translate">
                            
                            <datalist id="districts-cairo-form-list">
                              <option *ngFor="let d of districtsCairo" [value]="'DISTRICTS.' + d | translate"></option>
                            </datalist>
                            <datalist id="districts-alex-form-list">
                              <option *ngFor="let d of districtsAlex" [value]="'DISTRICTS.' + d | translate"></option>
                            </datalist>
                            <datalist id="districts-form-list">
                              <option *ngFor="let d of districtsCommon" [value]="'DISTRICTS.' + d | translate"></option>
                            </datalist>
                          </div>
                  <div class="space-y-3">
                    <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_ZIP' | translate }}</label>
                    <input [(ngModel)]="form.zipCode" name="zip" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all" [placeholder]="'PROPERTY_FORM.PLACEHOLDER_ZIP' | translate">
                  </div>
                  <div class="md:col-span-2 space-y-3">
                    <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_ADDRESS' | translate }} <span class="text-red-500">*</span></label>
                    <input [(ngModel)]="form.addressLine" name="address" id="addressLine"
                           (ngModelChange)="markFieldTouched('addressLine')"
                           (blur)="markFieldTouched('addressLine')"
                           [class]="getFieldClasses('addressLine', touchedFields()['addressLine'], getFieldError('addressLine')) + ' focus:ring-4 focus:ring-[#0a8f96]/5 rounded-2xl px-6 py-4.5 text-sm font-bold transition-all'"
                           [class.border-red-500]="validationErrors['addressLine']"
                           [placeholder]="'PROPERTY_FORM.PLACEHOLDER_ADDRESS' | translate">
                    @if (touchedFields()['addressLine'] && getFieldError('addressLine')) {
                      <div class="flex items-center gap-1.5 text-[11px] font-bold tracking-wide px-1 mt-1">
                        <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        <span class="text-red-600">{{ 'PROPERTY_FORM.VALIDATION.ADDRESS_REQUIRED' | translate }}</span>
                      </div>
                    } @else {
                      <div class="text-[11px] font-bold tracking-wide text-gray-400 px-1 mt-1">{{ 'PROPERTY_FORM.HINT.ADDRESS' | translate }}</div>
                    }
                  </div>
                </div>

                <!-- Coordinates -->
                <div class="mt-10 pt-8 border-t border-gray-100 ltr:text-left rtl:text-right">
                  <div class="flex items-center justify-between mb-6 ltr:flex-row rtl:flex-row-reverse">
                    <button type="button" (click)="getCurrentLocation()" [disabled]="locating"
                      class="flex items-center gap-2 bg-[#0a8f96]/10 hover:bg-[#0a8f96]/20 text-[#0a8f96] text-xs font-black px-5 py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50 ltr:flex-row rtl:flex-row-reverse">
                      @if (locating) {
                        <div class="w-4 h-4 border-2 border-[#0a8f96]/30 border-t-[#0a8f96] rounded-full animate-spin"></div>
                        <span>{{ 'PROPERTY_FORM.LOCATING' | translate }}</span>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
                        <span>{{ 'PROPERTY_FORM.BTN_USE_MY_LOCATION' | translate }}</span>
                      }
                    </button>
                    <h4 class="text-sm font-black text-gray-600 flex items-center gap-2 ltr:flex-row rtl:flex-row-reverse">
                      <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                      {{ 'PROPERTY_FORM.COORDINATES_TITLE' | translate }}
                    </h4>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-3">
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_LAT' | translate }}</label>
                      <input type="number" step="any" [(ngModel)]="form.latitude" name="latitude"
                             (ngModelChange)="onCoordinatesChange()"
                             (blur)="onCoordinatesBlur()"
                             class="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold shadow-sm"
                             placeholder="30.0444">
                    </div>
                    <div class="space-y-3">
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_LNG' | translate }}</label>
                      <input type="number" step="any" [(ngModel)]="form.longitude" name="longitude"
                             (ngModelChange)="onCoordinatesChange()"
                             (blur)="onCoordinatesBlur()"
                             class="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold shadow-sm"
                             placeholder="31.2357">
                    </div>
                  </div>
                  @if (form.latitude && form.longitude) {
                    <div class="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[220px] relative group" #mapContainer></div>
                    <div class="mt-3 flex gap-2">
                      <button type="button" (click)="openInGoogleMaps()"
                              class="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-black px-4 py-2.5 rounded-2xl border border-gray-200 transition-all active:scale-95 ltr:flex-row rtl:flex-row-reverse">
                        <svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        <span>{{ 'PROPERTY_FORM.OPEN_IN_GOOGLE_MAPS' | translate }}</span>
                      </button>
                      <button type="button" (click)="resetMapLocation()"
                              class="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 text-xs font-black px-4 py-2.5 rounded-2xl border border-red-200 transition-all active:scale-95 ltr:flex-row rtl:flex-row-reverse">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        <span>{{ 'PROPERTY_FORM.CLEAR_COORDINATES' | translate }}</span>
                      </button>
                    </div>
                  }
                  <p class="text-[10px] text-gray-400 font-bold mt-3 ltr:text-left rtl:text-right">{{ 'PROPERTY_FORM.COORDINATES_HELP' | translate }}</p>
                </div>
              </div>

            <!-- Navigation Buttons -->
            <div class="flex flex-col gap-2 mt-8">
              <div class="flex justify-between">
                <button type="button" (click)="currentStep.set(currentStep() - 1)" [disabled]="currentStep() === 1" class="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-50">{{ 'PROPERTY_FORM.BTN_PREV' | translate }}</button>
                @if (currentStep() < 4) {
                  <button type="button" (click)="onNextClick()" [disabled]="!isCurrentStepValid()"
                          [title]="!isCurrentStepValid() ? ('PROPERTY_FORM.SAVE_DISABLED_HINT' | translate) : ''"
                          [class]="!isCurrentStepValid() ? 'px-8 py-4 rounded-2xl bg-gray-200 text-gray-400 font-bold cursor-not-allowed' : 'px-8 py-4 rounded-2xl bg-[#0a8f96] hover:bg-[#076b70] text-white font-bold transition-all'">
                    {{ 'PROPERTY_FORM.BTN_NEXT' | translate }}
                  </button>
                } @else {
                  <button type="submit" [disabled]="loading || !isFormValid()" (click)="markAllFieldsTouched()"
                          [title]="!isFormValid() ? ('PROPERTY_FORM.SAVE_DISABLED_HINT' | translate) : ''"
                          [class]="(loading || !isFormValid()) ? 'px-8 py-4 rounded-2xl bg-gray-200 text-gray-400 font-bold cursor-not-allowed' : 'px-8 py-4 rounded-2xl bg-[#0a8f96] hover:bg-[#076b70] text-white font-bold transition-all'">
                    {{ (isEdit() ? 'PROPERTY_FORM.BTN_SUBMIT_EDIT' : 'PROPERTY_FORM.BTN_SUBMIT_CREATE') | translate }}
                  </button>
                }
              </div>
              @if (!isCurrentStepValid() && currentStep() < 4) {
                <p class="text-[11px] font-bold text-amber-600 flex items-center gap-1.5 ltr:justify-end rtl:justify-start">
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ 'PROPERTY_FORM.SAVE_DISABLED_HINT' | translate }}</span>
                </p>
              }
            </div>
          </div>

          <!-- Sidebar (Left) -->
          @if (currentStep() === 4) {
            <div class="lg:col-span-4 space-y-8">
              <!-- Submit Action (Visible only in last step) -->
              <div class="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl shadow-gray-900/20 ltr:text-left rtl:text-right">
                  <h4 class="text-xl font-black mb-6 tracking-tight">{{ 'PROPERTY_FORM.SIDEBAR_TITLE' | translate }}</h4>
                  <p class="text-sm text-gray-400 mb-8 leading-relaxed font-medium">{{ 'PROPERTY_FORM.SIDEBAR_DESC' | translate }}</p>
                  
                  <button type="submit" [disabled]="loading || !isFormValid()" (click)="markAllFieldsTouched()"
                          [title]="!isFormValid() ? ('PROPERTY_FORM.SAVE_DISABLED_HINT' | translate) : ''"
                          [class]="(loading || !isFormValid()) ? 'w-full bg-gray-200 text-gray-400 font-black py-4.5 rounded-[22px] flex items-center justify-center gap-3 cursor-not-allowed mb-4 ltr:flex-row rtl:flex-row-reverse' : 'w-full bg-[#0a8f96] hover:bg-[#076b70] text-white font-black py-4.5 rounded-[22px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-[#0a8f96]/20 mb-4 ltr:flex-row rtl:flex-row-reverse'">
                      @if (loading) { <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                      {{ (isEdit() ? 'PROPERTY_FORM.BTN_SUBMIT_EDIT' : 'PROPERTY_FORM.BTN_SUBMIT_CREATE') | translate }}
                  </button>
                  
                  <a routerLink="/properties" class="block w-full text-center text-xs font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest py-2">
                      {{ 'PROPERTY_FORM.BTN_CANCEL' | translate }}
                  </a>
              </div>
            </div>
          }
        </form>
      </div>
    </div>
    
    <!-- Rich Text Editor & Form Fields CSS styling -->
    <style>
      [contenteditable]:empty:before {
        content: attr(placeholder);
        color: #94a3b8;
        font-weight: bold;
      }
      [contenteditable] ul {
        list-style-type: disc !important;
        padding-right: 1.5rem !important;
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }
      [contenteditable] ol {
        list-style-type: decimal !important;
        padding-right: 1.5rem !important;
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }
      /* Disable number spinner arrows for webkit and firefox */
      input[type="number"]::-webkit-outer-spin-button,
      input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
    </style>
  `,
})
export class PropertyFormComponent implements OnInit, AfterViewInit {
  readonly propertyTypeOptions = Object.values(PropertyType);
  readonly listingTypeOptions = Object.values(ListingType);
  readonly furnishingStatusOptions = Object.values(FurnishingStatus);
  readonly viewTypeOptions = Object.values(ViewType);

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

  cities = Object.keys(this.cityMap);
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
  districtsCommon = ['Zamalek', 'Smouha', 'Zayed', 'October'];

  isEdit = signal(false);
  loading = false;
  locating = false;
  validationErrors: { [key: string]: boolean } = {};
  touchedFields = signal<{ [key: string]: boolean }>({});
  existingImageUrls = signal<string[]>([]);
  existingImages = signal<PropertyImage[]>([]);
  deletedImageIds = signal<string[]>([]);
  propertyId = '';
  imageUrlsText = '';
  private translate = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private trashService = inject(TrashService);

  hasDraftAvailable = signal(false);
  private geocodeTimeout: any = null;
  private _isReverseGeocoding = false;
  initialDescriptionHtml = '';
  uploadProgressList = signal<{ id: string, preview: string, index: number, progress: number, status: 'pending' | 'uploading' | 'success' | 'error' }[]>([]);

  searchResults = signal<any[]>([]);
  showSearchResults = signal(false);
  selectedSearchIndex = signal(-1);
  private searchDebounce: any = null;
  private _leafletMap: L.Map | null = null;
  private _leafletMarker: L.Marker | null = null;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;


  form: CreatePropertyRequest = {
    title: '', description: '', propertyType: PropertyType.Apartment, listingType: ListingType.Sale,
    price: undefined as unknown as number,
    area: undefined as unknown as number,
    bedrooms: undefined as unknown as number,
    bathrooms: undefined as unknown as number,
    hasParking: false, hasPool: false, hasGym: false, hasElevator: false, hasSecurity: false, hasBalcony: false, hasGarden: false, hasCentralAC: false,
    furnishingStatus: FurnishingStatus.Unfurnished,
  };

  localImages = signal<string[]>([]);
  primaryLocalIndex = signal<number>(0);

  currentStep = signal(1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private toast: ToastService,
    private confirmService: ConfirmService,
    private localImageService: LocalImageService,
    private cloudinary: CloudinaryService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (!id) {
      this.checkDraftAvailability();
      // Setup periodic autosave every 4 seconds
      setInterval(() => this.triggerDraftSave(), 4000);
      return;
    }

    this.isEdit.set(true);
    this.propertyId = id;

    try {
      const property = await this.propertyService.getById(id);
      this.form = {
        ...this.form,
        title: property.title,
        description: property.description || '',
        propertyType: property.propertyType as PropertyType,
        listingType: property.listingType as ListingType,
        price: Number(property.price),
        area: Number(property.area),
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        floor: property.floor,
        totalFloors: property.totalFloors,
        city: this.getCityKeyFromValue(property.city || ''),
        district: this.getDistrictKeyFromValue(property.district || ''),
        zipCode: property.zipCode || '',
        addressLine: property.addressLine || '',
        latitude: property.latitude,
        longitude: property.longitude,
        hasParking: property.amenity?.hasParking || false,
        hasPool: property.amenity?.hasPool || false,
        hasGym: property.amenity?.hasGym || false,
        hasElevator: property.amenity?.hasElevator || false,
        hasSecurity: property.amenity?.hasSecurity || false,
        hasBalcony: property.amenity?.hasBalcony || false,
        hasGarden: property.amenity?.hasGarden || false,
        hasCentralAC: property.amenity?.hasCentralAC || false,
        furnishingStatus: property.amenity?.furnishingStatus as FurnishingStatus || FurnishingStatus.Unfurnished,
        viewType: property.amenity?.viewType as ViewType,
      };

      this.initialDescriptionHtml = this.form.description || '';

      this.existingImages.set(property.images ?? []);
      this.existingImageUrls.set(
        (property.images ?? [])
          .map(image => image.url.trim())
          .filter(url => url.length > 0)
      );

      if (this.form.latitude && this.form.longitude) {
        this.cdr.detectChanges();
        this.initLeafletMap();
      }
      // NOTE: In edit mode we do NOT pre-fill localImages from local storage.
      // Those are already-uploaded Cloudinary URLs and must NOT be re-uploaded.
      // The user can add genuinely new images (data: URIs) via the file picker.

    } catch {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.LOAD_FAILED'));
    }
  }

  ngAfterViewInit() {
    this.initLeafletMap();
  }

  getCityKeyFromValue(value: string | undefined): string {
    if (!value) return '';
    const key = Object.keys(this.cityMap).find(k => this.cityMap[k] === value);
    if (key) return key;
    // Handle localized values if user input them in current language
    const citiesDict = this.translate.instant('CITIES');
    if (citiesDict && typeof citiesDict === 'object') {
      return Object.keys(citiesDict).find(k => (citiesDict as any)[k] === value) || value;
    }
    return value;
  }

  getDistrictKeyFromValue(value: string | undefined): string {
    if (!value) return '';
    const key = Object.keys(this.districtMap).find(k => this.districtMap[k] === value);
    if (key) return key;
    const districtsDict = this.translate.instant('DISTRICTS');
    if (districtsDict && typeof districtsDict === 'object') {
      return Object.keys(districtsDict).find(k => (districtsDict as any)[k] === value) || value;
    }
    return value;
  }

  getDistrictListId(): string {
    const cityKey = this.getCityKeyFromValue(this.form.city || '');
    if (cityKey === 'Alexandria') return 'districts-alex-form-list';
    if (cityKey === 'Cairo') return 'districts-cairo-form-list';
    return 'districts-form-list';
  }

  getMissingRequiredFieldsInPreviousSteps(): { id: string; labelKey: string; step: number }[] {
    const missing: { id: string; labelKey: string; step: number }[] = [];
    const step = this.currentStep();
    if (step <= 1) return missing;

    if (!this.form.title || this.form.title.trim().length < 3) {
      missing.push({ id: 'title', labelKey: 'PROPERTY_FORM.LABEL_TITLE', step: 1 });
    }
    if (!this.form.price || this.form.price <= 0) {
      missing.push({ id: 'price', labelKey: 'PROPERTY_FORM.LABEL_PRICE', step: 1 });
    }
    if (!this.form.area || this.form.area <= 0) {
      missing.push({ id: 'area', labelKey: 'PROPERTY_FORM.LABEL_AREA', step: 1 });
    }

    if (step > 2) {
      const totalImages = (this.isEdit() ? this.existingImageUrls().length : 0) + this.localImages().length;
      if (totalImages === 0) {
        missing.push({ id: 'images', labelKey: 'PROPERTY_FORM.NOTICE.IMAGE_MISSING', step: 2 });
      }
    }

    return missing;
  }

  // Per-step validity for the Next button + visual indicators
  isStep1Valid(): boolean {
    return !!(this.form.title && this.form.title.trim().length >= 3 && this.form.title.trim().length <= 500) &&
           !!(this.form.price && this.form.price >= 1000 && this.form.price <= 999999999.99) &&
           !!(this.form.area && this.form.area >= 10 && this.form.area <= 100000) &&
           (this.form.bedrooms === undefined || this.form.bedrooms === null || (this.form.bedrooms >= 0 && this.form.bedrooms <= 100)) &&
           (this.form.bathrooms === undefined || this.form.bathrooms === null || (this.form.bathrooms >= 0 && this.form.bathrooms <= 100)) &&
           (this.form.floor === undefined || this.form.floor === null || (this.form.floor >= 0 && this.form.floor <= 999 && (!this.form.totalFloors || this.form.floor <= this.form.totalFloors))) &&
           (this.form.totalFloors === undefined || this.form.totalFloors === null || (this.form.totalFloors >= 1 && this.form.totalFloors <= 999)) &&
           (!this.form.description || this.form.description.length <= 10000);
  }
  isStep2Valid(): boolean {
    const totalImages = (this.isEdit() ? this.existingImageUrls().length : 0) + this.localImages().length;
    return totalImages > 0;
  }
  isStep4Valid(): boolean {
    return !!(this.form.city && this.form.city.trim().length >= 2 && this.form.city.trim().length <= 100) &&
           !!(this.form.district && this.form.district.trim().length >= 2 && this.form.district.trim().length <= 100) &&
           !!(this.form.addressLine && this.form.addressLine.trim().length >= 5 && this.form.addressLine.trim().length <= 500) &&
           (!this.form.zipCode || this.form.zipCode.length <= 20) &&
           (this.form.latitude === undefined || this.form.latitude === null || (this.form.latitude >= -90 && this.form.latitude <= 90)) &&
           (this.form.longitude === undefined || this.form.longitude === null || (this.form.longitude >= -180 && this.form.longitude <= 180));
  }
  isCurrentStepValid(): boolean {
    const step = this.currentStep();
    if (step === 1) return this.isStep1Valid();
    if (step === 2) return true; // step 2: image upload only, not blocking
    if (step === 3) return true; // step 3: amenities all optional
    if (step === 4) return this.isStep4Valid();
    return true;
  }
  isFormValid(): boolean {
    return this.isStep1Valid() && this.isStep4Valid();
  }

  markFieldTouched(field: string) {
    this.touchedFields.update(t => ({ ...t, [field]: true }));
  }
  markAllFieldsTouched() {
    this.touchedFields.set({ title: true, price: true, area: true, city: true, district: true, addressLine: true });
  }
  onNextClick() {
    // When advancing to a new step, mark all fields of the current step as touched
    // so any errors are visible if user comes back.
    this.markAllFieldsTouched();
    this.navigateToStep(this.currentStep() + 1);
  }

  navigateToStep(step: number) {
    this.currentStep.set(step);
    if (step === 4) {
      this.initMapIfReady();
    }
  }

  /** Renders the Leaflet map using already-saved coordinates — zero API calls. */
  private initMapIfReady() {
    if (!this.form.latitude || !this.form.longitude) return;
    // Give Angular time to render the @if block containing #mapContainer
    this.cdr.detectChanges();
    setTimeout(() => this.initLeafletMap(), 50);
  }
  getFieldError(id: string): string | null {
    if (id === 'title') {
      if (!this.form.title || !this.form.title.trim()) return 'required';
      if (this.form.title.trim().length < 3) return 'minLength';
      if (this.form.title.trim().length > 500) return 'maxLength';
      return null;
    }
    if (id === 'price') {
      if (this.form.price === undefined || this.form.price === null) return 'required';
      if (this.form.price < 1000) return 'minPrice';
      if (this.form.price > 999999999.99) return 'maxPrice';
      return null;
    }
    if (id === 'area') {
      if (this.form.area === undefined || this.form.area === null) return 'required';
      if (this.form.area < 10) return 'minArea';
      if (this.form.area > 100000) return 'maxArea';
      return null;
    }
    if (id === 'city') {
      if (!this.form.city || !this.form.city.trim()) return 'required';
      if (this.form.city.trim().length < 2) return 'minLength';
      if (this.form.city.trim().length > 100) return 'maxLength';
      return null;
    }
    if (id === 'district') {
      if (!this.form.district || !this.form.district.trim()) return 'required';
      if (this.form.district.trim().length < 2) return 'minLength';
      if (this.form.district.trim().length > 100) return 'maxLength';
      return null;
    }
    if (id === 'addressLine') {
      if (!this.form.addressLine || !this.form.addressLine.trim()) return 'required';
      if (this.form.addressLine.trim().length < 5) return 'minLength';
      if (this.form.addressLine.trim().length > 500) return 'maxLength';
      return null;
    }
    if (id === 'bedrooms') {
      if (this.form.bedrooms !== undefined && this.form.bedrooms !== null) {
        if (this.form.bedrooms < 0 || this.form.bedrooms > 100) return 'invalid';
      }
      return null;
    }
    if (id === 'bathrooms') {
      if (this.form.bathrooms !== undefined && this.form.bathrooms !== null) {
        if (this.form.bathrooms < 0 || this.form.bathrooms > 100) return 'invalid';
      }
      return null;
    }
    if (id === 'floor') {
      if (this.form.floor !== undefined && this.form.floor !== null) {
        if (this.form.floor < 0 || this.form.floor > 999) return 'invalid';
        if (this.form.totalFloors && this.form.floor > this.form.totalFloors) return 'floorExceedsTotal';
      }
      return null;
    }
    if (id === 'totalFloors') {
      if (this.form.totalFloors !== undefined && this.form.totalFloors !== null) {
        if (this.form.totalFloors < 1 || this.form.totalFloors > 999) return 'invalid';
      }
      return null;
    }
    if (id === 'description') {
      if (this.form.description && this.form.description.length > 10000) return 'maxLength';
      return null;
    }
    if (id === 'zipCode') {
      if (this.form.zipCode && this.form.zipCode.length > 20) return 'maxLength';
      return null;
    }
    if (id === 'latitude') {
      if (this.form.latitude !== undefined && this.form.latitude !== null) {
        if (this.form.latitude < -90 || this.form.latitude > 90) return 'invalid';
      }
      return null;
    }
    if (id === 'longitude') {
      if (this.form.longitude !== undefined && this.form.longitude !== null) {
        if (this.form.longitude < -180 || this.form.longitude > 180) return 'invalid';
      }
      return null;
    }
    return null;
  }
  getFieldClasses(id: string, touched: boolean, error: string | null): string {
    const base = 'w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all';
    if (touched && error) return base + ' !border-red-300 !bg-red-50/30 focus:!border-red-400';
    if (touched && !error) return base + ' !border-emerald-300';
    return base;
  }

  focusMissingField(item: { id: string; step: number }) {
    this.currentStep.set(item.step);
    setTimeout(() => {
      if (item.id === 'images') {
        const fileInput = document.querySelector('input[type="file"]') as HTMLElement | null;
        if (fileInput) {
          fileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (el as HTMLInputElement).focus();
      }
    }, 150);
  }

  async onFileSelected(event: any) {
    const files = event.target.files as FileList;
    if (!files || files.length === 0) return;



    this.loading = true;
    this.toast.info(this.translate.instant('PROPERTY_FORM.MESSAGES.COMPRESSING'));

    const currentImages = [...this.localImages()];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMb = 10;

    try {
      let rejectedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!allowedTypes.includes(file.type)) {
          rejectedCount++;
          this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.INVALID_FILE_TYPE'));
          continue;
        }
        if (file.size > maxSizeMb * 1024 * 1024) {
          rejectedCount++;
          this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.FILE_TOO_LARGE', { max: maxSizeMb }));
          continue;
        }

        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e: any) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        const compressed = await compressImage(dataUrl, 1200, 0.7);
        currentImages.push(compressed);
        this.localImages.set([...currentImages]);
      }
      this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.COMPRESS_SUCCESS'));
      this.triggerDraftSave();
    } catch (err) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.COMPRESS_ERROR'));
    } finally {
      this.loading = false;
    }
  }

  removeLocalImage(index: number) {
    this.localImages.update(images => {
      const next = [...images];
      next.splice(index, 1);
      return next;
    });
    if (this.primaryLocalIndex() >= this.localImages().length) {
      this.primaryLocalIndex.set(Math.max(0, this.localImages().length - 1));
    } else if (this.primaryLocalIndex() === index) {
      this.primaryLocalIndex.set(0);
    } else if (this.primaryLocalIndex() > index) {
      this.primaryLocalIndex.update(i => i - 1);
    }
    this.triggerDraftSave();
  }

  setPrimaryLocalImage(index: number) {
    if (index === this.primaryLocalIndex()) return;
    const images = [...this.localImages()];
    const img = images.splice(index, 1)[0];
    images.unshift(img);
    this.localImages.set(images);
    this.primaryLocalIndex.set(0);
    this.triggerDraftSave();
  }

  async removeExistingImage(image: PropertyImage) {
    if (this.isLastRemainingImage()) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGE_DELETE_FAILED_LAST'));
      return;
    }
    const ok = await this.confirmService.ask({
      title: this.translate.instant('COMMON.CONFIRM_DELETE_TITLE'),
      message: this.translate.instant('PROPERTY_FORM.MESSAGES.DELETE_IMAGE_CONFIRM'),
      confirmText: this.translate.instant('COMMON.DELETE'),
      cancelText: this.translate.instant('COMMON.CANCEL'),
      variant: 'danger',
    });
    if (!ok) return;

    this.trashService.addImage(image.id, image.url, this.propertyId, this.form.title || this.translate.instant('PROPERTY_FORM.UNTITLED'));
    this.existingImages.update(imgs => imgs.filter(x => x.id !== image.id));
    this.existingImageUrls.update(urls => urls.filter(u => u !== image.url));
    this.deletedImageIds.update(ids => [...ids, image.id]);
  }

  async setPrimaryImage(image: PropertyImage) {
    if (image.isPrimary) return;

    // Deep copy to prevent mutating the original objects during rollback
    const previousImages = this.existingImages().map(img => ({ ...img }));
    const previousUrls = [...this.existingImageUrls()];

    // Create a new array of cloned objects for the optimistic update
    const reordered = this.existingImages().map(img => ({ ...img }));
    const idx = reordered.findIndex(img => img.id === image.id);
    if (idx <= 0) return;

    reordered.splice(idx, 1);
    reordered.unshift({ ...image, isPrimary: true });
    reordered.forEach((img, i) => { img.sortOrder = i; img.isPrimary = i === 0; });
    this.existingImages.set(reordered);
    this.existingImageUrls.set(reordered.map(img => img.url));

    try {
      await this.propertyService.setPrimaryImage(this.propertyId, image.id);
      this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.SET_PRIMARY_SUCCESS'));
    } catch (e: any) {
      // Rollback optimistic update
      this.existingImages.set(previousImages);
      this.existingImageUrls.set(previousUrls);

      let translationKey = '';
      if (e?.error?.detail) translationKey = e.error.detail;
      else if (e?.error?.message) translationKey = e.error.message;
      else if (typeof e?.error === 'string') translationKey = e.error;

      let errorMessage = this.translate.instant('PROPERTY_FORM.MESSAGES.SET_PRIMARY_ERROR');
      if (translationKey) {
        if (!translationKey.includes(' ')) {
          const translated = this.translate.instant('VALIDATION.' + translationKey);
          if (translated !== 'VALIDATION.' + translationKey) {
            errorMessage += ' - ' + translated;
          } else {
            errorMessage += ' (' + translationKey + ')';
          }
        } else {
          errorMessage += ' - ' + translationKey;
        }
      }
      this.toast.error(errorMessage);
    }
  }

  private getFormPayload() {
    return {
      title: this.form.title,
      description: this.form.description,
      propertyType: this.form.propertyType,
      listingType: this.form.listingType,
      price: Number(this.form.price || 0),
      area: Number(this.form.area || 0),
      bedrooms: Number(this.form.bedrooms || 0),
      bathrooms: Number(this.form.bathrooms || 0),
      floor: this.form.floor != null && String(this.form.floor).trim() !== '' ? Number(this.form.floor) : null,
      totalFloors: this.form.totalFloors != null && String(this.form.totalFloors).trim() !== '' ? Number(this.form.totalFloors) : null,
      addressLine: this.form.addressLine,
      city: this.cityMap[this.getCityKeyFromValue(this.form.city || '')] || this.form.city,
      district: this.districtMap[this.getDistrictKeyFromValue(this.form.district || '')] || this.form.district,
      zipCode: this.form.zipCode,
      latitude: this.form.latitude,
      longitude: this.form.longitude,
      hasParking: !!this.form.hasParking,
      hasPool: !!this.form.hasPool,
      hasGym: !!this.form.hasGym,
      hasElevator: !!this.form.hasElevator,
      hasSecurity: !!this.form.hasSecurity,
      hasBalcony: !!this.form.hasBalcony,
      hasGarden: !!this.form.hasGarden,
      hasCentralAC: !!this.form.hasCentralAC,
      furnishingStatus: this.form.furnishingStatus,
      viewType: this.form.viewType
    };
  }

  isLastRemainingImage(): boolean {
    return false;
  }

  isValidImageUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private async handleImageDelete(propertyId: string, imageId: string) {
    try {
      await this.propertyService.deleteImage(propertyId, imageId);
    } catch (e: any) {
      const status = e?.status;
      if (status === 409) {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGE_DELETE_FAILED_LAST'));
        throw e;
      } else if (status === 403) {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGE_DELETE_FORBIDDEN'));
        throw e;
      } else if (status === 404) {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGE_DELETE_NOT_FOUND'));
        return;
      }
      throw e;
    }
  }

  private async handleImageAdd(propertyId: string, urls: string[]) {
    try {
      await this.propertyService.addImages(propertyId, urls);
    } catch (e: any) {
      const status = e?.status;
      if (status === 400) {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGE_ADD_INVALID'));
      } else if (status === 403) {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGE_DELETE_FORBIDDEN'));
      } else if (status === 404) {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGE_ADD_NOT_FOUND'));
      }
      throw e;
    }
  }

  async submit() {
    this.validationErrors = {};

    const scrollToError = (id: string, step: number) => {
      this.validationErrors[id] = true;
      this.currentStep.set(step);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 150);
    };

    if (!this.form.title || this.form.title.length < 3) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.TITLE_REQUIRED'));
      scrollToError('title', 1);
      return;
    }
    if (this.form.title.length > 500) {
      this.toast.error(this.translate.instant('VALIDATION.Property_TitleTooLong'));
      scrollToError('title', 1);
      return;
    }
    if (this.form.price === undefined || this.form.price === null || this.form.price < 1000) {
      this.toast.error(this.translate.instant('VALIDATION.Property_PriceTooLow'));
      scrollToError('price', 1);
      return;
    }
    if (this.form.price > 999999999.99) {
      this.toast.error(this.translate.instant('VALIDATION.Property_PriceTooHigh'));
      scrollToError('price', 1);
      return;
    }
    if (this.form.area === undefined || this.form.area === null || this.form.area < 10) {
      this.toast.error(this.translate.instant('VALIDATION.Property_AreaTooSmall'));
      scrollToError('area', 1);
      return;
    }
    if (this.form.area > 100000) {
      this.toast.error(this.translate.instant('VALIDATION.Property_AreaTooLarge'));
      scrollToError('area', 1);
      return;
    }
    if (this.form.bedrooms !== undefined && this.form.bedrooms !== null && (this.form.bedrooms < 0 || this.form.bedrooms > 100)) {
      this.toast.error(this.translate.instant('VALIDATION.Property_BedroomsTooMany'));
      scrollToError('bedrooms', 1);
      return;
    }
    if (this.form.bathrooms !== undefined && this.form.bathrooms !== null && (this.form.bathrooms < 0 || this.form.bathrooms > 100)) {
      this.toast.error(this.translate.instant('VALIDATION.Property_BathroomsTooMany'));
      scrollToError('bathrooms', 1);
      return;
    }
    if (this.form.floor !== undefined && this.form.floor !== null && (this.form.floor < 0 || this.form.floor > 999)) {
      this.toast.error(this.translate.instant('VALIDATION.Property_FloorTooHigh'));
      scrollToError('floor', 1);
      return;
    }
    if (this.form.totalFloors !== undefined && this.form.totalFloors !== null && (this.form.totalFloors < 1 || this.form.totalFloors > 999)) {
      this.toast.error(this.translate.instant('VALIDATION.Property_TotalFloorsTooHigh'));
      scrollToError('totalFloors', 1);
      return;
    }
    if (this.form.floor !== undefined && this.form.floor !== null && this.form.totalFloors !== undefined && this.form.totalFloors !== null && this.form.totalFloors > 0 && this.form.floor > this.form.totalFloors) {
      this.toast.error(this.translate.instant('VALIDATION.Property_FloorExceedsTotal'));
      scrollToError('floor', 1);
      return;
    }
    if (this.form.description && this.form.description.length > 10000) {
      this.toast.error(this.translate.instant('VALIDATION.Property_DescriptionTooLong'));
      scrollToError('description', 1);
      return;
    }
    if (!this.form.city || this.form.city.length < 2) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.CITY_REQUIRED'));
      scrollToError('city', 4);
      return;
    }
    if (this.form.city.length > 100) {
      this.toast.error(this.translate.instant('VALIDATION.Property_CityTooLong'));
      scrollToError('city', 4);
      return;
    }
    if (!this.form.district || this.form.district.length < 2) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.DISTRICT_REQUIRED'));
      scrollToError('district', 4);
      return;
    }
    if (this.form.district.length > 100) {
      this.toast.error(this.translate.instant('VALIDATION.Property_DistrictTooLong'));
      scrollToError('district', 4);
      return;
    }
    if (!this.form.addressLine || this.form.addressLine.length < 5) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.ADDRESS_REQUIRED'));
      scrollToError('addressLine', 4);
      return;
    }
    if (this.form.addressLine.length > 500) {
      this.toast.error(this.translate.instant('VALIDATION.Property_AddressLineTooLong'));
      scrollToError('addressLine', 4);
      return;
    }
    if (this.form.zipCode && this.form.zipCode.length > 20) {
      this.toast.error(this.translate.instant('VALIDATION.Property_ZipCodeTooLong'));
      scrollToError('zipCode', 4);
      return;
    }
    if (this.form.latitude !== undefined && this.form.latitude !== null && (this.form.latitude < -90 || this.form.latitude > 90)) {
      this.toast.error(this.translate.instant('VALIDATION.Property_LatitudeOutOfRange'));
      scrollToError('latitude', 4);
      return;
    }
    if (this.form.longitude !== undefined && this.form.longitude !== null && (this.form.longitude < -180 || this.form.longitude > 180)) {
      this.toast.error(this.translate.instant('VALIDATION.Property_LongitudeOutOfRange'));
      scrollToError('longitude', 4);
      return;
    }

    const rawManualUrls = this.imageUrlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const validManualUrls: string[] = [];
    for (const url of rawManualUrls) {
      if (url.length > 1000) {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.URL_TOO_LONG'));
        continue;
      }
      if (!this.isValidImageUrl(url)) {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.INVALID_IMAGE_URL'));
        continue;
      }
      validManualUrls.push(url);
    }
    const manualImageUrls = Array.from(new Set(validManualUrls));

    const totalImages = (this.isEdit() ? this.existingImageUrls().length : 0) + 
                        this.localImages().length + 
                        manualImageUrls.length;

    if (totalImages === 0) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGE_REQUIRED'));
      this.currentStep.set(2);
      return;
    }

    this.loading = true;

    try {
      let resultId = this.propertyId;
      let cloudinaryUrls: string[] = [];

      // Only upload genuinely new images that are data: URIs (user added in this session).
      // Cloudinary URLs that may still be in localImages from a previous session must be skipped.
      const newLocalImages = this.localImages().filter(img => img.startsWith('data:'));
      if (newLocalImages.length > 0) {
        this.currentStep.set(2); // Move back to media step to show the upload progress list clearly!
        
        const progressItems = newLocalImages.map((img, i) => ({
          id: `img_${i}`,
          preview: img,
          index: i + 1,
          progress: 0,
          status: 'uploading' as const
        }));
        this.uploadProgressList.set(progressItems);

        const uploadPromises = newLocalImages.map(async (img, i) => {
          const interval = setInterval(() => {
            this.uploadProgressList.update(list => {
              const item = list.find(x => x.id === `img_${i}`);
              if (item && item.progress < 90) {
                item.progress += Math.floor(Math.random() * 15) + 5;
                if (item.progress > 90) item.progress = 90;
              }
              return [...list];
            });
          }, 150);

          try {
            const url = await firstValueFrom(this.cloudinary.uploadImage(img));
            clearInterval(interval);
            this.uploadProgressList.update(list => {
              const item = list.find(x => x.id === `img_${i}`);
              if (item) {
                item.progress = 100;
                item.status = 'success';
              }
              return [...list];
            });
            return url;
          } catch (err) {
            clearInterval(interval);
            this.uploadProgressList.update(list => {
              const item = list.find(x => x.id === `img_${i}`);
              if (item) {
                item.progress = 100;
                item.status = 'error';
              }
              return [...list];
            });
            console.error('Image upload failed:', err);
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);
        cloudinaryUrls = results.filter((url): url is string => !!url);
        
        // Brief delay so agent can enjoy the gorgeous completion state
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.uploadProgressList.set([]); // Reset upload panel
        
        this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.UPLOAD_SUCCESS', { count: cloudinaryUrls.length }));
      }

      const allImageUrls = [
        ...(this.isEdit() ? this.existingImageUrls() : []),
        ...cloudinaryUrls,
        ...manualImageUrls
      ];

      const basePayload = {
        title: this.form.title,
        description: this.form.description,
        propertyType: this.form.propertyType,
        listingType: this.form.listingType,
        price: Number(this.form.price || 0),
        area: Number(this.form.area || 0),
        bedrooms: Number(this.form.bedrooms || 0),
        bathrooms: Number(this.form.bathrooms || 0),
        floor: this.form.floor != null && String(this.form.floor).trim() !== '' ? Number(this.form.floor) : null,
        totalFloors: this.form.totalFloors != null && String(this.form.totalFloors).trim() !== '' ? Number(this.form.totalFloors) : null,
        addressLine: this.form.addressLine,
        city: this.cityMap[this.getCityKeyFromValue(this.form.city || '')] || this.form.city,
        district: this.districtMap[this.getDistrictKeyFromValue(this.form.district || '')] || this.form.district,
        zipCode: this.form.zipCode,
        latitude: this.form.latitude,
        longitude: this.form.longitude,
        hasParking: !!this.form.hasParking,
        hasPool: !!this.form.hasPool,
        hasGym: !!this.form.hasGym,
        hasElevator: !!this.form.hasElevator,
        hasSecurity: !!this.form.hasSecurity,
        hasBalcony: !!this.form.hasBalcony,
        hasGarden: !!this.form.hasGarden,
        hasCentralAC: !!this.form.hasCentralAC,
        furnishingStatus: this.form.furnishingStatus,
        viewType: this.form.viewType
      };

      if (this.isEdit()) {
        const payload = { ...basePayload, isFeatured: false };
        await this.propertyService.update(this.propertyId, payload as any);
        this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.UPDATE_SUCCESS'));

        const imageOps: Promise<unknown>[] = [];
        if (cloudinaryUrls.length > 0) {
          imageOps.push(this.handleImageAdd(this.propertyId, cloudinaryUrls));
        }
        for (const imgId of this.deletedImageIds()) {
          imageOps.push(this.handleImageDelete(this.propertyId, imgId));
        }
        if (imageOps.length > 0) {
          const results = await Promise.allSettled(imageOps);
          const failed = results.filter(r => r.status === 'rejected');
          if (failed.length > 0) {
            console.warn(`${failed.length} image operation(s) failed during edit save.`, failed);
            this.toast.warning(this.translate.instant('PROPERTY_FORM.MESSAGES.IMAGES_SYNC_PARTIAL'));
          }
        }
      } else {
        const payload = { ...basePayload, imageUrls: allImageUrls };
        const r = await this.propertyService.create(payload as any);
        resultId = r.id;
        this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.CREATE_SUCCESS'));
      }

      if (cloudinaryUrls.length > 0) {
        await this.localImageService.saveImages(resultId, cloudinaryUrls);
      }

      this.clearDraft(); // Clear autosaved draft on successful submit!
      this.router.navigate(['/properties', resultId]);
    } catch (e: any) { 
      console.error('Submission failed details:', e);
      let translationKey = '';
      if (e?.error?.detail) {
        translationKey = e.error.detail;
      } else if (e?.error?.errors) {
        const firstErrorKey = Object.keys(e.error.errors)[0];
        const firstErrorMessages = e.error.errors[firstErrorKey];
        translationKey = Array.isArray(firstErrorMessages) ? firstErrorMessages[0] : firstErrorMessages;
      } else if (e?.error?.code) {
        translationKey = e.error.code;
      } else if (e?.error?.title) {
        translationKey = e.error.title;
      } else if (e?.error?.message) {
        translationKey = e.error.message;
      } else if (typeof e?.error === 'string') {
        translationKey = e.error;
      }

      let errorMessage = '';
      if (translationKey) {
        // Try to translate it if it looks like a code or simple key (e.g., 'Property_TitleTooLong')
        const isValidKey = /^[A-Za-z0-9_.]+$/.test(translationKey);
        if (isValidKey) {
          const translated = this.translate.instant('VALIDATION.' + translationKey);
          if (translated !== 'VALIDATION.' + translationKey) {
            errorMessage = translated;
          }
        }
        
        // If we didn't get a translation, and it contains spaces (a descriptive sentence), show it directly
        if (!errorMessage && translationKey.includes(' ')) {
          errorMessage = translationKey;
        }

        // Fallback: show the generic error with the code/key appended so the user/developer knows why
        if (!errorMessage) {
          errorMessage = this.translate.instant('PROPERTY_FORM.MESSAGES.SAVE_ERROR') + ' (' + translationKey + ')';
        }
      } else {
        errorMessage = this.translate.instant('PROPERTY_FORM.MESSAGES.SAVE_ERROR');
      }

      this.toast.error(errorMessage); 
    } finally { 
      this.loading = false; 
    }
  }

  onCoordinatesChange() {
    const lat = this.form.latitude;
    const lng = this.form.longitude;
    if (lat == null || lng == null) return;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    if (isNaN(lat) || isNaN(lng)) return;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    if (this._isReverseGeocoding) return;

    this.initLeafletMap();
    clearTimeout(this.geocodeTimeout);
    this.geocodeTimeout = setTimeout(() => this.reverseGeocode(lat, lng), 600);
  }

  onCoordinatesBlur() {
    const lat = this.form.latitude;
    const lng = this.form.longitude;
    if (lat == null || lng == null) return;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    if (isNaN(lat) || isNaN(lng)) return;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

    this.initLeafletMap();
    clearTimeout(this.geocodeTimeout);
    this.reverseGeocode(lat, lng);
  }

  private async reverseGeocode(lat: number, lng: number) {
    if (this._isReverseGeocoding) return;
    this._isReverseGeocoding = true;
    try {
      const lang = this.translate.currentLang || 'ar';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=${lang}`,
        { headers: { 'User-Agent': 'BaytologyApp/1.0 (property form reverse geocode)' } }
      );
      const data = await response.json();
      if (data && data.address) {
        this.fillAddressFromGeocode(data.address);
        this.cdr.detectChanges();
        this.triggerDraftSave();
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    } finally {
      this._isReverseGeocoding = false;
    }
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_NOT_SUPPORTED'));
      return;
    }

    this.locating = true;
    this._isReverseGeocoding = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(7));
        const lon = parseFloat(position.coords.longitude.toFixed(7));
        this.form.latitude = lat;
        this.form.longitude = lon;

        // Try to reverse geocode and fill city, district, address, zip
        try {
          const lang = this.translate.currentLang || 'ar';
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=${lang}`,
            { headers: { 'User-Agent': 'BaytologyApp/1.0 (property form get current location)' } }
          );
          const data = await response.json();
          if (data && data.address) {
            this.fillAddressFromGeocode(data.address);
          }
        } catch (geocodeErr) {
          console.error('Reverse geocoding failed:', geocodeErr);
        }

        this.locating = false;
        this._isReverseGeocoding = false;
        this.initLeafletMap();
        this.triggerDraftSave();
        this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_SUCCESS'));
        this.cdr.detectChanges();
      },
      (error) => {
        this.locating = false;
        this._isReverseGeocoding = false;
        this.cdr.detectChanges();
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_DENIED'));
            break;
          case error.POSITION_UNAVAILABLE:
            this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_UNAVAILABLE'));
            break;
          case error.TIMEOUT:
            this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_TIMEOUT'));
            break;
          default:
            this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_ERROR'));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  // --- Leaflet Interactive Map ---
  private _createPinIcon() {
    return L.divIcon({
      className: '',
      html: `<div style="
        width: 28px; height: 28px; position: relative;
        display: flex; align-items: flex-start; justify-content: center;
      ">
        <div style="
          width: 24px; height: 24px; background: #0a8f96; border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg); border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute; top: 6px; left: 50%; transform: translateX(-50%) rotate(45deg);
          width: 6px; height: 6px; background: white; border-radius: 50%;
        "></div>
      </div>`,
      iconSize: [28, 34],
      iconAnchor: [14, 30],
      popupAnchor: [0, -30]
    });
  }

  scheduleCloseResults() {
    window.setTimeout(() => this.showSearchResults.set(false), 200);
  }

  private initLeafletMap(retries = 5) {
    const lat = this.form.latitude;
    const lng = this.form.longitude;
    if (!lat || !lng) return;
    window.setTimeout(() => {
      try {
        const container = this.mapContainer?.nativeElement;
        if (!container) {
          if (retries > 0) {
            window.setTimeout(() => this.initLeafletMap(retries - 1), 100);
          }
          return;
        }
        if (this._leafletMap) {
          this._leafletMarker!.setLatLng([lat, lng]);
          this._leafletMap.setView([lat, lng], 17);
          window.setTimeout(() => this._leafletMap!.invalidateSize(), 100);
          return;
        }
        this._leafletMap = L.map(container, {
          center: [lat, lng],
          zoom: 17,
          zoomControl: false
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this._leafletMap);
        this._leafletMarker = L.marker([lat, lng], { icon: this._createPinIcon(), draggable: true }).addTo(this._leafletMap);
        this._leafletMarker.on('dragend', () => {
          const pos = this._leafletMarker!.getLatLng();
          this.form.latitude = parseFloat(pos.lat.toFixed(7));
          this.form.longitude = parseFloat(pos.lng.toFixed(7));
          this.reverseGeocode(this.form.latitude, this.form.longitude);
          this.cdr.detectChanges();
        });
        window.setTimeout(() => this._leafletMap!.invalidateSize(), 100);
      } catch (err) {
        console.error('Leaflet map init failed:', err);
      }
    }, 0);
  }

  openInGoogleMaps() {
    if (!this.form.latitude || !this.form.longitude) return;
    const url = `https://www.google.com/maps?q=${this.form.latitude},${this.form.longitude}`;
    window.open(url, '_blank');
  }

  resetMapLocation() {
    this.form.latitude = undefined as unknown as number;
    this.form.longitude = undefined as unknown as number;
    if (this._leafletMap) {
      this._leafletMap.remove();
      this._leafletMap = null;
      this._leafletMarker = null;
    }
    this.cdr.detectChanges();
  }

  // --- 4. Custom Rich Text WYSIWYG Editor Methods ---
  execEditorCommand(command: string) {
    document.execCommand(command, false, '');
  }

  stripHtml(html: string): string {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch {
      return html.replace(/<[^>]*>/g, '');
    }
  }

  onEditorInput(html: string) {
    this.form.description = this.stripHtml(html);
    this.triggerDraftSave();
  }

  // --- 3. Smart Nominatim OpenStreetMap Geocoding ---
  onGeoSearchInput(query: string) {
    clearTimeout(this.searchDebounce);
    if (!query || query.trim().length < 2) {
      this.searchResults.set([]);
      this.showSearchResults.set(false);
      return;
    }
    this.searchDebounce = setTimeout(async () => {
      try {
        const lang = this.translate.currentLang || 'ar';
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=${lang}`,
          { headers: { 'User-Agent': 'BaytologyApp/1.0 (property form autocomplete)' } }
        );
        const data = await response.json();
        this.searchResults.set(data && data.length > 0 ? data : []);
        this.showSearchResults.set(data && data.length > 0);
        this.selectedSearchIndex.set(-1);
        this.cdr.detectChanges();
      } catch (err) {
        console.error('Autocomplete search failed:', err);
      }
    }, 400);
  }

  selectSearchResult(result: any) {
    this.showSearchResults.set(false);
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    this.form.latitude = parseFloat(lat.toFixed(7));
    this.form.longitude = parseFloat(lon.toFixed(7));
    if (result.address) {
      this.fillAddressFromGeocode(result.address);
    }
    this.triggerDraftSave();
    this.initLeafletMap();
    this.cdr.detectChanges();
  }

  async searchLocation(query: string) {
    if (!query || query.trim().length < 3) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_MIN_LENGTH'));
      return;
    }

    this.showSearchResults.set(false);
    this.locating = true;
    this._isReverseGeocoding = true;
    try {
      const lang = this.translate.currentLang || 'ar';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=${lang}`,
        { headers: { 'User-Agent': 'BaytologyApp/1.0 (property form search)' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        this.searchResults.set(data);
        if (data.length === 1) {
          this.selectSearchResult(data[0]);
        } else {
          this.showSearchResults.set(true);
          this.toast.info(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_MULTIPLE_RESULTS'));
        }
      } else {
        this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_NOT_FOUND'));
      }
    } catch (err) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_SERVICE_ERROR'));
      console.error(err);
    } finally {
      this.locating = false;
      this._isReverseGeocoding = false;
    }
  }

  private fillAddressFromGeocode(address: any) {
    if (!address) return;

    const lang = this.translate.currentLang || 'ar';

    // 1. City extraction and matching (improved with Arabic aliases)
    const rawCity = address.city || address.town || address.village || address.governorate || address.state || address.county || '';
    let matchedCityKey = '';

    // Arabic aliases for common cities (more flexible matching)
    const cityAliases: Record<string, string[]> = {
      'Cairo': ['القاهرة', 'cairo', 'qahira', 'qāhirah'],
      'Alexandria': ['الإسكندرية', 'alexandria', 'iskandaria', 'اسكندرية', 'alex'],
      'Giza': ['الجيزة', 'giza', 'gīzah'],
      'Mansoura': ['المنصورة', 'mansoura', 'mansura', 'el-mansoura'],
      'Tanta': ['طنطا', 'tanta', 'tanda'],
      'Mahalla': ['المحلة', 'المحلة الكبرى', 'mahalla', 'el-mahalla', 'mahalla el-kubra'],
      'PortSaid': ['بورسعيد', 'بور سعيد', 'port said', 'port-said'],
      'Suez': ['السويس', 'suez', 'el-suez'],
      'Ismailia': ['الإسماعيلية', 'ismailia', 'el-ismailia'],
      'Fayoum': ['الفيوم', 'fayoum', 'fayum'],
      'Zagazig': ['الزقازيق', 'zagazig', 'el-zagazig'],
      'Aswan': ['أسوان', 'aswan'],
      'Luxor': ['الأقصر', 'luxor', 'el-quesna', 'el-uxor'],
      'Damietta': ['دمياط', 'damietta', 'dumyat'],
      'Damanhour': ['دمنهور', 'damanhour'],
      'Minya': ['المنيا', 'minya', 'el-minya'],
      'BeniSuef': ['بني سويف', 'bani suef', 'beni suef'],
      'Qena': ['قنا', 'qena', 'qina'],
      'Sohag': ['سوهاج', 'sohag', 'suhaj'],
      'Asyut': ['أسيوط', 'asyut', 'assiut'],
      'Hurghada': ['الغردقة', 'hurghada', 'el-gharqada', 'ghardaqa'],
      'SharmElSheikh': ['شرم الشيخ', 'sharm el sheikh', 'sharm'],
      'MarsaMatrouh': ['مرسى مطروح', 'marsa matrouh', 'matrouh', 'mersa matruh'],
      'October': ['6 أكتوبر', '6 october', 'sixth of october', 'sadsat oktober'],
      'Zayed': ['الشيخ زايد', 'sheikh zayed', 'shiekh zayed', 'zayed']
    };

    if (rawCity) {
      const cleanCity = rawCity.toLowerCase().replace('governorate', '').replace('محافظة', '').trim();

      // Check against cityMap keys
      const foundKey = Object.keys(this.cityMap).find(key => {
        const engMatch = key.toLowerCase() === cleanCity;
        const arMatch = this.cityMap[key].toLowerCase() === cleanCity ||
                        cleanCity.includes(this.cityMap[key].toLowerCase()) ||
                        this.cityMap[key].toLowerCase().includes(cleanCity);
        return engMatch || arMatch;
      });

      if (foundKey) {
        matchedCityKey = foundKey;
        const translated = this.translate.instant('CITIES.' + foundKey);
        this.form.city = translated !== ('CITIES.' + foundKey) ? translated : (lang === 'ar' ? this.cityMap[foundKey] : foundKey);
      } else {
        // Check aliases
        const aliasKey = Object.keys(cityAliases).find(key =>
          cityAliases[key].some(alias => cleanCity.includes(alias.toLowerCase()) || alias.toLowerCase().includes(cleanCity))
        );
        if (aliasKey) {
          matchedCityKey = aliasKey;
          const translated = this.translate.instant('CITIES.' + aliasKey);
          this.form.city = translated !== ('CITIES.' + aliasKey) ? translated : (lang === 'ar' ? this.cityMap[aliasKey] : aliasKey);
        } else {
          this.form.city = rawCity;
        }
      }
    }

    // 2. District extraction and matching (improved)
    const rawDistrict = address.suburb || address.neighbourhood || address.city_district || address.quarter || address.state_district || address.county || '';
    if (rawDistrict) {
      const cleanDistrict = rawDistrict.toLowerCase().trim();
      const foundKey = Object.keys(this.districtMap).find(key => {
        const engMatch = key.toLowerCase() === cleanDistrict;
        const arMatch = this.districtMap[key].toLowerCase() === cleanDistrict ||
                        cleanDistrict.includes(this.districtMap[key].toLowerCase()) ||
                        this.districtMap[key].toLowerCase().includes(cleanDistrict);
        return engMatch || arMatch;
      });

      if (foundKey) {
        const translated = this.translate.instant('DISTRICTS.' + foundKey);
        this.form.district = translated !== ('DISTRICTS.' + foundKey) ? translated : (lang === 'ar' ? this.districtMap[foundKey] : foundKey);
      } else {
        this.form.district = rawDistrict;
      }
    } else if (matchedCityKey === 'Zayed') {
      this.form.district = this.translate.instant('DISTRICTS.Zayed') || 'الشيخ زايد';
    } else if (matchedCityKey === 'October') {
      this.form.district = this.translate.instant('DISTRICTS.October') || '6 أكتوبر';
    } else {
      this.form.district = '';
    }

    // 3. Zip Code
    this.form.zipCode = address.postcode || '';

    // 4. Detailed Address (richer with building, house_number, amenity)
    const parts = [];
    if (address.house_number) parts.push(address.house_number);
    if (address.amenity || address.building) parts.push(address.amenity || address.building);
    if (address.road) parts.push(address.road);
    if (rawDistrict && rawDistrict !== rawCity) parts.push(rawDistrict);
    if (rawCity) parts.push(rawCity);
    
    this.form.addressLine = parts.length > 0 ? parts.join(', ') : rawCity;
  }

  // --- 1. Draft Autosave State Management (localStorage) ---
  private readonly draftKey = 'baytology_property_form_draft';

  checkDraftAvailability() {
    try {
      const draft = localStorage.getItem(this.draftKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        const f = parsed.form;
        const hasContent = f && (
          (f.title && f.title.trim().length > 0) ||
          (f.description && f.description.trim().length > 0) ||
          (f.price && Number(f.price) > 0) ||
          (f.area && Number(f.area) > 0) ||
          (parsed.localImages && parsed.localImages.length > 0) ||
          (parsed.imageUrlsText && parsed.imageUrlsText.trim().length > 0)
        );
        if (hasContent) {
          this.hasDraftAvailable.set(true);
        } else {
          // If the draft is completely blank, clean it up silently
          this.clearDraft();
        }
      }
    } catch (e) {
      console.error('Failed to read draft from localStorage', e);
    }
  }

  triggerDraftSave() {
    if (this.isEdit()) return; // Don't overwrite existing property with drafts
    if (this.hasDraftAvailable()) return; // Prevent overwriting a pending draft!

    try {
      const draftData = {
        form: this.form,
        localImages: this.localImages(),
        imageUrlsText: this.imageUrlsText
      };
      localStorage.setItem(this.draftKey, JSON.stringify(draftData));
    } catch (e) {
      console.error('Failed to autosave draft', e);
    }
  }

  restoreDraft() {
    try {
      const draft = localStorage.getItem(this.draftKey);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.form) this.form = { ...this.form, ...parsed.form };
        if (parsed.localImages) this.localImages.set(parsed.localImages);
        if (parsed.imageUrlsText) this.imageUrlsText = parsed.imageUrlsText;
        
        this.initialDescriptionHtml = this.form.description || '';
        this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.DRAFT_RESTORED'));

        // Render the map using saved coordinates — no API calls needed,
        // the draft already has city/district/address from when it was first entered.
        this.initMapIfReady();
      }
    } catch (e) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.DRAFT_RESTORE_FAILED'));
      console.error(e);
    } finally {
      this.hasDraftAvailable.set(false);
    }
  }

  discardDraft() {
    this.clearDraft();
    this.hasDraftAvailable.set(false);
    this.toast.info(this.translate.instant('PROPERTY_FORM.MESSAGES.DRAFT_DISCARDED'));
  }

  clearDraft() {
    try {
      localStorage.removeItem(this.draftKey);
    } catch (e) {
      console.error('Failed to clear draft', e);
    }
  }
}
