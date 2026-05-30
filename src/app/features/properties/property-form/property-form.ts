import { Component, OnInit, signal, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PropertyService } from '../services/property.service';
import { CreatePropertyRequest, FurnishingStatus, ListingType, PropertyType, ViewType } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { LocalImageService } from '../../../core/services/local-image.service';
import { UploadManagerService } from '../../../core/services/upload-manager.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
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
                <div class="flex flex-col items-center cursor-pointer" (click)="currentStep.set(step)">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mb-2 transition-colors"
                         [class]="currentStep() >= step ? 'bg-[#0a8f96] text-white' : 'bg-gray-200 text-gray-500'">{{step}}</div>
                    <span class="text-xs font-bold" [class]="currentStep() >= step ? 'text-gray-900' : 'text-gray-400'">
                        {{ step === 1 ? 'التفاصيل' : step === 2 ? 'الصور' : step === 3 ? 'المرافق' : 'الموقع' }}
                    </span>
                </div>
                @if (step < 4) {
                    <div class="w-16 h-px" [class]="currentStep() > step ? 'bg-[#0a8f96]' : 'bg-gray-300'"></div>
                }
            }
        </div>

        <form (ngSubmit)="submit()" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- Main Content (Right) -->
          <div class=" space-y-8 ">
            
            <!-- Basic Details -->
            <div [class.hidden]="currentStep() !== 1" class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 relative mx-auto">
                
                <!-- Draft Restore Alert -->
                @if (hasDraftAvailable() && !isEdit()) {
                  <div class="mb-8 p-5 bg-[#0a8f96]/5 border border-[#0a8f96]/10 rounded-2xl flex items-center justify-between gap-4 animate-pulse select-none mx-auto" dir="rtl">
                    <div class="flex items-center gap-3">
                      <span class="text-xl">💾</span>
                      <div class="text-right">
                        <h4 class="text-xs font-black text-slate-800 leading-none mb-1">مسودة محفوظة تلقائياً</h4>
                        <p class="text-[9px] text-slate-400 font-bold">تم العثور على تعديلات غير محفوظة من جلسة سابقة.</p>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" (click)="restoreDraft()" class="bg-[#0a8f96] hover:bg-[#076b70] text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95">استعادة</button>
                      <button type="button" (click)="discardDraft()" class="text-slate-400 hover:text-red-500 px-2 py-1.5 text-[10px] font-bold transition-all">تجاهل</button>
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
                           (ngModelChange)="triggerDraftSave()"
                           [class.border-red-500]="validationErrors['title']"
                           [placeholder]="'PROPERTY_FORM.PLACEHOLDER_TITLE' | translate"
                           class="w-full bg-white border border-gray-100 rounded-[28px] px-8 py-5 text-gray-900 placeholder:text-gray-300 focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold text-lg shadow-sm">
                  </div>

                  <!-- WYSIWYG Rich Text Editor -->
                  <div class="space-y-3">
                    <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_DESC' | translate }} <span class="text-red-500">*</span></label>
                    <div class="border border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white">
                      <!-- Toolbar -->
                     <!-- <div class="bg-slate-50/50 border-b border-gray-100 px-4 py-2 flex items-center gap-2 flex-wrap">
                        <button type="button" (click)="execEditorCommand('bold')" class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer" title="عريض (Bold)">
                          B
                        </button>
                        <button type="button" (click)="execEditorCommand('italic')" class="w-8 h-8 rounded-lg flex items-center justify-center italic font-bold text-sm text-slate-700 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer" title="مائل (Italic)">
                          I
                        </button>
                        <div class="w-px h-6 bg-slate-200"></div>
                        <button type="button" (click)="execEditorCommand('insertUnorderedList')" class="px-3 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer" title="قائمة نقطية (Bullet List)">
                          • قائمة نقطية
                        </button>
                        <button type="button" (click)="execEditorCommand('insertOrderedList')" class="px-3 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer" title="قائمة رقمية (Numbered List)">
                          1. قائمة رقمية
                        </button>
                        <div class="w-px h-6 bg-slate-200"></div>
                        <button type="button" (click)="execEditorCommand('removeFormat')" class="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 active:scale-95 transition-all cursor-pointer" title="مسح التنسيق">
                          x
                        </button>
                      </div> -->
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
                      <select [(ngModel)]="form.propertyType" name="type" class="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all appearance-none cursor-pointer">
                        <option [ngValue]="'Apartment'">{{ 'PROPERTY.TYPES.Apartment' | translate }}</option>
                        <option [ngValue]="'Villa'">{{ 'PROPERTY.TYPES.Villa' | translate }}</option>
                        <option [ngValue]="'Office'">{{ 'PROPERTY.TYPES.Office' | translate }}</option>
                        <option [ngValue]="'Land'">{{ 'PROPERTY.TYPES.Land' | translate }}</option>
                      </select>
                    </div>
                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-3 tracking-wide">{{ 'PROPERTY_FORM.LABEL_LISTING_TYPE' | translate }} <span class="text-red-500">*</span></label>
                      <select [(ngModel)]="form.listingType" name="listing" class="w-full bg-gray-50 border border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all appearance-none cursor-pointer">
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
                               [class.border-red-500]="validationErrors['price']"
                               class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner placeholder:text-gray-300"
                               placeholder="مثال: 2500000" min="1">
                        <span class="absolute ltr:right-6 rtl:left-6 text-xs font-extrabold text-[#0a8f96] pointer-events-none">ج.م</span>
                      </div>
                    </div>

                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">
                        {{ 'PROPERTY_FORM.LABEL_AREA' | translate }} <span class="text-red-500">*</span>
                      </label>
                      <div class="relative flex items-center">
                        <input type="number" [(ngModel)]="form.area" name="area" id="area"
                               [class.border-red-500]="validationErrors['area']"
                               class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner placeholder:text-gray-300"
                               placeholder="مثال: 150" min="1">
                        <span class="absolute ltr:right-6 rtl:left-6 text-xs font-extrabold text-[#0a8f96] pointer-events-none">م²</span>
                      </div>
                    </div>
                  </div>

                  <!-- Bedrooms, Bathrooms, Floor & Total Floors Row -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">الغرف <span class="text-red-500">*</span></label>
                      <input type="number" [(ngModel)]="form.bedrooms" name="bedrooms" id="bedrooms" min="0" placeholder="مثال: 3"
                             class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner text-center">
                    </div>

                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">الحمامات <span class="text-red-500">*</span></label>
                      <input type="number" [(ngModel)]="form.bathrooms" name="bathrooms" id="bathrooms" min="0" placeholder="مثال: 2"
                             class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner text-center">
                    </div>

                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">الطابق</label>
                      <input type="number" [(ngModel)]="form.floor" name="floor" id="floor" min="0" placeholder="مثال: 3"
                             class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner text-center">
                    </div>

                    <div class="space-y-3">
                      <label class="block text-xs font-black text-gray-800 mb-1 px-1">إجمالي الطوابق</label>
                      <input type="number" [(ngModel)]="form.totalFloors" name="totalFloors" id="totalFloors" min="0" placeholder="مثال: 10"
                             class="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner text-center">
                    </div>
                  </div>
                </div>
              </div>

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
                        <span>📤 جاري رفع الصور الفاخرة إلى السحابة...</span>
                      </h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        @for (img of uploadProgressList(); track img.id) {
                          <div class="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                            <div class="flex items-center gap-3">
                              <div class="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                                <img [src]="img.preview" class="w-full h-full object-cover">
                              </div>
                              <div class="text-right">
                                <h5 class="text-[10px] font-black text-slate-700 leading-none mb-1.5">صورة رقم {{ img.index }}</h5>
                                <span class="text-[9px] font-black tracking-wide" 
                                      [class.text-[#0a8f96]]="img.status === 'uploading'" 
                                      [class.text-emerald-500]="img.status === 'success'" 
                                      [class.text-red-500]="img.status === 'error'">
                                  {{ img.status === 'uploading' ? 'جاري الرفع...' : img.status === 'success' ? 'تم الرفع بنجاح' : 'فشل الرفع' }}
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
                    <div class="grid grid-cols-2 gap-4">
                      @for (img of localImages(); track img; let i = $index) {
                        <div class="relative group aspect-square rounded-2xl overflow-hidden shadow-sm">
                          <img [src]="img" class="w-full h-full object-cover">
                          <button type="button" (click)="removeLocalImage(i)" class="absolute top-2 ltr:right-2 rtl:left-2 w-8 h-8 bg-red-500/80 backdrop-blur-md text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      }
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
                  
                  <!-- Smart Geocoding search input -->
                  <div class="space-y-3 md:col-span-2">
                    <label class="block text-[11px] font-black text-[#0a8f96] uppercase tracking-wider mb-1 px-1">🔍 البحث الجغرافي الذكي (اكتب المنطقة واضغط Enter أو بحث)</label>
                    <div class="relative flex gap-2">
                      <input type="text" #geoSearchInput (keyup.enter)="searchLocation(geoSearchInput.value)"
                             placeholder="مثال: الزمالك، القاهرة الجديدة، سموحة..."
                             class="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold shadow-sm">
                      <button type="button" (click)="searchLocation(geoSearchInput.value)"
                              class="bg-[#0a8f96] hover:bg-[#076b70] text-white text-xs font-black px-6 py-4 rounded-2xl transition-all active:scale-95 cursor-pointer shrink-0">
                        بحث جيو
                      </button>
                    </div>
                  </div>

                  <div class="space-y-3">
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_CITY' | translate }} <span class="text-red-500">*</span></label>
                            <input type="text" [(ngModel)]="form.city" name="city" id="city"
                                   list="cities-form-list"
                                   [class.border-red-500]="validationErrors['city']"
                                   [placeholder]="'PROPERTY_FORM.PLACEHOLDER_CITY' | translate"
                                   class="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold shadow-sm">
                            <datalist id="cities-form-list">
                              <option *ngFor="let city of cities" [value]="'CITIES.' + city | translate"></option>
                            </datalist>
                          </div>
                          <div class="space-y-3">
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_DISTRICT' | translate }} <span class="text-red-500">*</span></label>
                            <input type="text" [(ngModel)]="form.district" name="district" id="district"
                                   [attr.list]="getDistrictListId()"
                                   [class.border-red-500]="validationErrors['district']"
                                   [placeholder]="'PROPERTY_FORM.PLACEHOLDER_DISTRICT' | translate"
                                   class="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold shadow-sm">
                            
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
                    <input [(ngModel)]="form.addressLine" name="address" id="addressLine" [class.border-red-500]="validationErrors['addressLine']" class="w-full bg-gray-50 border-transparent rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96] outline-none transition-all" [placeholder]="'PROPERTY_FORM.PLACEHOLDER_ADDRESS' | translate">
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
                             class="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold shadow-sm"
                             placeholder="30.0444">
                    </div>
                    <div class="space-y-3">
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">{{ 'PROPERTY_FORM.LABEL_LNG' | translate }}</label>
                      <input type="number" step="any" [(ngModel)]="form.longitude" name="longitude"
                             class="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 placeholder:text-gray-300 focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all font-bold shadow-sm"
                             placeholder="31.2357">
                    </div>
                  </div>
                  @if (form.latitude && form.longitude) {
                    <div class="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-[200px]">
                      <iframe
                        [src]="getMapUrl()"
                        class="w-full h-full border-0"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        allowfullscreen>
                      </iframe>
                    </div>
                  }
                  <p class="text-[10px] text-gray-400 font-bold mt-3 ltr:text-left rtl:text-right">{{ 'PROPERTY_FORM.COORDINATES_HELP' | translate }}</p>
                </div>
              </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between mt-8">
              <button type="button" (click)="currentStep.set(currentStep() - 1)" [disabled]="currentStep() === 1" class="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-50">السابق</button>
              @if (currentStep() < 4) {
                <button type="button" (click)="currentStep.set(currentStep() + 1)" class="px-8 py-4 rounded-2xl bg-[#0a8f96] text-white font-bold">التالي</button>
              } @else {
                <button type="submit" [disabled]="loading" class="px-8 py-4 rounded-2xl bg-[#0a8f96] text-white font-bold">إدراج العقار</button>
              }
            </div>
          </div>

          <!-- Sidebar (Left) -->
          <div class="lg:col-span-4 space-y-8">
            <!-- Submit Action (Visible only in last step) -->
            @if (currentStep() === 4) {
                <div class="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl shadow-gray-900/20 ltr:text-left rtl:text-right">
                    <h4 class="text-xl font-black mb-6 tracking-tight">{{ 'PROPERTY_FORM.SIDEBAR_TITLE' | translate }}</h4>
                    <p class="text-sm text-gray-400 mb-8 leading-relaxed font-medium">{{ 'PROPERTY_FORM.SIDEBAR_DESC' | translate }}</p>
                    
                    <button type="submit" [disabled]="loading" class="w-full bg-[#0a8f96] hover:bg-[#076b70] disabled:opacity-50 text-white font-black py-4.5 rounded-[22px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-[#0a8f96]/20 mb-4 ltr:flex-row rtl:flex-row-reverse">
                        @if (loading) { <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                        {{ (isEdit() ? 'PROPERTY_FORM.BTN_SUBMIT_EDIT' : 'PROPERTY_FORM.BTN_SUBMIT_CREATE') | translate }}
                    </button>
                    
                    <a routerLink="/properties" class="block w-full text-center text-xs font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest py-2">
                        {{ 'PROPERTY_FORM.BTN_CANCEL' | translate }}
                    </a>
                </div>
            }
          </div>
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
export class PropertyFormComponent implements OnInit {
  readonly propertyTypeOptions = Object.values(PropertyType);
  readonly listingTypeOptions = Object.values(ListingType);
  readonly furnishingStatusOptions = Object.values(FurnishingStatus);
  readonly viewTypeOptions = Object.values(ViewType);

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
  existingImageUrls = signal<string[]>([]);
  propertyId = '';
  imageUrlsText = '';
  private translate = inject(TranslateService);

  hasDraftAvailable = signal(false);
  initialDescriptionHtml = '';
  uploadProgressList = signal<{ id: string, preview: string, index: number, progress: number, status: 'pending' | 'uploading' | 'success' | 'error' }[]>([]);


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

  currentStep = signal(1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private toast: ToastService,
    private localImageService: LocalImageService,
    private uploadManager: UploadManagerService,
    private cloudinary: CloudinaryService,
    private sanitizer: DomSanitizer
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

      this.existingImageUrls.set(
        (property.images ?? [])
          .map(image => image.url.trim())
          .filter(url => url.length > 0)
      );
      // NOTE: In edit mode we do NOT pre-fill localImages from local storage.
      // Those are already-uploaded Cloudinary URLs and must NOT be re-uploaded.
      // The user can add genuinely new images (data: URIs) via the file picker.

    } catch {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.LOAD_FAILED'));
    }
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

  async onFileSelected(event: any) {
    const files = event.target.files as FileList;
    if (!files || files.length === 0) return;

    this.loading = true;
    this.toast.info(this.translate.instant('PROPERTY_FORM.MESSAGES.COMPRESSING'));
    
    const currentImages = [...this.localImages()];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        
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
    this.triggerDraftSave();
  }

  async submit() {
    this.validationErrors = {};
    
    const scrollToError = (id: string) => {
      this.validationErrors[id] = true;
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 100);
    };

    if (!this.form.title || this.form.title.length < 3) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.TITLE_REQUIRED'));
      scrollToError('title');
      return;
    }
    if (!this.form.city || this.form.city.length < 2) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.CITY_REQUIRED'));
      scrollToError('city');
      return;
    }
    if (!this.form.district || this.form.district.length < 2) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.DISTRICT_REQUIRED'));
      scrollToError('district');
      return;
    }
    if (!this.form.addressLine || this.form.addressLine.length < 5) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.ADDRESS_REQUIRED'));
      scrollToError('addressLine');
      return;
    }
    if (this.form.price <= 0) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.PRICE_POSITIVE'));
      scrollToError('price');
      return;
    }
    if (this.form.area <= 0) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.AREA_POSITIVE'));
      scrollToError('area');
      return;
    }
    if (this.form.bedrooms < 0 || this.form.bathrooms < 0) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.VALIDATION.BEDROOMS_POSITIVE'));
      return;
    }

    this.loading = true;

    const manualImageUrls = Array.from(new Set(this.imageUrlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)));

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

      const allImageUrls = [...cloudinaryUrls, ...manualImageUrls];

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

        const newUrls = allImageUrls.filter(url => !this.existingImageUrls().includes(url));
        if (newUrls.length > 0) {
          await this.propertyService.addImages(this.propertyId, newUrls);
        }
        this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.UPDATE_SUCCESS'));
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
      let errorMessage = this.translate.instant('PROPERTY_FORM.MESSAGES.SAVE_ERROR');
      
      if (e?.error?.detail) {
        errorMessage = e.error.detail;
      } else if (e?.error?.errors) {
        const firstErrorKey = Object.keys(e.error.errors)[0];
        const firstErrorMessages = e.error.errors[firstErrorKey];
        errorMessage = Array.isArray(firstErrorMessages) ? firstErrorMessages[0] : firstErrorMessages;
      } else if (e?.error?.title) {
        errorMessage = e.error.title;
      }

      this.toast.error(errorMessage); 
    } finally { 
      this.loading = false; 
    }
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.toast.error(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_NOT_SUPPORTED'));
      return;
    }

    this.locating = true;
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
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=${lang}`
          );
          const data = await response.json();
          if (data && data.address) {
            this.fillAddressFromGeocode(data.address);
          }
        } catch (geocodeErr) {
          console.error('Reverse geocoding failed:', geocodeErr);
        }

        this.locating = false;
        this.triggerDraftSave();
        this.toast.success(this.translate.instant('PROPERTY_FORM.MESSAGES.GEO_SUCCESS'));
      },
      (error) => {
        this.locating = false;
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

  getMapUrl(): SafeResourceUrl {
    const lat = this.form.latitude || 30.0444;
    const lng = this.form.longitude || 31.2357;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // --- 4. Custom Rich Text WYSIWYG Editor Methods ---
  execEditorCommand(command: string) {
    document.execCommand(command, false, '');
  }

  onEditorInput(html: string) {
    this.form.description = html;
    this.triggerDraftSave();
  }

  // --- 3. Smart Nominatim OpenStreetMap Geocoding ---
  async searchLocation(query: string) {
    if (!query || query.trim().length < 3) {
      this.toast.error('يرجى كتابة اسم الموقع المكون من 3 أحرف على الأقل.');
      return;
    }

    this.locating = true;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        this.form.latitude = parseFloat(lat.toFixed(7));
        this.form.longitude = parseFloat(lon.toFixed(7));
        
        if (data[0].address) {
          this.fillAddressFromGeocode(data[0].address);
        }
        
        this.triggerDraftSave();
        this.toast.success('تم تحديد الموقع الجغرافي وتحديث الخريطة بنجاح!');
      } else {
        this.toast.error('لم نتمكن من تحديد هذا الموقع. يرجى كتابة اسم مدينة أو حي معروف.');
      }
    } catch (err) {
      this.toast.error('حدث خطأ أثناء الاتصال بخدمة الخرائط الجغرافية.');
      console.error(err);
    } finally {
      this.locating = false;
    }
  }

  private fillAddressFromGeocode(address: any) {
    if (!address) return;

    const lang = this.translate.currentLang || 'ar';

    // 1. City extraction and matching
    const rawCity = address.city || address.town || address.village || address.governorate || address.state || address.county || '';
    let matchedCityKey = '';
    
    if (rawCity) {
      const cleanCity = rawCity.toLowerCase().replace('governorate', '').replace('محافظة', '').trim();
      
      // Find in cityMap (keys or values)
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
        this.form.city = rawCity;
      }
    }

    // 2. District extraction and matching
    const rawDistrict = address.suburb || address.neighbourhood || address.city_district || address.quarter || '';
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
    }

    // 3. Zip Code
    if (address.postcode) {
      this.form.zipCode = address.postcode;
    }

    // 4. Detailed Address
    const parts = [];
    if (address.road) parts.push(address.road);
    if (rawDistrict && rawDistrict !== rawCity) parts.push(rawDistrict);
    if (rawCity) parts.push(rawCity);
    
    if (parts.length > 0) {
      this.form.addressLine = parts.join(', ');
    }
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
        this.toast.success('تمت استعادة المسودة التلقائية بنجاح!');
      }
    } catch (e) {
      this.toast.error('فشل في استعادة المسودة.');
      console.error(e);
    } finally {
      this.hasDraftAvailable.set(false);
    }
  }

  discardDraft() {
    this.clearDraft();
    this.hasDraftAvailable.set(false);
    this.toast.info('تم تجاهل وحذف المسودة المحفوظة.');
  }

  clearDraft() {
    try {
      localStorage.removeItem(this.draftKey);
    } catch (e) {
      console.error('Failed to clear draft', e);
    }
  }
}
