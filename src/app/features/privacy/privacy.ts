import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-white font-sans py-20 px-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="mb-4">
            <span class="bg-gradient-to-r from-[#0a8f96]/10 to-[#0a8f96]/5 text-[#0a8f96] text-[10px] font-black tracking-[0.3em] uppercase px-6 py-2.5 rounded-full border border-[#0a8f96]/10">
              {{ 'PRIVACY.BADGE' | translate }}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            {{ 'PRIVACY.TITLE_START' | translate }} <span class="text-[#0a8f96]">{{ 'PRIVACY.TITLE_END' | translate }}</span>
          </h1>
          <p class="text-gray-500 text-sm font-medium">{{ 'PRIVACY.LAST_UPDATE' | translate }}</p>
        </div>

        <!-- Content Area -->
        <div class="bg-white rounded-[32px] p-10 md:p-16 shadow-sm border border-gray-100 space-y-12 ltr:text-left rtl:text-right">
          
          <section>
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div class="w-2 h-8 bg-gradient-to-b from-[#0a8f96] to-[#076b70] rounded-full"></div>
              {{ 'PRIVACY.INTRO_TITLE' | translate }}
            </h2>
            <p class="text-gray-600 leading-loose font-medium text-base">
              {{ 'PRIVACY.INTRO_TEXT' | translate }}
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div class="w-2 h-8 bg-gradient-to-b from-[#0a8f96] to-[#076b70] rounded-full"></div>
              {{ 'PRIVACY.DATA_TITLE' | translate }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h4 class="font-black text-[#0a8f96] mb-3">{{ 'PRIVACY.DATA_ACCOUNT_TITLE' | translate }}</h4>
                <p class="text-sm text-gray-500 leading-relaxed">{{ 'PRIVACY.DATA_ACCOUNT_TEXT' | translate }}</p>
              </div>
              <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h4 class="font-black text-[#0a8f96] mb-3">{{ 'PRIVACY.DATA_INTERACTION_TITLE' | translate }}</h4>
                <p class="text-sm text-gray-500 leading-relaxed">{{ 'PRIVACY.DATA_INTERACTION_TEXT' | translate }}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div class="w-2 h-8 bg-gradient-to-b from-[#0a8f96] to-[#076b70] rounded-full"></div>
              {{ 'PRIVACY.USAGE_TITLE' | translate }}
            </h2>
            <ul class="space-y-4 text-gray-600 font-medium">
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-[#0a8f96] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                <span>{{ 'PRIVACY.USAGE_ITEM1' | translate }}</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-[#0a8f96] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                <span>{{ 'PRIVACY.USAGE_ITEM2' | translate }}</span>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-5 h-5 text-[#0a8f96] shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                <span>{{ 'PRIVACY.USAGE_ITEM3' | translate }}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div class="w-2 h-8 bg-gradient-to-b from-[#0a8f96] to-[#076b70] rounded-full"></div>
              {{ 'PRIVACY.PROTECTION_TITLE' | translate }}
            </h2>
            <p class="text-gray-600 leading-loose font-medium text-base">
              {{ 'PRIVACY.PROTECTION_TEXT' | translate }}
            </p>
          </section>

          <div class="pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p class="text-gray-400 text-sm font-bold">{{ 'PRIVACY.QUESTIONS' | translate }}</p>
            <a href="mailto:privacy@baytology.com" class="btn-luxury px-10 py-4">
              {{ 'PRIVACY.CONTACT_BTN' | translate }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PrivacyComponent {}
