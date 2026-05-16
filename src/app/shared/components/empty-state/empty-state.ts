import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-24 px-6 text-center animate-fade-in">
      <!-- Icon Container -->
      <div class="w-24 h-24 bg-gradient-to-br from-[#0a8f96]/10 to-[#0a8f96]/5 rounded-[32px] flex items-center justify-center text-[#0a8f96] mb-8 border border-[#0a8f96]/10 shadow-sm relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 12px 12px;"></div>
        <ng-content select="[icon]"></ng-content>
      </div>
      
      <!-- Content -->
      <h3 class="text-2xl font-black text-gray-900 mb-3 tracking-tight">{{ getTranslated(title, 'COMMON.EMPTY.TITLE') }}</h3>
      <p class="text-gray-400 font-bold text-sm mb-10 max-w-sm leading-relaxed">{{ getTranslated(message, 'COMMON.EMPTY.MESSAGE') }}</p>
      
      <!-- Action -->
      @if (actionText && actionRoute) {
        <a [routerLink]="actionRoute" class="bg-gradient-to-r from-[#0a8f96] to-[#076b70] text-white font-black px-10 py-4.5 rounded-2xl shadow-xl shadow-[#0a8f96]/20 hover:shadow-2xl hover:shadow-[#0a8f96]/30 hover:scale-105 active:scale-95 transition-all inline-block">
          {{ getTranslated(actionText) }}
        </a>
      } @else if (actionText) {
        <button (click)="actionClicked.emit()" class="bg-gradient-to-r from-[#0a8f96] to-[#076b70] text-white font-black px-10 py-4.5 rounded-2xl shadow-xl shadow-[#0a8f96]/20 hover:shadow-2xl hover:shadow-[#0a8f96]/30 hover:scale-105 active:scale-95 transition-all inline-block">
          {{ getTranslated(actionText) }}
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class EmptyStateComponent {
  private translate = inject(TranslateService);

  @Input() title?: string;
  @Input() message?: string;
  @Input() actionText?: string;
  @Input() actionRoute?: string;
  
  @Output() actionClicked = new EventEmitter<void>();

  getTranslated(value: string | undefined, defaultKey?: string): string {
    if (!value && defaultKey) {
      return this.translate.instant(defaultKey);
    }
    if (!value) return '';
    
    // If it looks like a translation key (uppercase with dots), try to translate it
    if (/^[A-Z0-9_]+\.[A-Z0-9_.]+$/.test(value)) {
      const translated = this.translate.instant(value);
      return translated !== value ? translated : value;
    }
    return value;
  }
}
