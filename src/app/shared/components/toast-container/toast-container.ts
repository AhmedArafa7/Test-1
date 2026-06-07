import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="fixed top-8 right-8 z-[9999] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="animate-slide-in pointer-events-auto group relative overflow-hidden rounded-[24px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border backdrop-blur-2xl flex items-start gap-4 transition-all hover:scale-[1.02]"
             [class]="getClass(toast.type)">
          <!-- Status Icon -->
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ring-1 ring-inset"
               [class]="getIconBg(toast.type)">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              @switch (toast.type) {
                @case ('success') {
                  <path d="M5 13l4 4L19 7"/>
                }
                @case ('error') {
                  <path d="M6 18L18 6M6 6l12 12"/>
                }
                @case ('warning') {
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                }
                @default {
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                }
              }
            </svg>
          </div>

          <div class="flex-1 pt-0.5">
            <p class="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">{{ getTitle(toast.type) }}</p>
            <p class="text-sm font-bold leading-relaxed">{{ toast.message }}</p>
          </div>

          <button (click)="toastService.remove(toast.id)" class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded-lg">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <!-- Progress Bar -->
          <div class="absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-progress"></div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  public toastService = inject(ToastService);
  private translate = inject(TranslateService);

  getClass(type: string): string {
    const base = 'border-white/20';
    switch (type) {
      case 'success': return `bg-white/95 text-emerald-900 ${base}`;
      case 'error': return `bg-white/95 text-rose-900 ${base}`;
      case 'warning': return `bg-white/95 text-amber-900 ${base}`;
      default: return `bg-white/95 text-slate-900 ${base}`;
    }
  }

  getIconBg(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20';
      case 'error': return 'bg-rose-500/10 text-rose-600 ring-rose-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-600 ring-amber-500/20';
      default: return 'bg-blue-500/10 text-blue-600 ring-blue-500/20';
    }
  }

  getTitle(type: string): string {
    switch (type) {
      case 'success': return this.translate.instant('COMMON.TOAST.SUCCESS');
      case 'error': return this.translate.instant('COMMON.TOAST.ERROR');
      case 'warning': return this.translate.instant('COMMON.TOAST.WARNING');
      default: return this.translate.instant('COMMON.TOAST.INFO');
    }
  }
}
