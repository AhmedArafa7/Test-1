import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-white font-sans overflow-hidden" dir="rtl">
      <!-- Hero Section -->
      <section class="relative py-24 px-6 bg-gradient-to-b from-[#f8f9fa] to-white">
        <div class="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="relative z-10">
            <div class="mb-6">
              <span class="bg-gradient-to-r from-[#0a8f96]/10 to-[#0a8f96]/5 text-[#0a8f96] text-[10px] font-black tracking-[0.3em] uppercase px-6 py-2.5 rounded-full border border-[#0a8f96]/10">
                {{ 'ABOUT.BADGE' | translate }}
              </span>
            </div>
            <h1 class="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-tight mb-8">
              {{ 'ABOUT.HERO_TITLE_START' | translate }} <span class="text-[#0a8f96]">{{ 'ABOUT.HERO_TITLE_HIGHLIGHT' | translate }}</span> {{ 'ABOUT.HERO_TITLE_END' | translate }}
            </h1>
            <p class="text-gray-500 text-lg md:text-xl leading-loose font-medium max-w-xl mb-10">
              {{ 'ABOUT.HERO_DESC' | translate }}
            </p>
            <div class="flex flex-wrap gap-6">
              <div class="text-center">
                <p class="text-4xl font-black text-gray-900">+10k</p>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ 'ABOUT.STAT_PROPERTIES' | translate }}</p>
              </div>
              <div class="w-px h-12 bg-gray-200 hidden md:block"></div>
              <div class="text-center">
                <p class="text-4xl font-black text-gray-900">98%</p>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ 'ABOUT.STAT_ACCURACY' | translate }}</p>
              </div>
              <div class="w-px h-12 bg-gray-200 hidden md:block"></div>
              <div class="text-center">
                <p class="text-4xl font-black text-gray-900">+500</p>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ 'ABOUT.STAT_AGENTS' | translate }}</p>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="absolute -top-12 -right-12 w-64 h-64 bg-[#0a8f96]/10 rounded-full blur-3xl animate-pulse"></div>
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                 class="relative z-10 w-full h-[500px] object-cover rounded-[32px] shadow-2xl border-4 border-white/80">
          </div>
        </div>
      </section>

      <!-- Vision & Mission -->
      <section class="py-32 px-6">
        <div class="max-w-4xl mx-auto space-y-24">
          <div class="text-center">
            <h2 class="text-3xl font-black text-gray-900 mb-6">{{ 'ABOUT.VISION_TITLE' | translate }}</h2>
            <p class="text-gray-500 text-lg leading-loose font-medium">
              {{ 'ABOUT.VISION_TEXT' | translate }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-10 rounded-[32px] text-center group hover:bg-gradient-to-br hover:from-[#0a8f96] hover:to-[#076b70] transition-all duration-500 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#0a8f96]/10">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <h4 class="font-black text-gray-900 mb-3 group-hover:text-white">{{ 'ABOUT.PILLAR_SPEED_TITLE' | translate }}</h4>
              <p class="text-sm text-gray-500 group-hover:text-white/70 leading-relaxed">{{ 'ABOUT.PILLAR_SPEED_DESC' | translate }}</p>
            </div>

            <div class="bg-white p-10 rounded-[32px] text-center group hover:bg-gradient-to-br hover:from-[#0a8f96] hover:to-[#076b70] transition-all duration-500 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#0a8f96]/10">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h4 class="font-black text-gray-900 mb-3 group-hover:text-white">{{ 'ABOUT.PILLAR_TRUST_TITLE' | translate }}</h4>
              <p class="text-sm text-gray-500 group-hover:text-white/70 leading-relaxed">{{ 'ABOUT.PILLAR_TRUST_DESC' | translate }}</p>
            </div>

            <div class="bg-white p-10 rounded-[32px] text-center group hover:bg-gradient-to-br hover:from-[#0a8f96] hover:to-[#076b70] transition-all duration-500 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#0a8f96]/10">
              <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              </div>
              <h4 class="font-black text-gray-900 mb-3 group-hover:text-white">{{ 'ABOUT.PILLAR_SMART_TITLE' | translate }}</h4>
              <p class="text-sm text-gray-500 group-hover:text-white/70 leading-relaxed">{{ 'ABOUT.PILLAR_SMART_DESC' | translate }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer CTA -->
      <section class="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-900 to-[#0a8f96]/20 text-center relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px;"></div>
        <div class="relative z-10 max-w-2xl mx-auto">
          <h2 class="text-4xl font-black text-white mb-8">{{ 'ABOUT.CTA_TITLE' | translate }}</h2>
          <a routerLink="/auth/register" class="btn-luxury px-12 py-5 text-lg">{{ 'ABOUT.CTA_BTN' | translate }}</a>
        </div>
      </section>
    </div>
  `,
})
export class AboutComponent {}
