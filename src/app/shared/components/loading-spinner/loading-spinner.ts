import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-20 gap-6">
      <div class="relative w-16 h-16">
        <!-- Outer Ring -->
        <div class="absolute inset-0 border-4 border-[#0a8f96]/5 rounded-full"></div>
        <!-- Inner Spinning Ring -->
        <div class="absolute inset-0 border-4 border-transparent border-t-[#0a8f96] rounded-full animate-spin" style="box-shadow: 0 0 20px rgba(10,143,150,0.15);"></div>
        <!-- Secondary Ring (counter-spin) -->
        <div class="absolute inset-2 border-2 border-transparent border-b-[#12b5bd]/40 rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
        <!-- Pulse Core -->
        <div class="absolute inset-5 bg-gradient-to-br from-[#0a8f96]/20 to-[#0a8f96]/5 rounded-full animate-pulse"></div>
      </div>
      @if (message()) {
        <div class="flex flex-col items-center gap-2">
          <p class="text-[10px] font-black text-[#0a8f96] uppercase tracking-[0.4em] animate-pulse">{{ message() }}</p>
          <div class="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#0a8f96]/30 to-transparent"></div>
        </div>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  message = input('');
}
