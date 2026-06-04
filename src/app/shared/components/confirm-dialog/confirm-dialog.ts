import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    @if (confirmService.state(); as s) {
      <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in" (click)="onBackdropClick($event)">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

        <!-- Dialog -->
        <div class="relative bg-white rounded-[28px] shadow-[0_25px_70px_rgba(0,0,0,0.18)] border border-slate-100 max-w-md w-full p-8 animate-scale-in"
             role="alertdialog" aria-modal="true">
          <!-- Icon -->
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto"
               [class.bg-rose-50]="s.variant === 'danger'"
               [class.text-rose-500]="s.variant === 'danger'"
               [class.bg-[#0a8f96]\\/10]="s.variant === 'primary'"
               [class.text-\\[\\#0a8f96\\]]="s.variant === 'primary'">
            @if (s.variant === 'danger') {
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
              </svg>
            } @else {
              <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
          </div>

          <!-- Title -->
          <h3 class="text-xl font-black text-slate-900 text-center mb-3 leading-tight">{{ s.title }}</h3>

          <!-- Message -->
          <p class="text-sm font-bold text-slate-500 text-center leading-relaxed mb-7">{{ s.message }}</p>

          <!-- Actions -->
          <div class="flex flex-col-reverse sm:flex-row gap-3">
            <button type="button"
                    (click)="onCancel()"
                    class="flex-1 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black transition-all active:scale-95">
              {{ s.cancelText }}
            </button>
            <button type="button"
                    (click)="onConfirm()"
                    [class]="s.variant === 'danger'
                      ? 'flex-1 px-5 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-black shadow-lg shadow-rose-500/25 transition-all active:scale-95'
                      : 'flex-1 px-5 py-3.5 rounded-2xl bg-[#0a8f96] hover:bg-[#076b70] text-white text-sm font-black shadow-lg shadow-[#0a8f96]/25 transition-all active:scale-95'">
              {{ s.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.18s ease-out; }
    .animate-scale-in { animation: scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
  `]
})
export class ConfirmDialogComponent {
  public confirmService = inject(ConfirmService);

  onConfirm() {
    this.confirmService.resolve(true);
  }

  onCancel() {
    this.confirmService.resolve(false);
  }

  onBackdropClick(event: MouseEvent) {
    // Only close if clicking the backdrop itself, not the dialog
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.onCancel();
    }
  }
}
