import { Component, signal, inject, computed } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen relative flex items-center justify-center overflow-hidden font-sans selection:bg-[#0c7379]/20 bg-slate-900">

      <div [class]="bgLoaded() ? 'opacity-0' : 'opacity-100'"
           class="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center filter blur-xl scale-110"
           style="background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=10');"></div>

      <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
           (load)="bgLoaded.set(true)"
           class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
           [class]="bgLoaded() ? 'opacity-100' : 'opacity-0'">

      <div class="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"></div>

      <main class="relative z-10 w-full px-4 animate-scale-in" style="max-width: 560px;">
        <div class="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_25px_60px_rgba(0,0,0,0.12)] rounded-4xl px-8 sm:px-10 py-8 sm:py-10 relative overflow-hidden transition-all duration-300">

          <!-- Logo + Title -->
          <div class="flex flex-col items-center select-none mb-8">
            <img src="/Baytology_image.png" alt="Baytology" class="h-24 w-36 object-contain transition-transform duration-500 hover:scale-105">
            <div class="text-center mt-2">
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ 'AUTH.REGISTER.TITLE' | translate }}</h1>
              <p class="text-sm font-bold text-slate-400 mt-1">{{ 'AUTH.REGISTER.SUBTITLE' | translate }}</p>
            </div>
          </div>

          <form (ngSubmit)="register()" class="space-y-5">

            <!-- Role Selection -->
            <div class="grid grid-cols-2 gap-3">
              <div (click)="role = 'Buyer'"
                   [class]="role === 'Buyer' ? 'border-[#0c7379] ring-1 ring-[#0c7379]/30 bg-[#0c7379]/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'"
                   class="relative p-4 bg-white/60 border-2 rounded-2xl cursor-pointer transition-all group">
                <div class="flex flex-col items-center gap-2 text-center">
                  <div class="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center transition-colors"
                       [class]="role === 'Buyer' ? 'text-[#0c7379]' : 'text-slate-400'">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <span class="text-[11px] font-black text-slate-800 leading-tight">{{ 'AUTH.REGISTER.ROLE_BUYER' | translate }}</span>
                </div>
                <div class="absolute top-2.5 ltr:right-2.5 rtl:left-2.5">
                  <div [class]="role === 'Buyer' ? 'bg-[#0c7379] border-[#0c7379]' : 'border-slate-300 bg-white'" class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all">
                    @if (role === 'Buyer') { <div class="w-1.5 h-1.5 bg-white rounded-full"></div> }
                  </div>
                </div>
              </div>

              <div (click)="role = 'Agent'"
                   [class]="role === 'Agent' ? 'border-[#0c7379] ring-1 ring-[#0c7379]/30 bg-[#0c7379]/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'"
                   class="relative p-4 bg-white/60 border-2 rounded-2xl cursor-pointer transition-all group">
                <div class="flex flex-col items-center gap-2 text-center">
                  <div class="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center transition-colors"
                       [class]="role === 'Agent' ? 'text-[#0c7379]' : 'text-slate-400'">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                  </div>
                  <span class="text-[11px] font-black text-slate-800 leading-tight">{{ 'AUTH.REGISTER.ROLE_AGENT' | translate }}</span>
                </div>
                <div class="absolute top-2.5 ltr:right-2.5 rtl:left-2.5">
                  <div [class]="role === 'Agent' ? 'bg-[#0c7379] border-[#0c7379]' : 'border-slate-300 bg-white'" class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all">
                    @if (role === 'Agent') { <div class="w-1.5 h-1.5 bg-white rounded-full"></div> }
                  </div>
                </div>
              </div>
            </div>

            <!-- Name Fields -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.FIRST_NAME' | translate }} <span class="text-red-500">*</span></label>
                <input type="text" [ngModel]="firstName()" (ngModelChange)="firstName.set($event); firstNameTouched.set(true)" (blur)="firstNameTouched.set(true)" name="firstName"
                       [class]="firstNameFieldClass()"
                       [placeholder]="'AUTH.REGISTER.FIRST_NAME' | translate">
                <div [class]="firstNameHintClass()">
                  @if (firstNameTouched() && firstNameError()) {
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    <span>{{ firstNameError() === 'required' ? ('AUTH.REGISTER.REQUIRED' | translate) : firstNameError() === 'maxLength' ? ('VALIDATION.UserProfile_DisplayNameTooLong' | translate) : ('AUTH.REGISTER.FIRST_NAME_MIN' | translate) }}</span>
                  } @else {
                    <span>{{ 'AUTH.REGISTER.FIRST_NAME_HINT' | translate }}</span>
                  }
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.LAST_NAME' | translate }} <span class="text-red-500">*</span></label>
                <input type="text" [ngModel]="lastName()" (ngModelChange)="lastName.set($event); lastNameTouched.set(true)" (blur)="lastNameTouched.set(true)" name="lastName"
                       [class]="lastNameFieldClass()"
                       [placeholder]="'AUTH.REGISTER.LAST_NAME' | translate">
                <div [class]="lastNameHintClass()">
                  @if (lastNameTouched() && lastNameError()) {
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    <span>{{ lastNameError() === 'required' ? ('AUTH.REGISTER.REQUIRED' | translate) : lastNameError() === 'maxLength' ? ('VALIDATION.UserProfile_DisplayNameTooLong' | translate) : ('AUTH.REGISTER.LAST_NAME_MIN' | translate) }}</span>
                  } @else {
                    <span>{{ 'AUTH.REGISTER.LAST_NAME_HINT' | translate }}</span>
                  }
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.EMAIL' | translate }} <span class="text-red-500">*</span></label>
              <input type="email" [ngModel]="email()" (ngModelChange)="email.set($event); emailTouched.set(true)" (blur)="emailTouched.set(true)" name="email"
                     id="email"
                     autocomplete="username email"
                     [class]="emailFieldClass()"
                     [placeholder]="'AUTH.REGISTER.EMAIL_PLACEHOLDER' | translate">
              <div [class]="emailHintClass()">
                @if (emailTouched() && emailError()) {
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ emailError() === 'maxLength' ? ('VALIDATION.Register_EmailTooLong' | translate) : ('AUTH.LOGIN.EMAIL_INVALID' | translate) }}</span>
                } @else {
                  <span>{{ 'AUTH.LOGIN.EMAIL_HINT' | translate }}</span>
                }
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.PHONE' | translate }} <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold ltr:border-r rtl:border-l border-slate-200/60 ltr:pr-3 rtl:pl-3">+20</span>
                <input type="tel" [ngModel]="phone()" (ngModelChange)="phone.set($event); phoneTouched.set(true)" (blur)="phoneTouched.set(true)" name="phone"
                       id="phone"
                       dir="ltr"
                       autocomplete="tel"
                       [class]="phoneFieldClass() + ' ltr:pl-16 rtl:pr-16'"
                       placeholder="10xxxxxxxxx">
              </div>
              <div [class]="phoneHintClass()">
                @if (phoneTouched() && phoneError()) {
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ phoneError() === 'invalid' ? ('AUTH.LOGIN.PHONE_INVALID' | translate) : ('AUTH.REGISTER.PHONE_REQUIRED' | translate) }}</span>
                } @else if (phoneTouched() && !phoneError() && phone()) {
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 010 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  <span>{{ 'AUTH.REGISTER.PHONE_HINT' | translate }}</span>
                } @else {
                  <span>{{ 'AUTH.REGISTER.PHONE_HINT' | translate }}</span>
                }
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.PASSWORD' | translate }} <span class="text-red-500">*</span></label>
              <div class="relative">
                <input type="text" autocomplete="username" class="hidden" style="display:none" aria-hidden="true" tabindex="-1">
                <input [type]="showPassword() ? 'text' : 'password'" [ngModel]="password()" (ngModelChange)="password.set($event); onPasswordInput($event); passwordTouched.set(true)" (blur)="passwordTouched.set(true)" name="password"
                       (paste)="$event.preventDefault()" (copy)="$event.preventDefault()" (cut)="$event.preventDefault()"
                       autocomplete="new-password"
                       [class]="passwordFieldClass() + ' ltr:pr-12 rtl:pl-12'"
                       [placeholder]="'AUTH.REGISTER.PASSWORD_HINT' | translate">
                <button type="button" (click)="showPassword.set(!showPassword())"
                        class="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  }
                </button>
              </div>

              @if (passwordTouched() && passwordError()) {
                <div class="field-hint is-error">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ passwordError() === 'required' ? ('AUTH.REGISTER.REQUIRED' | translate) : passwordError() === 'minLength' ? ('AUTH.REGISTER.PASSWORD_MIN' | translate) : ('VALIDATION.Register_PasswordComplex' | translate) }}</span>
                </div>
              }
              @if (password().length > 0) {
                <div class="mt-3 space-y-3 animate-fade-in bg-white/70 border border-slate-200/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                  <div class="flex items-center justify-between text-[11px] font-bold">
                    <span class="text-slate-400">{{ 'AUTH.REGISTER.PASSWORD_STRENGTH' | translate }}</span>
                    <span [class]="passwordStrengthColor() === 'bg-rose-500' ? 'text-rose-500' : passwordStrengthColor() === 'bg-amber-500' ? 'text-amber-500' : 'text-emerald-500'">
                      {{ passwordStrengthLabel() }}
                    </span>
                  </div>
                  <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div [class]="passwordStrengthColor()"
                         [style.width]="passwordStrengthPercentage() + '%'"
                         class="h-full transition-all duration-500 rounded-full"></div>
                  </div>
                  <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-bold">
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-600]="hasMinLength()" [class.text-slate-400]="!hasMinLength()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span>{{ 'AUTH.REGISTER.RULE_MIN_LENGTH' | translate }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-600]="hasUppercase()" [class.text-slate-400]="!hasUppercase()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span>{{ 'AUTH.REGISTER.RULE_UPPERCASE' | translate }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-600]="hasLowercase()" [class.text-slate-400]="!hasLowercase()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span>{{ 'AUTH.REGISTER.RULE_LOWERCASE' | translate }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-600]="hasNumber()" [class.text-slate-400]="!hasNumber()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span>{{ 'AUTH.REGISTER.RULE_NUMBER' | translate }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-600]="hasSpecialChar()" [class.text-slate-400]="!hasSpecialChar()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span>{{ 'AUTH.REGISTER.RULE_SPECIAL' | translate }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div class="space-y-2">
              <button type="submit" [disabled]="loading() || !isFormValid()" (click)="markAllTouched()"
                      [title]="!isFormValid() ? ('AUTH.REGISTER.SAVE_DISABLED_HINT' | translate) : ''"
                      [class]="(loading() || !isFormValid()) ? 'btn-luxury w-full py-4 mt-2 cursor-not-allowed text-sm font-black tracking-wide opacity-60' : 'btn-luxury w-full py-4 mt-2 cursor-pointer text-sm font-black tracking-wide'">
                @if (loading()) {
                  <div class="w-5.5 h-5.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                } @else {
                  <span>{{ 'AUTH.REGISTER.SUBMIT_BTN' | translate }}</span>
                  <svg class="w-5 h-5 transition-transform ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ltr:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                }
              </button>
              @if (!isFormValid() && (firstNameTouched() || lastNameTouched() || emailTouched() || passwordTouched())) {
                <p class="field-hint is-error justify-center">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ 'AUTH.REGISTER.SAVE_DISABLED_HINT' | translate }}</span>
                </p>
              }
            </div>
          </form>

          <p class="text-center text-xs font-bold text-slate-400 mt-6 select-none">
            {{ 'AUTH.REGISTER.ALREADY_HAVE_ACCOUNT' | translate }}
            <a routerLink="/auth/login" class="text-[#0c7379] hover:text-[#0b656b] hover:underline transition-colors font-bold">{{ 'AUTH.REGISTER.LOGIN_LINK' | translate }}</a>
          </p>
        </div>
      </main>
    </div>
  `,
})
export class RegisterComponent {
  private translate = inject(TranslateService);
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');
  role = 'Buyer';
  showPassword = signal(false);
  bgLoaded = signal(false);
  loading = signal(false);

  // Validation: touched state
  firstNameTouched = signal(false);
  lastNameTouched = signal(false);
  emailTouched = signal(false);
  phoneTouched = signal(false);
  passwordTouched = signal(false);

  // Validation: error code per field
  readonly firstNameError = computed<string | null>(() => {
    const v = this.firstName().trim();
    if (!v) return 'required';
    if (v.length < 2) return 'minLength';
    const fullName = [v, this.lastName().trim()].filter(Boolean).join(' ');
    if (fullName.length > 100) return 'maxLength';
    return null;
  });
  readonly lastNameError = computed<string | null>(() => {
    const v = this.lastName().trim();
    if (!v) return 'required';
    if (v.length < 2) return 'minLength';
    const fullName = [this.firstName().trim(), v].filter(Boolean).join(' ');
    if (fullName.length > 100) return 'maxLength';
    return null;
  });
  readonly emailError = computed<string | null>(() => {
    const v = this.email().trim();
    if (!v) return 'required';
    if (v.length > 254) return 'maxLength';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'invalid';
    return null;
  });
  readonly passwordError = computed<string | null>(() => {
    const v = this.password();
    if (!v) return 'required';
    if (v.length < 8) return 'minLength';
    const number = /\d/.test(v);
    const uppercase = /[A-Z]/.test(v);
    const lowercase = /[a-z]/.test(v);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(v);
    if (!number || !uppercase || !lowercase || !special) return 'complex';
    return null;
  });
  readonly phoneError = computed<string | null>(() => {
    const p = this.phone().trim();
    if (!p) return 'required';
    if (!/^[0-9]{10,15}$/.test(p)) return 'invalid';
    return null;
  });

  readonly isFormValid = computed<boolean>(() => {
    if (this.firstNameError() !== null) return false;
    if (this.lastNameError() !== null) return false;
    if (this.emailError() !== null) return false;
    if (this.phoneError() !== null) return false;
    if (this.passwordError() !== null) return false;
    return true;
  });

  // Field class getters
  readonly firstNameFieldClass = computed<string>(() => {
    const base = 'input-field';
    if (this.firstNameTouched() && this.firstNameError()) return `${base} is-invalid`;
    if (this.firstNameTouched() && !this.firstNameError()) return `${base} is-valid`;
    return base;
  });
  readonly firstNameHintClass = computed<string>(() => {
    if (this.firstNameTouched() && this.firstNameError()) return 'field-hint is-error';
    return 'field-hint is-neutral';
  });
  readonly lastNameFieldClass = computed<string>(() => {
    const base = 'input-field';
    if (this.lastNameTouched() && this.lastNameError()) return `${base} is-invalid`;
    if (this.lastNameTouched() && !this.lastNameError()) return `${base} is-valid`;
    return base;
  });
  readonly lastNameHintClass = computed<string>(() => {
    if (this.lastNameTouched() && this.lastNameError()) return 'field-hint is-error';
    return 'field-hint is-neutral';
  });
  readonly emailFieldClass = computed<string>(() => {
    const base = 'input-field';
    if (this.emailTouched() && this.emailError()) return `${base} is-invalid`;
    if (this.emailTouched() && !this.emailError()) return `${base} is-valid`;
    return base;
  });
  readonly emailHintClass = computed<string>(() => {
    if (this.emailTouched() && this.emailError()) return 'field-hint is-error';
    return 'field-hint is-neutral';
  });
  readonly passwordFieldClass = computed<string>(() => {
    const base = 'input-field';
    if (this.passwordTouched() && this.passwordError()) return `${base} is-invalid`;
    if (this.passwordTouched() && !this.passwordError() && this.password()) return `${base} is-valid`;
    return base;
  });
  readonly phoneFieldClass = computed<string>(() => {
    const base = 'input-field';
    if (this.phoneTouched() && this.phoneError()) return `${base} is-invalid`;
    if (this.phoneTouched() && !this.phoneError() && this.phone()) return `${base} is-valid`;
    return base;
  });
  readonly phoneHintClass = computed<string>(() => {
    if (this.phoneTouched() && this.phoneError()) return 'field-hint is-error';
    if (this.phoneTouched() && !this.phoneError() && this.phone()) return 'field-hint is-success';
    return 'field-hint is-neutral';
  });

  markAllTouched() {
    this.firstNameTouched.set(true);
    this.lastNameTouched.set(true);
    this.emailTouched.set(true);
    this.phoneTouched.set(true);
    this.passwordTouched.set(true);
  }

  // Strength signals
  passwordStrengthLabel = signal('');
  passwordStrengthColor = signal('bg-rose-500');
  passwordStrengthPercentage = signal(0);

  hasLowercase = signal(false);
  hasMinLength = signal(false);
  hasNumber = signal(false);
  hasUppercase = signal(false);
  hasSpecialChar = signal(false);

  onPasswordInput(val: string) {
    if (!val) {
      this.passwordStrengthLabel.set('');
      this.passwordStrengthColor.set('bg-rose-500');
      this.passwordStrengthPercentage.set(0);
      this.hasLowercase.set(false);
      this.hasMinLength.set(false);
      this.hasNumber.set(false);
      this.hasUppercase.set(false);
      this.hasSpecialChar.set(false);
      return;
    }

    const minLength = val.length >= 8;
    const number = /\d/.test(val);
    const uppercase = /[A-Z]/.test(val);
    const lowercase = /[a-z]/.test(val);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(val);

    this.hasLowercase.set(lowercase);
    this.hasMinLength.set(minLength);
    this.hasNumber.set(number);
    this.hasUppercase.set(uppercase);
    this.hasSpecialChar.set(special);

    let score = 0;
    if (minLength) score++;
    if (number) score++;
    if (uppercase) score++;
    if (lowercase) score++;
    if (special) score++;

    this.passwordStrengthPercentage.set(score * 20);

    if (score <= 2) {
      this.passwordStrengthLabel.set(this.translate.instant('AUTH.REGISTER.STRENGTH_WEAK'));
      this.passwordStrengthColor.set('bg-rose-500');
    } else if (score <= 4) {
      this.passwordStrengthLabel.set(this.translate.instant('AUTH.REGISTER.STRENGTH_MEDIUM'));
      this.passwordStrengthColor.set('bg-amber-500');
    } else {
      this.passwordStrengthLabel.set(this.translate.instant('AUTH.REGISTER.STRENGTH_STRONG'));
      this.passwordStrengthColor.set('bg-emerald-500');
    }
  }

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  async register() {
    this.markAllTouched();
    if (!this.isFormValid()) return;
    this.loading.set(true);
    try {
      const displayName = `${this.firstName()} ${this.lastName()}`.trim();
      const phoneVal = this.phone().trim();
      const phoneNumber = phoneVal ? `+20${phoneVal}` : '';
      const response = await this.auth.register({
        email: this.email(),
        password: this.password(),
        displayName: displayName || this.email(),
        role: this.role,
        phoneNumber: phoneNumber
      });
      // Store welcome flag so app.ts shows "Welcome to Baytology" on first login
      localStorage.setItem(
        `baytology_welcome_new_${response.userId}`,
        displayName || this.email()
      );
      this.toast.success('AUTH.REGISTER.SUCCESS');
      this.router.navigate(['/auth/login'], { queryParams: { email: this.email() } });
    } catch (e: any) {
      console.error('Registration error full details:', e);
      let translationKey = '';
      if (typeof e?.error === 'string') {
        translationKey = e.error;
      } else if (e?.error?.detail) {
        translationKey = e.error.detail;
      } else if (e?.error?.errors) {
        const firstErrorKey = Object.keys(e.error.errors)[0];
        const firstErrorMessages = e.error.errors[firstErrorKey];
        translationKey = Array.isArray(firstErrorMessages) ? firstErrorMessages[0] : firstErrorMessages;
      } else if (e?.error?.code) {
        translationKey = e.error.code;
      } else if (e?.error?.title) {
        translationKey = e.error.title;
      } else if (e?.message) {
        translationKey = e.message;
      }

      let errorMessage = translationKey;
      if (errorMessage) {
        const lowerMsg = errorMessage.toLowerCase();
        if (lowerMsg.includes('already taken') || lowerMsg.includes('duplicate')) {
          if (lowerMsg.includes('email') || lowerMsg.includes('user name')) {
            errorMessage = 'عذراً، هذا البريد الإلكتروني مسجل بالفعل!';
          } else if (lowerMsg.includes('phone')) {
            errorMessage = 'عذراً، رقم الهاتف هذا مستخدم بالفعل!';
          } else {
            errorMessage = 'عذراً، هذه البيانات مسجلة مسبقاً!';
          }
        } else if (lowerMsg.includes('password')) {
          errorMessage = 'كلمة المرور ضعيفة أو غير مطابقة للشروط.';
        }
      } else {
        errorMessage = 'حدث خطأ غير معروف أثناء التسجيل. حاول مرة أخرى.';
      }

      if (e?.error?.instance) {
        console.error('Backend Trace ID (Instance):', e.error.instance);
      }
      this.toast.error(errorMessage);
    } finally { this.loading.set(false); }
  }
}
