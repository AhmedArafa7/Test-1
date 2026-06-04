import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { UserSummary } from '../../../core/models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ToastService } from '../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [LoadingSpinnerComponent, FormsModule, TranslateModule, CommonModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h1 class="text-3xl font-black text-gray-900 flex items-center gap-4 mb-2">
            {{ 'ADMIN.USERS.TITLE' | translate }}
          </h1>
          <p class="text-gray-400 font-bold text-sm">{{ 'ADMIN.USERS.SUBTITLE' | translate }}</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button (click)="loadUsers()" [title]="'COMMON.REFRESH' | translate" class="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-[#0a8f96] transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.USERS.STATS_TOTAL' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ filteredUsers().length }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-up">{{ 'ADMIN.USERS.STATUS.ACTIVE' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.USERS.STATS_ACTIVE' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ activeUsersCount() }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span class="badge-trend badge-trend-neutral">{{ 'ADMIN.USERS.STATUS.VERIFIED' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.USERS.STATS_CONFIRMED' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ confirmedUsersCount() }}</p>
        </div>

        <div class="admin-card p-8 group hover:border-[#0a8f96]/30 transition-all">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
            <span class="badge-trend badge-trend-neutral">{{ 'ADMIN.USERS.ROLES.ADMIN' | translate }}</span>
          </div>
          <p class="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1">{{ 'ADMIN.USERS.STATS_ADMINS' | translate }}</p>
          <p class="text-3xl font-black text-gray-900 tabular-nums">{{ adminUsersCount() }}</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <app-loading-spinner />
          <p class="text-gray-400 font-bold mt-4">{{ 'ADMIN.USERS.LOADING' | translate }}</p>
        </div>
      } @else {
        <div class="admin-table-container rounded-[32px] !border-none shadow-sm overflow-hidden bg-white">
          <table class="admin-table">
            <thead>
              <tr>
                <th class="w-[25%] text-start">{{ 'ADMIN.USERS.TABLE.USER' | translate }}</th>
                <th class="w-[20%] text-start">{{ 'ADMIN.USERS.TABLE.ROLES' | translate }}</th>
                <th class="w-[20%] text-start">{{ 'ADMIN.USERS.TABLE.VERIFIED' | translate }}</th>
                <th class="w-[15%] text-start">{{ 'ADMIN.USERS.TABLE.STATUS' | translate }}</th>
                <th class="w-[20%] text-center">{{ 'ADMIN.USERS.TABLE.ACTIONS' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (u of filteredUsers(); track u.userId; let i = $index) {
                <tr class="group">
                  <td class="text-start">
                    <div class="flex items-center gap-4">
                      <div class="admin-avatar shrink-0" [style.background]="['#f1f5f9', '#f0f9f9', '#fef2f2', '#f0fdf4'][i % 4]" 
                           [style.color]="['#475569', '#0a8f96', '#dc2626', '#16a34a'][i % 4]">
                        {{ u.email.substring(0, 2).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-black text-gray-900 leading-tight truncate">{{ u.email.split('@')[0] }}</p>
                        <p class="text-[11px] font-bold text-gray-400 mt-1 truncate">{{ u.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="flex flex-wrap gap-1.5">
                      @for (role of u.roles; track role) {
                        <span class="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-black border border-gray-100/50 uppercase">
                          {{ 'ADMIN.USERS.ROLES.' + role.toUpperCase() | translate }}
                        </span>
                      }
                    </div>
                  </td>
                  <td>
                    <span [class]="u.emailConfirmed ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-100' : 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 border border-orange-100'" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                      {{ (u.emailConfirmed ? 'ADMIN.USERS.STATUS.VERIFIED' : 'ADMIN.USERS.STATUS.NOT_VERIFIED') | translate }}
                    </span>
                  </td>
                  <td>
                    <span [class]="u.isActive ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-100' : 'bg-gradient-to-br from-red-100 to-red-50 text-red-600 border border-red-100'" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                      {{ (u.isActive ? 'ADMIN.USERS.STATUS.ACTIVE' : 'ADMIN.USERS.STATUS.DISABLED') | translate }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center justify-center gap-3">
                      <button (click)="toggleStatus(u)" class="p-2 text-gray-300 hover:text-[#0a8f96] transition-colors" [title]="(u.isActive ? 'ADMIN.USERS.ACTIONS.DISABLE' : 'ADMIN.USERS.ACTIONS.ENABLE') | translate">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                      </button>
                      <select (change)="assignRole(u.userId, $event)" class="bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0a8f96]/20 transition-all">
                        <option value="">{{ 'ADMIN.USERS.ACTIONS.CHANGE_ROLE' | translate }}</option>
                        <option value="Buyer">{{ 'ADMIN.USERS.ROLES.BUYER' | translate }}</option>
                        <option value="Agent">{{ 'ADMIN.USERS.ROLES.AGENT' | translate }}</option>
                        <option value="Admin">{{ 'ADMIN.USERS.ROLES.ADMIN' | translate }}</option>
                      </select>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          <!-- Pagination -->
          <div class="p-8 border-t border-gray-50 flex items-center justify-between bg-white">
            <p class="text-xs font-bold text-gray-400">{{ 'ADMIN.USERS.TABLE.COUNT' | translate:{ count: filteredUsers().length } }}</p>
            <div class="flex items-center gap-1">
              <button class="pagination-modern-item pagination-modern-inactive hover:bg-gray-50"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
              <button class="pagination-modern-item pagination-modern-active">1</button>
              <button class="pagination-modern-item pagination-modern-inactive hover:bg-gray-50"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class UsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  users = signal<UserSummary[]>([]); 
  filteredUsers = computed(() => {
    const term = this.adminService.globalSearchTerm()?.toLowerCase();
    if (!term) return this.users();
    return this.users().filter(u => 
      u.email.toLowerCase().includes(term) || 
      u.roles.some(r => r.toLowerCase().includes(term)) ||
      (u.email.split('@')[0].toLowerCase().includes(term))
    );
  });
  loading = signal(true);
  activeUsersCount = computed(() => this.filteredUsers().filter(u => u.isActive).length);
  confirmedUsersCount = computed(() => this.filteredUsers().filter(u => u.emailConfirmed).length);
  adminUsersCount = computed(() => this.filteredUsers().filter(u => u.roles.includes('Admin')).length);

  async ngOnInit() { await this.loadUsers(); }

  async loadUsers() { 
    this.loading.set(true); 
    try { 
      const res = await this.adminService.getUsers();
      this.users.set(res); 
    } catch {
      this.users.set([]);
    } finally { 
      this.loading.set(false); 
    } 
  }

  async toggleStatus(u: UserSummary) { 
    try { 
      await this.adminService.toggleUserStatus(u.userId, { isActive: !u.isActive }); 
      this.toast.success(this.translate.instant('ADMIN.USERS.SUCCESS_UPDATE')); 
      this.loadUsers(); 
    } catch (e: any) { 
      this.toast.error(e?.error?.detail || this.translate.instant('ADMIN.USERS.ERROR_UPDATE')); 
    } 
  }

  async assignRole(userId: string, e: Event) { 
    const role = (e.target as HTMLSelectElement).value; 
    if (!role) return; 
    try { 
      await this.adminService.assignRole(userId, { role }); 
      const roleName = this.translate.instant(`ADMIN.USERS.ROLES.${role.toUpperCase()}`);
      this.toast.success(this.translate.instant('ADMIN.USERS.SUCCESS_ROLE', { role: roleName })); 
      this.loadUsers(); 
    } catch (er: any) { 
      this.toast.error(er?.error?.detail || this.translate.instant('ADMIN.USERS.ERROR_ROLE')); 
    } 
  }
}
