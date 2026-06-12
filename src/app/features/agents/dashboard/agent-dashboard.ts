import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService } from '../../profile/services/profile.service';
import { PropertyService } from '../../properties/services/property.service';
import { BookingService } from '../../bookings/services/booking.service';
import { AvailabilityService } from '../../availability/availability.service';
import { ConversationService } from '../../conversations/services/conversation.service';
import { PaginatedList } from '../../../core/models';
import { PropertyListItem } from '../../../core/models';
import { BookingListItem } from '../../../core/models';
import { AvailabilityRuleDto } from '../../../core/models/availability.models';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule, LocalizedDatePipe],
  template: `
    <div class="min-h-screen bg-[#f8fafc] font-sans pt-24 md:pt-28 pb-16 px-4 md:px-8">
      <div class="max-w-[1400px] mx-auto">
        
        <!-- Greeting -->
        <div class="flex items-center justify-between mb-12 ltr:text-left rtl:text-right">
          <div>
            <h1 class="text-3xl md:text-[40px] font-black text-gray-900 tracking-tight mb-2">
              {{ 'AGENT_DASHBOARD.WELCOME' | translate }} <span class="text-[#0a8f96]">{{ auth.currentUser()?.displayName || ('AGENT_DASHBOARD.AGENT' | translate) }}</span>
            </h1>
            <p class="text-slate-500 font-bold text-sm md:text-base">
              {{ 'AGENT_DASHBOARD.SUBTITLE' | translate }}
            </p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <!-- Properties -->
          <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8 group hover:border-[#0a8f96]/30 transition-all duration-500">
            <div class="flex items-start justify-between mb-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a8f96]/15 to-[#0a8f96]/5 flex items-center justify-center text-[#0a8f96] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
            </div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{{ 'AGENT_DASHBOARD.STATS.PROPERTIES' | translate }}</p>
            <p class="text-4xl font-black text-gray-900 tabular-nums">{{ propertiesCount() }}</p>
          </div>

          <!-- Total Bookings -->
          <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8 group hover:border-[#0a8f96]/30 transition-all duration-500">
            <div class="flex items-start justify-between mb-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
            </div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{{ 'AGENT_DASHBOARD.STATS.TOTAL_BOOKINGS' | translate }}</p>
            <p class="text-4xl font-black text-gray-900 tabular-nums">{{ totalBookings() }}</p>
          </div>

          <!-- Pending Bookings -->
          <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8 group hover:border-amber-300/30 transition-all duration-500">
            <div class="flex items-start justify-between mb-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center text-amber-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              @if (pendingBookings() > 0) {
                <span class="px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase tracking-tighter">{{ 'AGENT_DASHBOARD.STATS.ACTION_REQUIRED' | translate }}</span>
              }
            </div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{{ 'AGENT_DASHBOARD.STATS.PENDING' | translate }}</p>
            <p class="text-4xl font-black text-gray-900 tabular-nums">{{ pendingBookings() }}</p>
          </div>

          <!-- Availability Rules -->
          <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8 group hover:border-[#0a8f96]/30 transition-all duration-500">
            <div class="flex items-start justify-between mb-6">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
            </div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{{ 'AGENT_DASHBOARD.STATS.AVAILABILITY_RULES' | translate }}</p>
            <p class="text-4xl font-black text-gray-900 tabular-nums">{{ availabilityRulesCount() }}</p>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Recent Bookings (Left, 2 cols) -->
          <div class="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-xl font-black text-slate-800 flex items-center gap-3 ltr:text-left rtl:text-right">
                <span class="w-2 h-8 bg-[#0a8f96] rounded-full"></span>
                {{ 'AGENT_DASHBOARD.RECENT_BOOKINGS' | translate }}
              </h2>
              <a routerLink="/bookings" class="text-xs font-black text-[#0a8f96] hover:text-[#076b70] transition-colors">{{ 'AGENT_DASHBOARD.VIEW_ALL' | translate }}</a>
            </div>

            @if (loadingBookings()) {
              <div class="flex justify-center py-16">
                <div class="w-8 h-8 border-4 border-[#0a8f96] border-t-transparent rounded-full animate-spin"></div>
              </div>
            } @else if (recentBookings().length === 0) {
              <div class="text-center py-16">
                <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <p class="text-slate-400 font-bold text-sm">{{ 'AGENT_DASHBOARD.NO_BOOKINGS' | translate }}</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (b of recentBookings(); track b.id) {
                  <a [routerLink]="['/bookings', b.id]" class="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-[#0a8f96]/20 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer group">
                    <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img [src]="b.propertyPrimaryImageUrl || ''" [alt]="b.propertyTitle" class="w-full h-full object-cover" (error)="$event.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23e2e8f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 font-size=%2240%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22>N</text></svg>'">
                    </div>
                    <div class="flex-1 min-w-0 ltr:text-left rtl:text-right">
                      <p class="text-sm font-black text-slate-900 group-hover:text-[#0a8f96] transition-colors truncate">{{ b.propertyTitle }}</p>
                      <p class="text-xs font-bold text-slate-400 mt-0.5">{{ b.startDate | localizedDate:'short' }}</p>
                    </div>
                    <span [class]="b.status === 'Pending' ? 'bg-amber-50 text-amber-600' : b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'" 
                          class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0">
                      {{ ('BOOKINGS.STATUSES.' + b.status) | translate }}
                    </span>
                  </a>
                }
              </div>
            }
          </div>

          <!-- Right Sidebar -->
          <div class="flex flex-col gap-6">
            
            <!-- Quick Actions -->
            <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8">
              <h2 class="text-xl font-black text-slate-800 flex items-center gap-3 mb-6 ltr:text-left rtl:text-right">
                <span class="w-2 h-8 bg-[#0a8f96] rounded-full"></span>
                {{ 'AGENT_DASHBOARD.QUICK_ACTIONS' | translate }}
              </h2>
              <div class="space-y-3">
                <a routerLink="/properties/new" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div class="w-10 h-10 rounded-xl bg-[#0a8f96]/10 flex items-center justify-center text-[#0a8f96] group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </div>
                  <span class="text-sm font-bold text-slate-700 group-hover:text-[#0a8f96] transition-colors">{{ 'AGENT_DASHBOARD.ACTIONS.ADD_PROPERTY' | translate }}</span>
                </a>
                <a routerLink="/availability" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <span class="text-sm font-bold text-slate-700 group-hover:text-[#0a8f96] transition-colors">{{ 'AGENT_DASHBOARD.ACTIONS.MANAGE_AVAILABILITY' | translate }}</span>
                </a>
                <a routerLink="/conversations" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                  </div>
                  <span class="text-sm font-bold text-slate-700 group-hover:text-[#0a8f96] transition-colors">{{ 'AGENT_DASHBOARD.ACTIONS.VIEW_MESSAGES' | translate }}</span>
                </a>
                <a routerLink="/profile" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                  <span class="text-sm font-bold text-slate-700 group-hover:text-[#0a8f96] transition-colors">{{ 'AGENT_DASHBOARD.ACTIONS.VIEW_PROFILE' | translate }}</span>
                </a>
              </div>
            </div>

            <!-- Pending Actions -->
            @if (pendingBookings() > 0) {
              <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[24px] border border-amber-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </div>
                  <h3 class="text-sm font-black text-amber-800">{{ 'AGENT_DASHBOARD.PENDING_ACTIONS' | translate }}</h3>
                </div>
                <p class="text-xs font-bold text-amber-700 mb-4">{{ 'AGENT_DASHBOARD.PENDING_MSG' | translate:{ count: pendingBookings() } }}</p>
                <a routerLink="/bookings" class="block w-full text-center px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition-colors cursor-pointer">
                  {{ 'AGENT_DASHBOARD.VIEW_PENDING' | translate }}
                </a>
              </div>
            }

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class AgentDashboardComponent implements OnInit {
  private profileService = inject(ProfileService);
  private propertyService = inject(PropertyService);
  private bookingService = inject(BookingService);
  private availabilityService = inject(AvailabilityService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  auth = inject(AuthService);

  propertiesCount = signal(0);
  totalBookings = signal(0);
  pendingBookings = signal(0);
  availabilityRulesCount = signal(0);
  recentBookings = signal<BookingListItem[]>([]);
  loadingBookings = signal(true);

  async ngOnInit() {
    await this.loadDashboardData();
  }

  private async loadDashboardData() {
    try {
      const userId = this.auth.userId();
      if (!userId) return;

      const [properties, bookings, rules] = await Promise.allSettled([
        this.propertyService.getAll({ agentUserId: userId, pageSize: 1 }),
        this.bookingService.getMyBookings(1, 5),
        firstValueFrom(this.availabilityService.getRules())
      ]);

      if (properties.status === 'fulfilled') {
        this.propertiesCount.set(properties.value.totalCount);
      }

      if (bookings.status === 'fulfilled') {
        const allBookings = await this.bookingService.getMyBookings(1, 100).catch(() => ({ items: [], totalCount: 0 }));
        this.totalBookings.set(allBookings.totalCount);
        this.pendingBookings.set(allBookings.items.filter(b => b.status === 'Pending').length);
        this.recentBookings.set(bookings.value.items);
      }

      if (rules.status === 'fulfilled') {
        this.availabilityRulesCount.set(rules.value.length);
      }
    } catch {
      this.toast.error(this.translate.instant('AGENT_DASHBOARD.LOAD_ERROR'));
    } finally {
      this.loadingBookings.set(false);
    }
  }
}
