import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div [class]="'relative overflow-hidden ' + containerClass()">
      @if (type() === 'card') {
        <div class="bg-white rounded-[24px] overflow-hidden border border-gray-100/80 h-full relative shadow-sm">
          <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-50"></div>
          <div class="p-6 space-y-4">
            <div class="h-4 bg-gray-100 rounded-full w-3/4"></div>
            <div class="h-3 bg-gray-50 rounded-full w-1/2"></div>
            <div class="pt-4 border-t border-gray-50 flex justify-between">
              <div class="h-4 bg-gray-100 rounded-full w-1/4"></div>
              <div class="h-4 bg-gray-100 rounded-full w-1/4"></div>
            </div>
          </div>
          <!-- Shimmer Overlay -->
          <div class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        </div>
      } @else if (type() === 'list') {
        <div class="space-y-4 relative">
          @for (i of [1,2,3]; track i) {
            <div class="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100/80 relative overflow-hidden shadow-sm">
              <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl shrink-0"></div>
              <div class="flex-1 space-y-3 pt-2">
                <div class="h-3 bg-gray-100 rounded-full w-1/3"></div>
                <div class="h-4 bg-gray-50 rounded-full w-3/4"></div>
              </div>
              <div class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
            </div>
          }
        </div>
      } @else if (type() === 'text') {
        <div class="space-y-2 relative overflow-hidden py-2">
          <div class="h-4 bg-gray-100 rounded-full w-full"></div>
          <div class="h-4 bg-gray-50 rounded-full w-5/6"></div>
          <div class="h-4 bg-gray-100 rounded-full w-2/3"></div>
          <div class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        </div>
      } @else if (type() === 'circle') {
        <div class="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full relative overflow-hidden">
          <div class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  type = input<'card' | 'list' | 'text' | 'circle'>('card');
  containerClass = input('');
}
