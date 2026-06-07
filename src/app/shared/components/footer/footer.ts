import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <!-- Gradient Divider -->
    <div class="h-px bg-gradient-to-r from-transparent via-[#0a8f96]/30 to-transparent"></div>
    <!-- Gradient Divider -->
    <div class="h-1 bg-gradient-to-r from-transparent via-[#0a8f96] to-transparent"></div>
    <footer class="bg-gradient-to-b from-[#0c1222] to-[#080d18] font-sans relative overflow-hidden">
      <!-- Subtle Background Pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      <div class="max-w-[1400px] mx-auto px-6 py-20 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          <!-- Brand Section -->
          <div class="md:col-span-5">
            <a routerLink="/" class="flex items-center gap-2.5 mb-6 group">
              <img src="/Baytology_image.png" alt="Baytology" class="h-21 w-44 object-cover object-center transition-transform group-hover:scale-110 drop-shadow-md">
            </a>
            <p class="text-gray-400 text-sm leading-relaxed max-w-sm mb-8 font-medium">
              {{ 'FOOTER.DESC' | translate }}
            </p>
            <div class="flex gap-3">
              <a href="https://twitter.com/baytology" target="_blank" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-[#0a8f96] hover:text-white hover:border-[#0a8f96] hover:shadow-lg hover:shadow-[#0a8f96]/30 transition-all duration-300">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="https://instagram.com/baytology" target="_blank" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          <!-- Quick Links Section -->
          <div class="md:col-span-2">
            <h4 class="text-[10px] font-black text-[#0a8f96] uppercase tracking-[0.2em] mb-6">{{ 'FOOTER.QUICK_LINKS' | translate }}</h4>
            <div class="flex flex-col gap-4">
              <a routerLink="/properties" class="text-sm font-semibold text-gray-400 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-200">{{ 'NAV.BROWSE' | translate }}</a>
              <a routerLink="/ai/search" class="text-sm font-semibold text-gray-400 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-200">{{ 'NAV.AI_SEARCH' | translate }}</a>
              <a routerLink="/ai/recommendations" class="text-sm font-semibold text-gray-400 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-200">{{ 'NAV.RECOMMENDATIONS' | translate }}</a>
            </div>
          </div>

          <!-- Support Section -->
          <div class="md:col-span-2">
            <h4 class="text-[10px] font-black text-[#0a8f96] uppercase tracking-[0.2em] mb-6">{{ 'FOOTER.SUPPORT' | translate }}</h4>
            <div class="flex flex-col gap-4">
              <a routerLink="/faq" class="text-sm font-semibold text-gray-400 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-200">{{ 'FOOTER.HELP_CENTER' | translate }}</a>
              <a routerLink="/faq" class="text-sm font-semibold text-gray-400 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-200">{{ 'FOOTER.FAQ' | translate }}</a>
              <a routerLink="/privacy" class="text-sm font-semibold text-gray-400 hover:text-white hover:translate-x-1 rtl:hover:-translate-x-1 transition-all duration-200">{{ 'FOOTER.PRIVACY' | translate }}</a>
            </div>
          </div>

          <!-- Contact Section -->
          <div class="md:col-span-3">
            <h4 class="text-[10px] font-black text-[#0a8f96] uppercase tracking-[0.2em] mb-6">{{ 'FOOTER.CONTACT' | translate }}</h4>
            <div class="flex flex-col gap-4 text-sm font-semibold text-gray-400">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[#0a8f96]/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <span>support&#64;baytology.com</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[#0a8f96]/10 flex items-center justify-center">
                  <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <span>{{ 'FOOTER.LOCATION' | translate }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500">
          <p>{{ 'FOOTER.COPYRIGHT' | translate }}</p>
          <div class="flex gap-8 uppercase tracking-widest">
            <a routerLink="/about" class="hover:text-[#0a8f96] transition-colors">{{ 'FOOTER.ABOUT' | translate }}</a>
            <a routerLink="/ai/chatbot" class="hover:text-[#0a8f96] transition-colors">{{ 'FOOTER.CONTACT_US' | translate }}</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
