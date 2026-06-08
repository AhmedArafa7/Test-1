import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';

import { AuthService } from '../../../core/auth/auth.service';
import { ContactMethod } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { ProfileService } from '../services/profile.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { ImageCropperComponent, ImageCroppedEvent, ImageTransform } from 'ngx-image-cropper';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [FormsModule, RouterLink, ImageCropperComponent, DecimalPipe, LocalizedDatePipe, TranslateModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans py-16 px-6">
      <div class="max-w-5xl mx-auto">
        
        <!-- Page Header -->
        <div class="ltr:text-left rtl:text-right mb-12">
          <p class="text-[#0a8f96] text-[13px] font-black uppercase tracking-widest mb-2">{{ 'PROFILE.EDIT.ACCOUNT_SETTINGS' | translate }}</p>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-4">{{ 'PROFILE.EDIT.TITLE' | translate }}</h1>
          <p class="text-gray-500 text-sm max-w-2xl leading-relaxed">{{ 'PROFILE.EDIT.UPDATE_DESC' | translate }}</p>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <!-- Left Form Section (cols 1-8) -->
          <div class="lg:col-span-8">
            <div class="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm">
              <form (ngSubmit)="save()">
                
                <!-- Basic Info -->
                <div class="mb-12">
                  <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-10 border-b border-gray-50 pb-6">
                    <h3 class="text-2xl font-black text-gray-900">{{ 'PROFILE.EDIT.BASIC_INFO' | translate }}</h3>
                    <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                  </div>
                  
                  <div class="space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.FIRST_NAME' | translate }} <span class="text-red-500">*</span></label>
                        <input [ngModel]="firstName()" (ngModelChange)="firstName.set($event); firstNameTouched.set(true)" (blur)="markFirstNameTouched()" name="firstName" [class]="getFieldClasses(firstNameTouched(), firstNameError())" [placeholder]="'PROFILE.EDIT.FIRST_NAME' | translate">
                        <div class="mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
                          @if (firstNameTouched() && firstNameError()) {
                            <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                            <span class="text-red-600">{{ getErrorMessage(firstNameError()) }}</span>
                          } @else if (firstNameTouched() && !firstNameError()) {
                            <svg class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            <span class="text-emerald-600">{{ 'PROFILE.EDIT.FIRST_NAME_HINT' | translate }}</span>
                          } @else {
                            <span class="text-gray-400">{{ 'PROFILE.EDIT.FIRST_NAME_HINT' | translate }}</span>
                          }
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.LAST_NAME' | translate }} <span class="text-red-500">*</span></label>
                        <input [ngModel]="lastName()" (ngModelChange)="lastName.set($event); lastNameTouched.set(true)" (blur)="markLastNameTouched()" name="lastName" [class]="getFieldClasses(lastNameTouched(), lastNameError())" [placeholder]="'PROFILE.EDIT.LAST_NAME' | translate">
                        <div class="mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
                          @if (lastNameTouched() && lastNameError()) {
                            <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                            <span class="text-red-600">{{ getErrorMessage(lastNameError()) }}</span>
                          } @else if (lastNameTouched() && !lastNameError()) {
                            <svg class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            <span class="text-emerald-600">{{ 'PROFILE.EDIT.LAST_NAME_HINT' | translate }}</span>
                          } @else {
                            <span class="text-gray-400">{{ 'PROFILE.EDIT.LAST_NAME_HINT' | translate }}</span>
                          }
                        </div>
                      </div>
                    </div>
                     
                    <div>
                      <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.JOB_TITLE' | translate }}</label>
                      <input [ngModel]="jobTitle()" (ngModelChange)="jobTitle.set($event)" name="jobTitle" class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all" [placeholder]="'PROFILE.EDIT.JOB_TITLE' | translate">
                      <div class="mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-gray-400">
                        <span>{{ 'PROFILE.EDIT.JOB_TITLE_HINT' | translate }}</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.PHONE_NUMBER' | translate }} </label>
                        <input [ngModel]="phoneNumber()" (ngModelChange)="phoneNumber.set($event); phoneTouched.set(true)" (blur)="markPhoneTouched()" name="phoneNumber" type="tel" dir="ltr" [class]="getFieldClasses(phoneTouched(), phoneError()) + ' ltr:text-left rtl:text-right'" [placeholder]="'PROFILE.EDIT.PHONE_PLACEHOLDER' | translate">
                        <div class="mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
                          @if (phoneTouched() && phoneError()) {
                            <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                            <span class="text-red-600">{{ getPhoneErrorMessage() }}</span>
                          } @else if (phoneTouched() && !phoneError() && phoneNumber().trim()) {
                            <svg class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                            <span class="text-emerald-600">{{ 'PROFILE.EDIT.PHONE_HINT' | translate }}</span>
                          } @else {
                            <span class="text-gray-400">{{ 'PROFILE.EDIT.PHONE_HINT' | translate }}</span>
                          }
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.CONTACT_METHOD' | translate }}</label>
                        <select [ngModel]="preferredContactMethod()" (ngModelChange)="preferredContactMethod.set($event)" name="contactMethod" [class]="getSelectClasses(true, !!preferredContactMethod())">
                          <option [ngValue]="ContactMethod.Email">{{ 'PROFILE.EDIT.ROLES.EMAIL' | translate }}</option>
                          <option [ngValue]="ContactMethod.Phone">{{ 'PROFILE.EDIT.ROLES.PHONE' | translate }}</option>
                          <option [ngValue]="ContactMethod.WhatsApp">{{ 'PROFILE.EDIT.ROLES.WHATSAPP' | translate }}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                @if (auth.isAgent() || auth.isAdmin()) {
                  <!-- Agent Details -->
                  <div class="mb-12">
                    <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-10 border-b border-gray-50 pb-6">
                      <h3 class="text-2xl font-black text-gray-900">{{ 'PROFILE.EDIT.AGENT_DETAILS' | translate }}</h3>
                      <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      </div>
                    </div>

                    <div class="space-y-8">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.AGENCY_NAME' | translate }}</label>
                          <input [ngModel]="agencyName()" (ngModelChange)="agencyName.set($event)" name="agencyName" maxlength="300" class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all" [placeholder]="'PROFILE.EDIT.AGENCY_NAME' | translate">
                          <div class="mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-gray-400">
                            <span>{{ 'PROFILE.EDIT.AGENCY_HINT' | translate }}</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.LICENSE_NUMBER' | translate }}</label>
                          <input [ngModel]="licenseNumber()" (ngModelChange)="licenseNumber.set($event)" name="licenseNumber" maxlength="100" class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all" [placeholder]="'PROFILE.EDIT.LICENSE_NUMBER' | translate">
                          <div class="mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-gray-400">
                            <span>{{ 'PROFILE.EDIT.LICENSE_HINT' | translate }}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.COMMISSION_RATE' | translate }}</label>
                        <div class="relative">
                          <input type="number" [ngModel]="commissionRatePercent()" (ngModelChange)="commissionRatePercent.set(+$event); commissionTouched.set(true)" (blur)="markCommissionTouched()" name="commissionRatePercent" min="0.1" max="99.9" step="0.1" dir="ltr" [class]="getFieldClasses(commissionTouched(), commissionError()) + ' ltr:pl-14 rtl:pr-14 tabular-nums'">
                          <span class="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-sm font-black" [class.text-red-400]="commissionTouched() && commissionError()" [class.text-gray-400]="!(commissionTouched() && commissionError())">%</span>
                        </div>
                        <div class="mt-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
                          @if (commissionTouched() && commissionError()) {
                            <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                            <span class="text-red-600">{{ getCommissionErrorMessage() }}</span>
                          } @else {
                            <span class="text-gray-400">{{ 'PROFILE.EDIT.COMMISSION_HINT' | translate }}</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Professional Summary -->
                <div class="mb-10">
                  <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-10 border-b border-gray-50 pb-6">
                    <h3 class="text-2xl font-black text-gray-900">{{ 'PROFILE.EDIT.PROFESSIONAL_SUMMARY' | translate }}</h3>
                    <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-xs font-bold text-gray-800 mb-3 tracking-wide">{{ 'PROFILE.EDIT.BIO_LABEL' | translate }}</label>
                    <textarea [ngModel]="bio()" (ngModelChange)="bio.set($event)" name="bio" maxlength="2000" class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 text-sm font-medium focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all min-h-[200px] resize-none leading-relaxed" [placeholder]="'PROFILE.EDIT.BIO_PLACEHOLDER' | translate"></textarea>
                    <div class="mt-2 flex items-center justify-between gap-3 text-[11px] font-bold tracking-wide">
                      <span class="text-gray-400">{{ 'PROFILE.EDIT.BIO_HINT' | translate }}</span>
                      <span class="text-gray-400 tabular-nums" [class.text-amber-500]="bio().length > 1900" [class.text-red-500]="bio().length >= 2000" dir="ltr">{{ bio().length }} / 2000</span>
                    </div>
                  </div>
                </div>

                <!-- Sound Settings Section -->
                <div class="mb-12">
                  <div class="flex items-center ltr:justify-start rtl:justify-end gap-3 mb-10 border-b border-gray-50 pb-6">
                    <h3 class="text-2xl font-black text-gray-900">{{ 'PROFILE.EDIT.SOUND_SECTION_TITLE' | translate }}</h3>
                    <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div class="space-y-6">
                    <div class="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                      <div class="ltr:text-left rtl:text-right">
                        <h4 class="text-sm font-black text-gray-900 mb-1">{{ 'PROFILE.EDIT.ENABLE_SOUND' | translate }}</h4>
                        <p class="text-xs text-gray-400 font-bold">{{ 'PROFILE.EDIT.ENABLE_SOUND_DESC' | translate }}</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               [checked]="soundEnabled()" 
                               (change)="toggleSoundEnabled()" 
                               class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a8f96]"></div>
                      </label>
                    </div>

                    @if (soundEnabled()) {
                      <div class="p-6 bg-gray-50 rounded-2xl space-y-4 ltr:text-left rtl:text-right">
                        <label class="block text-xs font-bold text-gray-800 mb-1">{{ 'PROFILE.EDIT.CHOOSE_SOUND_LABEL' | translate }}</label>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <button type="button"
                                  (click)="changeSoundType('premium')"
                                  [class.bg-[#0a8f96]]="soundType() === 'premium'"
                                  [class.text-white]="soundType() === 'premium'"
                                  [class.bg-white]="soundType() !== 'premium'"
                                  [class.text-gray-700]="soundType() !== 'premium'"
                                  [class.border-gray-200]="soundType() !== 'premium'"
                                  class="px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95">
                            <span>{{ 'PROFILE.EDIT.SOUND_PREMIUM_NAME' | translate }}</span>
                            @if (soundType() === 'premium') {
                              <span class="w-2 h-2 rounded-full bg-white shrink-0"></span>
                            }
                          </button>

                          <button type="button"
                                  (click)="changeSoundType('pop')"
                                  [class.bg-[#0a8f96]]="soundType() === 'pop'"
                                  [class.text-white]="soundType() === 'pop'"
                                  [class.bg-white]="soundType() !== 'pop'"
                                  [class.text-gray-700]="soundType() !== 'pop'"
                                  [class.border-gray-200]="soundType() !== 'pop'"
                                  class="px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95">
                            <span>{{ 'PROFILE.EDIT.SOUND_POP_NAME' | translate }}</span>
                            @if (soundType() === 'pop') {
                              <span class="w-2 h-2 rounded-full bg-white shrink-0"></span>
                            }
                          </button>

                          <button type="button"
                                  (click)="changeSoundType('classic')"
                                  [class.bg-[#0a8f96]]="soundType() === 'classic'"
                                  [class.text-white]="soundType() === 'classic'"
                                  [class.bg-white]="soundType() !== 'classic'"
                                  [class.text-gray-700]="soundType() !== 'classic'"
                                  [class.border-gray-200]="soundType() !== 'classic'"
                                  class="px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95">
                            <span>🤖 &#1603;&#1604;&#1575;&#1587;&#1610;&#1603;&#1610; (Beep)</span>
                            @if (soundType() === 'classic') {
                              <span class="w-2 h-2 rounded-full bg-white shrink-0"></span>
                            }
                          </button>

                          <button type="button"
                                  (click)="changeSoundType('custom')"
                                  [class.bg-[#0a8f96]]="soundType() === 'custom'"
                                  [class.text-white]="soundType() === 'custom'"
                                  [class.bg-white]="soundType() !== 'custom'"
                                  [class.text-gray-700]="soundType() !== 'custom'"
                                  [class.border-gray-200]="soundType() !== 'custom'"
                                  class="px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95">
                            <span>🎵 &#1605;&#1582;&#1589;&#1589;&#1577; (Custom)</span>
                            @if (soundType() === 'custom') {
                              <span class="w-2 h-2 rounded-full bg-white shrink-0"></span>
                            }
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row items-center justify-start gap-4 mt-16 pt-10 border-t border-gray-100">
                  <div class="w-full sm:w-auto flex flex-col gap-2">
                    <button type="submit" [disabled]="loading() || !isFormValid()" (click)="markAllTouched()" [title]="!isFormValid() ? ('PROFILE.EDIT.SAVE_DISABLED_HINT' | translate) : ''" [class]="(!isFormValid() || loading()) ? 'w-full sm:w-auto bg-gray-200 text-gray-400 text-sm font-black py-4 px-12 rounded-2xl cursor-not-allowed flex items-center justify-center gap-3' : 'w-full sm:w-auto bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-black py-4 px-12 rounded-2xl shadow-lg shadow-[#0a8f96]/20 transition-all flex items-center justify-center gap-3 active:scale-95'">
                      @if (loading()) { <div class="w-4 h-4 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div> }
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                      {{ 'PROFILE.EDIT.SAVE_CHANGES' | translate }}
                    </button>
                    @if (!isFormValid() && (firstNameTouched() || lastNameTouched() || phoneTouched() || commissionTouched())) {
                      <p class="text-[11px] font-bold text-amber-600 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        {{ 'PROFILE.EDIT.SAVE_DISABLED_HINT' | translate }}
                      </p>
                    }
                  </div>
                  <a routerLink="/profile" class="w-full sm:w-auto text-gray-500 hover:text-gray-900 text-sm font-black py-4 px-10 transition-colors text-center uppercase tracking-widest">
                    {{ 'PROFILE.EDIT.CANCEL' | translate }}
                  </a>
                </div>
              </form>
            </div>
          </div>

          <!-- Right Sidebar Area -->
          <div class="lg:col-span-4 space-y-8">
            <!-- Profile Photo Selection -->
            <div class="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm text-center">
              <div class="relative inline-block group mb-8">
                  <div class="w-40 h-40 rounded-full overflow-hidden border border-white ring-4 ring-gray-50 shadow-xl bg-white flex items-center justify-center cursor-pointer group/img relative" (click)="photoInput.click()">
                    @if (avatarUrl() && avatarUrl()!.length > 20) {
                      <img [src]="avatarUrl()" (error)="avatarUrl.set(null)" class="w-full h-full object-contain img-circle b-tr b-2x">
                    } @else {
                      <svg class="w-20 h-20 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    }
                    <div class="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors flex items-center justify-center">
                       <svg class="w-10 h-10 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                  </div>
                <input type="file" #photoInput (change)="onPhotoSelected($event)" class="hidden" accept="image/*">
                <button type="button" (click)="photoInput.click()" class="absolute bottom-1 right-1 w-12 h-12 bg-[#0a8f96] hover:bg-[#076b70] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all transform hover:scale-110">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </button>
              </div>
              <h4 class="text-lg font-black text-gray-900 mb-2">{{ 'PROFILE.EDIT.PHOTO_TITLE' | translate }}</h4>
              <p class="text-xs text-gray-500 font-medium leading-relaxed px-4">
                {{ 'PROFILE.EDIT.PHOTO_DESC' | translate }}
              </p>
            </div>

            <!-- Guidelines Card -->
            <div class="bg-[#0a8f96] rounded-[32px] p-10 text-white shadow-xl shadow-[#0a8f96]/10 ltr:text-left rtl:text-right mb-8">
              <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h4 class="text-xl font-black mb-4 tracking-tight">{{ 'PROFILE.EDIT.TIPS_TITLE' | translate }}</h4>
              <p class="text-sm text-white/80 leading-relaxed font-medium">
                {{ 'PROFILE.EDIT.TIPS_DESC' | translate }}
              </p>
            </div>

            @if (auth.isAgent()) {
              <!-- Professional Performance Card -->
              <div class="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm ltr:text-left rtl:text-right">
                <div class="flex items-center justify-between mb-8">
                  <h4 class="text-lg font-black text-gray-900">{{ 'PROFILE.EDIT.PERFORMANCE_TITLE' | translate }}</h4>
                  @if (isVerified()) {
                    <span class="px-3 py-1 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{{ 'PROFILE.AGENT.VERIFIED' | translate }}</span>
                  }
                </div>

                <div class="space-y-6">
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div class="flex items-center gap-1.5 text-yellow-500">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <span class="text-lg font-black tabular-nums">{{ rating() | number:'1.1-1' }}</span>
                      </div>
                      <span class="text-xs font-bold text-gray-400">{{ 'PROFILE.EDIT.RATING' | translate }}</span>
                    </div>

                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <span class="text-lg font-black text-gray-900 tabular-nums">{{ reviewCount() }}</span>
                    <span class="text-xs font-bold text-gray-400">{{ 'PROFILE.EDIT.REVIEWS' | translate }}</span>
                  </div>

                  <div class="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-widest tabular-nums">{{ joinedAt() | localizedDate:'MMMM yyyy' }}</span>
                    <span class="text-[10px] font-black text-gray-300 uppercase">{{ 'PROFILE.MEMBER_SINCE' | translate }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

        </div>

        <!-- Image Cropper Modal (Luxury Backdrop) -->
        @if (imageChangedEvent) {
          <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 animate-fade-in">
            <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-md" (click)="cancelCrop()"></div>
            <div class="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
              <!-- Modal Header -->
              <div class="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 class="text-xl font-black text-gray-900 tracking-tight">{{ 'PROFILE.CROP.TITLE' | translate }}</h3>
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{{ 'PROFILE.CROP.SUBTITLE' | translate }}</p>
                </div>
                <button (click)="cancelCrop()" class="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              
              <!-- Cropper Content -->
              <div class="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                <div class="rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-inner p-4 mb-6">
                  <image-cropper
                    [imageChangedEvent]="imageChangedEvent"
                    [maintainAspectRatio]="true"
                    [aspectRatio]="1 / 1"
                    [roundCropper]="true"
                    [imageQuality]="95"
                    [transform]="transform"
                    [canvasRotation]="canvasRotation"
                    [containWithinAspectRatio]="true"
                    format="webp"
                    (imageCropped)="imageCropped($event)"
                    (loadImageFailed)="loadImageFailed()"
                    class="max-h-[350px] w-full"
                  ></image-cropper>
                </div>

                <!-- Advanced Controls -->
                <div class="space-y-6">
                  <!-- Zoom Slider -->
                  <div class="px-4">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ 'PROFILE.CROP.ZOOM' | translate }}</span>
                      <span class="text-xs font-black text-[#0a8f96] tabular-nums">{{ scale | number:'1.1-1' }}x</span>
                    </div>
                    <div class="relative flex items-center">
                      <input type="range" [min]="0.1" [max]="3" [step]="0.1" [ngModel]="scale" (ngModelChange)="onScaleChange($event)"
                             class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0a8f96]">
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-center gap-3">
                    <button (click)="zoomOut()" class="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"/></svg>
                    </button>
                    <button (click)="zoomIn()" class="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                    </button>
                    <div class="w-px h-6 bg-gray-200 mx-2"></div>
                    <button (click)="rotateLeft()" class="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    </button>
                    <button (click)="resetImage()" class="px-6 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-xs font-black text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest">
                      {{ 'PROFILE.CROP.RESET' | translate }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="p-6 md:p-8 border-t border-gray-100 flex flex-wrap items-center justify-end gap-4 bg-white sticky bottom-0 z-10">
                <button (click)="cancelCrop()" class="px-6 py-3 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">{{ 'PROFILE.CROP.CANCEL' | translate }}</button>
                <div class="flex gap-3">
                  <button (click)="useOriginal()" class="px-6 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-black transition-all border border-gray-100 active:scale-95">
                    {{ 'PROFILE.CROP.USE_ORIGINAL' | translate }}
                  </button>
                  <button (click)="confirmCrop()" class="bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-black py-4 px-10 rounded-2xl shadow-xl shadow-[#0a8f96]/20 transition-all active:scale-95 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                    {{ 'PROFILE.CROP.CONFIRM' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class EditProfileComponent implements OnInit {
  readonly ContactMethod = ContactMethod;

  // Form signals
  firstName = signal('');
  lastName = signal('');
  jobTitle = signal('');
  bio = signal('');
  phoneNumber = signal('');
  avatarUrl = signal<string | null>(null);
  preferredContactMethod = signal<string>('Email');
  loading = signal(false);
  isNew = signal(true);
  agencyName = signal('');
  licenseNumber = signal('');
  commissionRatePercent = signal(2.5);

  bioError = computed<string | null>(() => {
    if (this.bio().length > 2000) return 'maxLength';
    return null;
  });

  avatarUrlError = computed<string | null>(() => {
    const url = this.avatarUrl();
    if (!url) return null;
    if (url.startsWith('data:image')) return null;
    if (url.startsWith('blob:')) return null;
    if (url.length > 500) return 'maxLength';
    try {
      const u = new URL(url);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return 'invalid';
    } catch {
      return 'invalid';
    }
    return null;
  });

  // Performance Signals
  rating = signal(0);
  reviewCount = signal(0);
  isVerified = signal(false);
  joinedAt = signal<string | null>(null);
  soundEnabled = signal(true);
  soundType = signal<'premium' | 'pop' | 'classic' | 'custom' | 'none'>('premium');

  // Validation: touched state per field
  firstNameTouched = signal(false);
  lastNameTouched = signal(false);
  phoneTouched = signal(false);
  commissionTouched = signal(false);

  // Validation: error code per field ('required' | 'minLength' | 'invalid' | null)
  readonly firstNameError = computed<string | null>(() => {
    const v = this.firstName().trim();
    if (!v) return 'required';
    if (v.length < 2) return 'minLength';
    const fullName = [v, this.lastName().trim()].filter(Boolean).join(' ');
    if (fullName.length > 100) return 'maxLength';
    return null;
  });
  readonly lastNameError = computed<string | null>(() => {
    const v = this.lastName().trim();
    if (!v) return 'required';
    if (v.length < 2) return 'minLength';
    const fullName = [this.firstName().trim(), v].filter(Boolean).join(' ');
    if (fullName.length > 100) return 'maxLength';
    return null;
  });
  readonly phoneError = computed<string | null>(() => {
    const v = this.phoneNumber().trim();
    if (!v) return null; // optional
    if (!/^\+[1-9]\d{1,14}$/.test(v)) return 'invalid';
    return null;
  });
  readonly commissionError = computed<string | null>(() => {
    if (!this.canEditAgentDetailsPublic()) return null;
    const percent = Number(this.commissionRatePercent());
    if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) return 'invalid';
    return null;
  });

  readonly isFormValid = computed<boolean>(() => {
    if (this.firstNameError() !== null) return false;
    if (this.lastNameError() !== null) return false;
    if (this.phoneError() !== null) return false;
    if (this.commissionError() !== null) return false;
    if (this.bioError() !== null) return false;
    if (this.avatarUrlError() !== null) return false;
    return true;
  });

  readonly showAgentFields = computed(() => this.canEditAgentDetailsPublic());

  private profileService = inject(ProfileService);
  public auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private cloudinary = inject(CloudinaryService);
  private translate = inject(TranslateService);

  async ngOnInit() {
    this.soundEnabled.set(localStorage.getItem('baytology_sound_enabled') !== 'false');
    this.soundType.set((localStorage.getItem('baytology_sound_type') as any) || 'premium');

    this.loading.set(true);
    try {
      const p = await this.profileService.getMyProfile();
      if (p) {
        const nameParts = (p.displayName || '').trim().split(/\s+/);
        this.firstName.set(nameParts[0] || '');
        this.lastName.set(nameParts.slice(1).join(' ') || '');
        this.phoneNumber.set(p.phoneNumber || '');
        this.bio.set(p.bio || '');
        this.preferredContactMethod.set(p.preferredContactMethod || this.translate.instant('PROFILE.EDIT.EMAIL'));
        this.avatarUrl.set(p.avatarUrl || null);
        this.isNew.set(false);
      } else {
        this.isNew.set(true);
      }
    } catch {
      this.isNew.set(true);
    }

    if (this.canEditAgentDetails()) {
      await this.loadAgentDetails();
    }

    this.loading.set(false);
  }

  private canEditAgentDetails(): boolean {
    return this.canEditAgentDetailsPublic();
  }

  canEditAgentDetailsPublic(): boolean {
    return this.auth.isAgent() || this.auth.isAdmin();
  }

  // Mark field as touched (for live validation display)
  markFirstNameTouched() { this.firstNameTouched.set(true); }
  markLastNameTouched() { this.lastNameTouched.set(true); }
  markPhoneTouched() { this.phoneTouched.set(true); }
  markCommissionTouched() { this.commissionTouched.set(true); }
  markAllTouched() {
    this.firstNameTouched.set(true);
    this.lastNameTouched.set(true);
    this.phoneTouched.set(true);
    this.commissionTouched.set(true);
  }

  // Get border classes for an input based on its validation state
  getFieldClasses(touched: boolean, error: string | null): string {
    const base = 'w-full bg-gray-50 border rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 outline-none transition-all';
    if (touched && error) {
      return `${base} border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-400/10`;
    }
    if (touched && !error && this.hasNonEmptyValue(touched)) {
      return `${base} border-emerald-300 bg-emerald-50/20`;
    }
    return `${base} border-gray-200`;
  }

  private hasNonEmptyValue(touched: boolean): boolean {
    return touched;
  }

  getSelectClasses(touched: boolean, hasValue: boolean): string {
    const base = 'w-full bg-gray-50 border rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-[#0a8f96] outline-none transition-all appearance-none cursor-pointer';
    if (touched && hasValue) return `${base} border-emerald-300 bg-emerald-50/20`;
    return `${base} border-gray-200`;
  }

  getErrorMessage(error: string | null): string {
    if (!error) return '';
    if (error === 'required') return this.translate.instant('PROFILE.EDIT.REQUIRED');
    if (error === 'minLength') return this.translate.instant('PROFILE.EDIT.FIRST_NAME_MIN');
    if (error === 'maxLength') return this.translate.instant('VALIDATION.UserProfile_DisplayNameTooLong');
    if (error === 'invalid' && this.translate.currentLang === 'ar') return this.translate.instant('PROFILE.EDIT.PHONE_INVALID');
    if (error === 'invalid') return this.translate.instant('PROFILE.EDIT.COMMISSION_ERROR');
    return '';
  }

  getPhoneErrorMessage(): string {
    return this.translate.instant('VALIDATION.UserProfile_PhoneNumberInvalidFormat');
  }

  getCommissionErrorMessage(): string {
    return this.translate.instant('PROFILE.EDIT.COMMISSION_ERROR');
  }

  private async loadAgentDetails() {
    try {
      const agent = await this.profileService.getMyAgentDetail();
      this.agencyName.set(agent.agencyName || '');
      this.licenseNumber.set(agent.licenseNumber || '');
      this.commissionRatePercent.set(Number(((agent.commissionRate ?? 0.025) * 100).toFixed(1)));
      
      // Populate Performance Metrics
      this.rating.set(agent.rating);
      this.reviewCount.set(agent.reviewCount);
      this.isVerified.set(agent.isVerified);
      this.joinedAt.set(agent.createdOnUtc);
    } catch {
      this.commissionRatePercent.set(2.5);
    }
  }

  imageChangedEvent: any = '';
  croppedImage: any = '';
  canvasRotation = 0;
  scale = 1;
  transform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false
  };

  async onPhotoSelected(event: any) {
    this.imageChangedEvent = event;
    this.resetImage();
  }

  async useOriginal() {
    const file = this.imageChangedEvent?.target?.files?.[0];
    if (!file) return;

    this.loading.set(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = (e: any) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      
      this.avatarUrl.set(dataUrl);
      this.imageChangedEvent = '';
      this.toast.success(this.translate.instant('PROFILE.EDIT.USE_ORIGINAL_SUCCESS'));
    } catch {
      this.toast.error(this.translate.instant('PROFILE.EDIT.USE_ORIGINAL_ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl || event.base64;
  }

  onScaleChange(newScale: number) {
    this.scale = newScale;
    this.updateTransform();
  }

  zoomOut() {
    this.scale = Math.max(0.1, this.scale - 0.1);
    this.updateTransform();
  }

  zoomIn() {
    this.scale = Math.min(3, this.scale + 0.1);
    this.updateTransform();
  }

  rotateLeft() {
    this.canvasRotation--;
  }

  resetImage() {
    this.scale = 1;
    this.canvasRotation = 0;
    this.updateTransform();
  }

  private updateTransform() {
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  private blobUrlToDataUrl(blobUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      fetch(blobUrl).then(r => r.blob()).then(blob => reader.readAsDataURL(blob)).catch(reject);
    });
  }

  loadImageFailed() {
    this.toast.error(this.translate.instant('PROFILE.EDIT.LOAD_IMAGE_ERROR'));
    this.imageChangedEvent = '';
  }

  cancelCrop() {
    this.imageChangedEvent = '';
    this.croppedImage = '';
  }

  async confirmCrop() {
    if (!this.croppedImage) return;
    
    this.loading.set(true);
    try {
      this.avatarUrl.set(this.croppedImage);
      this.imageChangedEvent = '';
      this.toast.success(this.translate.instant('PROFILE.EDIT.CROP_SUCCESS'));
    } catch {
      this.toast.error(this.translate.instant('PROFILE.EDIT.CROP_ERROR'));
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    // Mark all fields as touched so any remaining errors become visible
    this.markAllTouched();

    if (!this.isFormValid()) {
      // Inline errors are already shown via the template; no toast needed
      return;
    }

    let commissionRate: number | null = null;
    if (this.canEditAgentDetails()) {
      const percent = Number(this.commissionRatePercent());
      commissionRate = percent / 100;
    }

    this.loading.set(true);
    try {
      let finalAvatarUrl = this.avatarUrl();

      // If avatar is a Blob URL (from cropper objectUrl), convert to data URL first
      if (finalAvatarUrl && finalAvatarUrl.startsWith('blob:')) {
        try {
          finalAvatarUrl = await this.blobUrlToDataUrl(finalAvatarUrl);
        } catch {
          this.toast.error(this.translate.instant('PROFILE.EDIT.UPLOAD_ERROR'));
          return;
        }
      }

      // If avatar is a Base64 string (from cropper), upload to Cloudinary first
      if (finalAvatarUrl && finalAvatarUrl.startsWith('data:image')) {
        try {
          finalAvatarUrl = await firstValueFrom(this.cloudinary.uploadImage(finalAvatarUrl));
        } catch (uploadErr) {
          this.toast.error(this.translate.instant('PROFILE.EDIT.UPLOAD_ERROR'));
          return;
        }
      }

      if (finalAvatarUrl && finalAvatarUrl.length > 500) {
        this.toast.error(this.translate.instant('VALIDATION.UserProfile_AvatarUrlTooLong'));
        return;
      }

      if (this.avatarUrlError() === 'invalid') {
        this.toast.error(this.translate.instant('VALIDATION.UserProfile_AvatarUrlInvalid'));
        return;
      }

      if (this.bio() && this.bio().length > 2000) {
        this.toast.error(this.translate.instant('VALIDATION.UserProfile_BioTooLong'));
        return;
      }

      const fullName = [this.firstName(), this.lastName()].filter(Boolean).join(' ');
      const profile = {
        displayName: fullName,
        bio: this.bio() || undefined,
        phoneNumber: this.phoneNumber() || undefined,
        avatarUrl: finalAvatarUrl || undefined,
        preferredContactMethod: this.preferredContactMethod() as ContactMethod,
      };
      if (this.isNew()) {
        await this.profileService.createProfile(profile);
      } else {
        await this.profileService.updateProfile(profile);
      }

      if (commissionRate !== null) {
        await this.profileService.updateAgentDetail({
          agencyName: this.agencyName().trim() || undefined,
          licenseNumber: this.licenseNumber().trim() || undefined,
          commissionRate,
        });
      }
      
      // Update local avatar sync
      this.auth.updateAvatar(finalAvatarUrl);

      await this.auth.loadCurrentUser();
      this.toast.success(this.translate.instant('PROFILE.EDIT.SUCCESS'));
      this.router.navigate(['/profile']);
    } catch (e: any) {
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
      }

      let errorMessage = '';
      if (translationKey) {
        const translated = this.translate.instant('VALIDATION.' + translationKey);
        if (translated !== 'VALIDATION.' + translationKey) {
          errorMessage = translated;
        } else {
          errorMessage = translationKey;
        }
      } else {
        errorMessage = this.translate.instant('PROFILE.EDIT.ERROR');
      }
      this.toast.error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  toggleSoundEnabled() {
    this.soundEnabled.update(v => !v);
    localStorage.setItem('baytology_sound_enabled', this.soundEnabled() ? 'true' : 'false');
    if (this.soundEnabled()) {
      this.playNotificationSound();
    }
  }

  changeSoundType(type: 'premium' | 'pop' | 'classic' | 'custom' | 'none') {
    if (type === 'custom' && !localStorage.getItem('baytology_custom_sound_data')) {
      this.toast.error(this.translate.instant('PROFILE.EDIT.NO_CUSTOM_TONE'));
      return;
    }
    this.soundType.set(type);
    localStorage.setItem('baytology_sound_type', type);
    if (type !== 'none') {
      this.playNotificationSound();
    }
  }

  playNotificationSound() {
    try {
      const soundType = this.soundType();
      
      if (soundType === 'none') {
        return;
      }
      
      if (soundType === 'custom') {
        const customData = localStorage.getItem('baytology_custom_sound_data');
        if (customData) {
          const audio = new Audio(customData);
          audio.volume = 0.5;
          audio.play().catch(e => console.warn('Custom audio playback failed:', e));
          return;
        } else {
          this.soundType.set('premium');
          localStorage.removeItem('baytology_custom_sound_name');
          localStorage.setItem('baytology_sound_type', 'premium');
          
          this.toast.error(this.translate.instant('PROFILE.EDIT.CUSTOM_TONE_MISSING'));
          
          setTimeout(() => this.playNotificationSound(), 100);
          return;
        }
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (soundType === 'premium') {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          
          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(880, ctx.currentTime, 0.4); 
        playTone(1320, ctx.currentTime + 0.08, 0.5); 
      } else if (soundType === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (soundType === 'classic') {
        const playBeep = (start: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2000, start);
          gain.gain.setValueAtTime(0.04, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.1);
        };
        playBeep(ctx.currentTime);
        playBeep(ctx.currentTime + 0.12);
      }
    } catch (err) {
      console.warn('Web Audio API chime failed:', err);
    }
  }
}
