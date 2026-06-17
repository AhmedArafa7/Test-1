import { Component, signal, inject, DestroyRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AvailabilityService } from './availability.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractApiError } from '../../core/utils/api-error';
import { ConfirmService } from '../../core/services/confirm.service';
import { AvailabilityRuleDto, RecurrenceType } from '../../core/models';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-black text-slate-900 mb-8 ltr:text-left rtl:text-right">
        {{ 'AVAILABILITY.TITLE' | translate }}
      </h1>

      <!-- Add Rule Form -->
      <div class="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm mb-8">
        <h2 class="text-lg font-black text-slate-800 mb-6">{{ 'AVAILABILITY.ADD_RULE' | translate }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Recurrence Type -->
          <div class="md:col-span-2">
            <label class="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">{{ 'AVAILABILITY.RECURRENCE' | translate }}</label>
            <div class="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
              @for (opt of recurrenceOptions; track opt.value) {
                <button type="button"
                        (click)="newRecurrence.set(opt.value)"
                        [class.bg-white]="newRecurrence() === opt.value"
                        [class.shadow-sm]="newRecurrence() === opt.value"
                        [class.text-[#0a8f96]]="newRecurrence() === opt.value"
                        [class.text-slate-500]="newRecurrence() !== opt.value"
                        class="px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer">
                  {{ opt.label }}
                </button>
              }
            </div>
          </div>

          <!-- Day of Week (only for Weekly) -->
          @if (newRecurrence() === 'Weekly') {
            <div>
              <label class="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">{{ 'AVAILABILITY.DAY_OF_WEEK' | translate }}</label>
              <div class="flex gap-1.5 flex-wrap">
                @for (day of dayOptions; track day.value) {
                  <button type="button"
                          (click)="newDayOfWeek.set(day.value)"
                          [class.bg-[#0a8f96]]="newDayOfWeek() === day.value"
                          [class.text-white]="newDayOfWeek() === day.value"
                          [class.bg-slate-100]="newDayOfWeek() !== day.value"
                          [class.text-slate-600]="newDayOfWeek() !== day.value"
                          class="w-10 h-10 rounded-xl text-xs font-black transition-all cursor-pointer border border-transparent hover:border-[#0a8f96]/30">
                    {{ day.label.substring(0, 2) }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Specific Date (only for None / Single Date) -->
          @if (newRecurrence() === 'None') {
            <div>
              <label class="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">{{ 'AVAILABILITY.DATE' | translate }}</label>
              <input type="date" [ngModel]="newSpecificDate()" (ngModelChange)="newSpecificDate.set($event)"
                     class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96]/30 focus:ring-2 focus:ring-[#0a8f96]/10 transition-all outline-none">
            </div>
          }

          <!-- Start Time -->
          <div>
            <label class="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">{{ 'AVAILABILITY.START_TIME' | translate }}</label>
            <input type="time" [ngModel]="newStartTime()" (ngModelChange)="newStartTime.set($event)"
                   class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96]/30 focus:ring-2 focus:ring-[#0a8f96]/10 transition-all outline-none">
          </div>

          <!-- End Time -->
          <div>
            <label class="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">{{ 'AVAILABILITY.END_TIME' | translate }}</label>
            <input type="time" [ngModel]="newEndTime()" (ngModelChange)="newEndTime.set($event)"
                   class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96]/30 focus:ring-2 focus:ring-[#0a8f96]/10 transition-all outline-none">
          </div>

          <!-- Slot Duration -->
          <div>
            <label class="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wide">{{ 'AVAILABILITY.SLOT_DURATION' | translate }}</label>
            <select [ngModel]="newSlotDuration()" (ngModelChange)="newSlotDuration.set($event)"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:bg-white focus:border-[#0a8f96]/30 focus:ring-2 focus:ring-[#0a8f96]/10 transition-all outline-none">
              <option value="00:15:00">{{ 'AVAILABILITY.DUR_15' | translate }}</option>
              <option value="00:30:00">{{ 'AVAILABILITY.DUR_30' | translate }}</option>
              <option value="01:00:00">{{ 'AVAILABILITY.DUR_60' | translate }}</option>
              <option value="02:00:00">{{ 'AVAILABILITY.DUR_120' | translate }}</option>
            </select>
          </div>
        </div>

        <button (click)="addRule()" [disabled]="submitting()"
                class="mt-6 w-full py-3 rounded-xl font-black text-white bg-[#0a8f96] hover:bg-[#076b70] disabled:opacity-40 transition-all shadow-lg shadow-[#0a8f96]/20 flex items-center justify-center gap-2 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          <span>{{ 'AVAILABILITY.ADD_BTN' | translate }}</span>
        </button>
      </div>

      <!-- Current Rules -->
      <div class="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm">
        <h2 class="text-lg font-black text-slate-800 mb-6">{{ 'AVAILABILITY.CURRENT_RULES' | translate }}</h2>

        @if (loading()) {
          <div class="flex items-center justify-center py-8">
            <div class="w-8 h-8 border-2 border-[#0a8f96] border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (rules().length === 0) {
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p class="text-sm font-bold text-amber-800">{{ 'AVAILABILITY.ALL_DELETED_WARNING' | translate }}</p>
          </div>
          <div class="text-center py-8">
            <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-sm font-bold text-slate-400">{{ 'AVAILABILITY.NO_RULES' | translate }}</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (rule of rules(); track rule.id) {
              <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 ltr:flex-row rtl:flex-row-reverse">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-[#0a8f96]/10 flex items-center justify-center">
                    <svg class="w-4 h-4 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-black text-slate-800">
                      {{ getRecurrenceLabel(rule.recurrenceType) }}
                      @if (rule.recurrenceType === 'Weekly' && rule.dayOfWeek !== undefined) {
                        {{ dayOptions[rule.dayOfWeek]?.label }}
                      } @else if (rule.recurrenceType === 'None' && rule.specificDate) {
                        {{ rule.specificDate }}
                      }
                    </p>
                    <p class="text-xs font-bold text-slate-500 mt-0.5">
                      {{ rule.startTime.substring(0, 5) }} — {{ rule.endTime.substring(0, 5) }}
                      · {{ formatSlotDuration(rule.slotDuration) }}
                      @if (rule.propertyId) {
                        · {{ 'AVAILABILITY.FOR_PROPERTY' | translate }}
                      }
                    </p>
                  </div>
                </div>
                <button (click)="deleteRule(rule)" class="w-9 h-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 bg-white flex items-center justify-center transition-all cursor-pointer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AvailabilityComponent implements OnInit {
  private availabilityService = inject(AvailabilityService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  rules = signal<AvailabilityRuleDto[]>([]);
  loading = signal(false);
  submitting = signal(false);

  newRecurrence = signal<RecurrenceType>('Daily');
  newDayOfWeek = signal<number | undefined>(undefined);
  newSpecificDate = signal('');
  newStartTime = signal('09:00');
  newEndTime = signal('17:00');
  newSlotDuration = signal('00:30:00');

  recurrenceOptions = [
    { value: 'Daily' as RecurrenceType, label: this.translate.instant('AVAILABILITY.DAILY') },
    { value: 'Weekly' as RecurrenceType, label: this.translate.instant('AVAILABILITY.WEEKLY') },
    { value: 'None' as RecurrenceType, label: this.translate.instant('AVAILABILITY.SINGLE_DATE') },
  ];

  dayOptions = [
    { value: 0, label: this.translate.instant('AVAILABILITY.SUN') },
    { value: 1, label: this.translate.instant('AVAILABILITY.MON') },
    { value: 2, label: this.translate.instant('AVAILABILITY.TUE') },
    { value: 3, label: this.translate.instant('AVAILABILITY.WED') },
    { value: 4, label: this.translate.instant('AVAILABILITY.THU') },
    { value: 5, label: this.translate.instant('AVAILABILITY.FRI') },
    { value: 6, label: this.translate.instant('AVAILABILITY.SAT') },
  ];

  ngOnInit() {
    this.loadRules();
  }

  private loadRules() {
    this.loading.set(true);
    const sub = this.availabilityService.getRules().subscribe({
      next: (data) => {
        this.rules.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error(this.translate.instant('AVAILABILITY.LOAD_ERROR'));
        this.loading.set(false);
      },
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  async addRule() {
    const userId = this.auth.userId();
    if (!userId) {
      this.toast.error(this.translate.instant('AVAILABILITY.AUTH_ERROR'));
      return;
    }

    if (!this.newStartTime() || !this.newEndTime()) {
      this.toast.error(this.translate.instant('AVAILABILITY.TIME_REQUIRED'));
      return;
    }

    if (this.newRecurrence() === 'None' && !this.newSpecificDate()) {
      this.toast.error(this.translate.instant('AVAILABILITY.DATE_REQUIRED'));
      return;
    }

    if (this.newRecurrence() === 'Weekly' && this.newDayOfWeek() === undefined) {
      this.toast.error(this.translate.instant('AVAILABILITY.DAY_REQUIRED'));
      return;
    }

    if (this.newStartTime() >= this.newEndTime()) {
      this.toast.error(this.translate.instant('AVAILABILITY.TIME_INVALID'));
      return;
    }

    this.submitting.set(true);
    const rule: any = {
      agentUserId: userId,
      recurrenceType: this.newRecurrence(),
      startTime: this.newStartTime() + ':00',
      endTime: this.newEndTime() + ':00',
      slotDuration: this.newSlotDuration(),
    };

    if (this.newRecurrence() === 'Weekly' && this.newDayOfWeek() !== undefined) {
      rule.dayOfWeek = this.newDayOfWeek();
    }

    if (this.newRecurrence() === 'None' && this.newSpecificDate()) {
      rule.specificDate = this.newSpecificDate();
    }

    const sub = this.availabilityService.createRule(rule).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('AVAILABILITY.ADD_SUCCESS'));
        this.submitting.set(false);
        this.newRecurrence.set('Daily');
        this.newDayOfWeek.set(undefined);
        this.newSpecificDate.set('');
        this.newStartTime.set('09:00');
        this.newEndTime.set('17:00');
        this.newSlotDuration.set('00:30:00');
        this.loadRules();
      },
      error: (e: any) => {
        const extracted = extractApiError(e, this.translate);
        if (extracted) { this.toast.error(extracted); this.submitting.set(false); return; }
        this.toast.error(this.translate.instant('AVAILABILITY.ADD_ERROR'));
        this.submitting.set(false);
      },
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  async deleteRule(rule: AvailabilityRuleDto) {
    const ok = await this.confirmService.ask({
      title: this.translate.instant('AVAILABILITY.DELETE_CONFIRM_TITLE'),
      message: this.translate.instant('AVAILABILITY.DELETE_CONFIRM_MSG'),
      confirmText: this.translate.instant('COMMON.DELETE'),
      cancelText: this.translate.instant('COMMON.CANCEL'),
      variant: 'danger',
    });
    if (!ok) return;

    const sub = this.availabilityService.deleteRule(rule.id).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('AVAILABILITY.DELETE_SUCCESS'));
        this.loadRules();
      },
      error: (e: any) => {
        const extracted = extractApiError(e, this.translate);
        if (extracted) { this.toast.error(extracted); return; }
        this.toast.error(this.translate.instant('AVAILABILITY.DELETE_ERROR'));
      },
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  getRecurrenceLabel(type: RecurrenceType): string {
    const map: Record<RecurrenceType, string> = {
      Daily: this.translate.instant('AVAILABILITY.DAILY'),
      Weekly: this.translate.instant('AVAILABILITY.WEEKLY'),
      None: this.translate.instant('AVAILABILITY.SINGLE_DATE'),
    };
    return map[type];
  }

  formatSlotDuration(duration: string): string {
    const parts = duration.split(':');
    if (parts.length === 3) {
      const h = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      if (h > 0 && m > 0) return `${h}${this.translate.instant('AVAILABILITY.HOUR_ABBR')} ${m}${this.translate.instant('AVAILABILITY.MINUTE_ABBR')}`;
      if (h > 0) return `${h}${this.translate.instant('AVAILABILITY.HOUR_ABBR')}`;
      if (m > 0) return `${m} ${this.translate.instant('AVAILABILITY.MIN')}`;
    }
    return duration;
  }
}
