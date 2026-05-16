import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-center gap-1.5 mt-8">
      <button (click)="pageChange.emit(currentPage() - 1)" [disabled]="currentPage() <= 1"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent">
        <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
      </button>
      @for (page of pages(); track page) {
        <button (click)="pageChange.emit(page)"
          [class]="page === currentPage() 
            ? 'w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm bg-[#0a8f96] text-white shadow-lg shadow-[#0a8f96]/25 scale-105' 
            : 'w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all'">
          {{ page }}
        </button>
      }
      <button (click)="pageChange.emit(currentPage() + 1)" [disabled]="currentPage() >= totalPages()"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent">
        <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  `,
})
export class PaginationComponent {
  currentPage = input(1);
  totalPages = input(1);
  pageChange = output<number>();

  pages = () => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
}
