import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-white font-sans py-20 px-6" dir="rtl">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="mb-4">
            <span class="bg-gradient-to-r from-[#0a8f96]/10 to-[#0a8f96]/5 text-[#0a8f96] text-[10px] font-black tracking-[0.3em] uppercase px-6 py-2.5 rounded-full border border-[#0a8f96]/10">
              {{ 'FAQ.BADGE' | translate }}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            {{ 'FAQ.TITLE_START' | translate }} <span class="text-[#0a8f96]">{{ 'FAQ.TITLE_HIGHLIGHT' | translate }}</span>{{ 'FAQ.TITLE_END' | translate }}
          </h1>
          <p class="text-gray-500 text-sm font-medium">{{ 'FAQ.DESCRIPTION' | translate }}</p>
        </div>

        <!-- Role-based Tabs -->
        <div class="flex justify-center mb-12">
          <div class="bg-gray-100/80 backdrop-blur-md p-1.5 rounded-[24px] flex gap-1 border border-gray-200/50 shadow-inner">
            <button (click)="setTab('buyer')" 
                    [class]="activeTab() === 'buyer' ? 'bg-[#0a8f96] text-white shadow-md scale-[1.02]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'"
                    class="px-6 sm:px-8 py-3 rounded-[18px] text-sm font-black transition-all duration-300 flex items-center gap-2 active:scale-95">
              <span class="text-base">👤</span>
              <span>{{ 'FAQ.TABS.BUYER' | translate }}</span>
            </button>
            <button (click)="setTab('agent')" 
                    [class]="activeTab() === 'agent' ? 'bg-[#0a8f96] text-white shadow-md scale-[1.02]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'"
                    class="px-6 sm:px-8 py-3 rounded-[18px] text-sm font-black transition-all duration-300 flex items-center gap-2 active:scale-95">
              <span class="text-base">💼</span>
              <span>{{ 'FAQ.TABS.AGENT' | translate }}</span>
            </button>
            <button (click)="setTab('admin')" 
                    [class]="activeTab() === 'admin' ? 'bg-[#0a8f96] text-white shadow-md scale-[1.02]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'"
                    class="px-6 sm:px-8 py-3 rounded-[18px] text-sm font-black transition-all duration-300 flex items-center gap-2 active:scale-95">
              <span class="text-base">🛡️</span>
              <span>{{ 'FAQ.TABS.ADMIN' | translate }}</span>
            </button>
          </div>
        </div>

        <!-- FAQ Items -->
        <div class="space-y-4">
          @for (item of getActiveFaqs(); track $index) {
            <div class="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <button (click)="toggle($index)"
                      class="w-full px-8 py-7 flex items-center justify-between text-right group">
                <span class="text-lg font-black text-gray-900 group-hover:text-[#0a8f96] transition-colors">{{ item.q | translate }}</span>
                <div class="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center transition-all group-hover:bg-[#0a8f96]/10 group-hover:text-[#0a8f96]"
                     [class.rotate-180]="openIndex() === $index">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </button>

              @if (openIndex() === $index) {
                <div class="px-8 pb-8 animate-[fadeIn_0.3s_ease]">
                  <p class="text-gray-500 leading-loose font-medium text-base pt-4 border-t border-gray-50">
                    {{ item.a | translate }}
                  </p>
                </div>
              }
            </div>
          }
        </div>

        <!-- Still Need Help? -->
        <div class="mt-16 bg-gradient-to-br from-[#0a8f96] via-[#0a8f96] to-[#076b70] rounded-[32px] p-10 md:p-12 text-center text-white relative overflow-hidden">
          <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 20px 20px;"></div>
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <h3 class="text-2xl font-black mb-4 relative z-10">{{ 'FAQ.HELP_TITLE' | translate }}</h3>
          <p class="text-white/70 font-medium mb-8 max-w-lg mx-auto relative z-10">
            {{ 'FAQ.HELP_DESC' | translate }}
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a routerLink="/ai/chatbot" class="w-full sm:w-auto bg-white text-[#0a8f96] font-black px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95">{{ 'FAQ.HELP_CHAT_BTN' | translate }}</a>
            <a href="mailto:mo1999382@gmail.com" class="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 font-black px-10 py-4 rounded-2xl hover:bg-white/20 transition-all">{{ 'FAQ.HELP_EMAIL_BTN' | translate }}</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FaqComponent implements OnInit {
  auth = inject(AuthService);
  activeTab = signal<'buyer' | 'agent' | 'admin'>('buyer');
  openIndex = signal<number | null>(0);

  faqs = {
    buyer: [
      { q: 'FAQ.BUYER.Q1', a: 'FAQ.BUYER.A1' },
      { q: 'FAQ.BUYER.Q2', a: 'FAQ.BUYER.A2' },
      { q: 'FAQ.BUYER.Q3', a: 'FAQ.BUYER.A3' },
      { q: 'FAQ.BUYER.Q4', a: 'FAQ.BUYER.A4' },
      { q: 'FAQ.BUYER.Q5', a: 'FAQ.BUYER.A5' }
    ],
    agent: [
      { q: 'FAQ.AGENT.Q1', a: 'FAQ.AGENT.A1' },
      { q: 'FAQ.AGENT.Q2', a: 'FAQ.AGENT.A2' },
      { q: 'FAQ.AGENT.Q3', a: 'FAQ.AGENT.A3' },
      { q: 'FAQ.AGENT.Q4', a: 'FAQ.AGENT.A4' },
      { q: 'FAQ.AGENT.Q5', a: 'FAQ.AGENT.A5' }
    ],
    admin: [
      { q: 'FAQ.ADMIN.Q1', a: 'FAQ.ADMIN.A1' },
      { q: 'FAQ.ADMIN.Q2', a: 'FAQ.ADMIN.A2' },
      { q: 'FAQ.ADMIN.Q3', a: 'FAQ.ADMIN.A3' },
      { q: 'FAQ.ADMIN.Q4', a: 'FAQ.ADMIN.A4' },
      { q: 'FAQ.ADMIN.Q5', a: 'FAQ.ADMIN.A5' }
    ]
  };

  ngOnInit() {
    if (this.auth.isAdmin()) {
      this.activeTab.set('admin');
    } else if (this.auth.isAgent()) {
      this.activeTab.set('agent');
    } else {
      this.activeTab.set('buyer');
    }
  }

  getActiveFaqs() {
    return this.faqs[this.activeTab()];
  }

  setTab(tab: 'buyer' | 'agent' | 'admin') {
    this.activeTab.set(tab);
    this.openIndex.set(0);
  }

  toggle(index: number) {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }
}

