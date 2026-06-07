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
    <div class="min-h-screen flex bg-white font-sans selection:bg-[#0a8f96]/20">
      <!-- Left Side: Brand & Visual -->
      <div class="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-between p-16 bg-slate-900 animate-fade-in">
        <!-- Low-res placeholder blurred -->
        <div [class]="bgLoaded() ? 'opacity-0' : 'opacity-100'"
             class="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center filter blur-xl scale-110"
             style="background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&q=10');"></div>
        
        <!-- High-res full image -->
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
             (load)="bgLoaded.set(true)"
             [class]="bgLoaded() ? 'opacity-100' : 'opacity-0'"
             class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000">
        
        <div class="absolute inset-0 bg-gradient-to-t from-[#0c1222]/90 via-[#076b70]/50 to-[#0a8f96]/30"></div>
        
        <!-- Floating Geometric Accents -->
        <div class="absolute top-20 right-16 w-36 h-36 border border-white/10 rounded-3xl rotate-12 animate-float"></div>
        <div class="absolute bottom-40 right-32 w-24 h-24 border border-[#12b5bd]/15 rounded-2xl -rotate-6 animate-float" style="animation-delay: 1.5s;"></div>

        <!-- Logo -->
        <div class="relative z-10 flex items-center gap-3">
          <img src="/Baytology_image.png" alt="Baytology" class="h-14 w-44 object-cover object-center drop-shadow-md">
        </div>

        <!-- Big Text -->
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 mb-8">
            <svg class="w-4 h-4 text-[#12b5bd]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{{ 'AUTH.REGISTER.SUBTITLE' | translate }}</span>
          </div>
          <h2 class="text-5xl font-bold text-white leading-tight mb-6 ltr:text-left rtl:text-right">
            {{ 'AUTH.REGISTER.LEFT_TITLE' | translate }}
          </h2>
          <p class="text-white/50 text-lg max-w-md leading-relaxed ltr:text-left rtl:text-right">
            {{ 'AUTH.REGISTER.LEFT_DESC' | translate }}
          </p>
        </div>

        <!-- Copyright -->
        <div class="relative z-10 text-white/30 text-[11px] font-medium tracking-widest uppercase ltr:text-left rtl:text-right">
          {{ 'AUTH.REGISTER.COPYRIGHT' | translate }}
        </div>
      </div>

      <!-- Right Side: Registration Form -->
      <div class="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 overflow-y-auto bg-gray-50/50">
        <div class="w-full max-w-[480px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 p-8 md:p-12">
          
          <div class="mb-10 ltr:text-left rtl:text-right">
            <h1 class="text-3xl font-black text-gray-900 mb-2">{{ 'AUTH.REGISTER.TITLE' | translate }}</h1>
            <p class="text-gray-500 text-sm font-bold">{{ 'AUTH.REGISTER.SUBTITLE' | translate }}</p>
          </div>

          <form (ngSubmit)="register()" class="space-y-6">
            <!-- Role Selection -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <div (click)="role = 'Buyer'" 
                   [class]="role === 'Buyer' ? 'border-[#0a8f96] ring-1 ring-[#0a8f96]' : 'border-gray-100 hover:border-gray-200'"
                   class="relative p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all group">
                <div class="flex flex-col items-center gap-3 text-center">
                  <div class="w-12 h-12 bg-gray-50 group-hover:bg-[#0a8f96]/5 rounded-full flex items-center justify-center transition-colors">
                    <svg class="w-6 h-6 text-gray-400 group-hover:text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <span class="text-[11px] font-black text-gray-900 leading-tight">{{ 'AUTH.REGISTER.ROLE_BUYER' | translate }}</span>
                </div>
                <div class="absolute top-3 right-3">
                  <div [class]="role === 'Buyer' ? 'bg-[#0a8f96] border-[#0a8f96]' : 'border-gray-200'" class="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                    @if (role === 'Buyer') { <div class="w-1.5 h-1.5 bg-white rounded-full"></div> }
                  </div>
                </div>
              </div>

              <div (click)="role = 'Agent'" 
                   [class]="role === 'Agent' ? 'border-[#0a8f96] ring-1 ring-[#0a8f96]' : 'border-gray-100 hover:border-gray-200'"
                   class="relative p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all group">
                <div class="flex flex-col items-center gap-3 text-center">
                  <div class="w-12 h-12 bg-gray-50 group-hover:bg-[#0a8f96]/5 rounded-full flex items-center justify-center transition-colors">
                    <svg class="w-6 h-6 text-gray-400 group-hover:text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                  </div>
                  <span class="text-[11px] font-black text-gray-900 leading-tight">{{ 'AUTH.REGISTER.ROLE_AGENT' | translate }}</span>
                </div>
                <div class="absolute top-3 right-3">
                  <div [class]="role === 'Agent' ? 'bg-[#0a8f96] border-[#0a8f96]' : 'border-gray-200'" class="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                    @if (role === 'Agent') { <div class="w-1.5 h-1.5 bg-white rounded-full"></div> }
                  </div>
                </div>
              </div>
            </div>

            <!-- Name Fields -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2 ltr:text-left rtl:text-right">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.FIRST_NAME' | translate }} <span class="text-red-500">*</span></label>
                <input type="text" [ngModel]="firstName()" (ngModelChange)="firstName.set($event); firstNameTouched.set(true)" (blur)="firstNameTouched.set(true)" name="firstName"
                       [class]="firstNameFieldClass()"
                       [placeholder]="'AUTH.REGISTER.FIRST_NAME' | translate">
                <div [class]="firstNameHintClass()">
                  @if (firstNameTouched() && firstNameError()) {
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    <span>{{ firstNameError() === 'required' ? ('AUTH.REGISTER.REQUIRED' | translate) : ('AUTH.REGISTER.FIRST_NAME_MIN' | translate) }}</span>
                  } @else {
                    <span>{{ 'AUTH.REGISTER.FIRST_NAME_HINT' | translate }}</span>
                  }
                </div>
              </div>
              <div class="space-y-2 ltr:text-left rtl:text-right">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.LAST_NAME' | translate }} <span class="text-red-500">*</span></label>
                <input type="text" [ngModel]="lastName()" (ngModelChange)="lastName.set($event); lastNameTouched.set(true)" (blur)="lastNameTouched.set(true)" name="lastName"
                       [class]="lastNameFieldClass()"
                       [placeholder]="'AUTH.REGISTER.LAST_NAME' | translate">
                <div [class]="lastNameHintClass()">
                  @if (lastNameTouched() && lastNameError()) {
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    <span>{{ lastNameError() === 'required' ? ('AUTH.REGISTER.REQUIRED' | translate) : ('AUTH.REGISTER.LAST_NAME_MIN' | translate) }}</span>
                  } @else {
                    <span>{{ 'AUTH.REGISTER.LAST_NAME_HINT' | translate }}</span>
                  }
                </div>
              </div>
            </div>

            <div class="space-y-2 ltr:text-left rtl:text-right">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.EMAIL' | translate }} <span class="text-red-500">*</span></label>
              <input type="email" [ngModel]="email()" (ngModelChange)="email.set($event); emailTouched.set(true)" (blur)="emailTouched.set(true)" name="email"
                     [class]="emailFieldClass()"
                     [placeholder]="'AUTH.REGISTER.EMAIL_PLACEHOLDER' | translate">
              <div [class]="emailHintClass()">
                @if (emailTouched() && emailError()) {
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ 'AUTH.LOGIN.EMAIL_INVALID' | translate }}</span>
                } @else {
                  <span>{{ 'AUTH.LOGIN.EMAIL_HINT' | translate }}</span>
                }
              </div>
            </div>

            <div class="space-y-2 ltr:text-left rtl:text-right">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-wider">{{ 'AUTH.REGISTER.PASSWORD' | translate }} <span class="text-red-500">*</span></label>
              <div class="relative">
                <input [type]="showPassword() ? 'text' : 'password'" [ngModel]="password()" (ngModelChange)="password.set($event); onPasswordInput($event); passwordTouched.set(true)" (blur)="passwordTouched.set(true)" name="password"
                       [class]="passwordFieldClass()"
                       [placeholder]="'AUTH.REGISTER.PASSWORD_HINT' | translate">
                <button type="button" (click)="showPassword.set(!showPassword())" class="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  @if (showPassword()) {
                    <!-- Eye Off Icon -->
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                    </svg>
                  } @else {
                    <!-- Eye Icon -->
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  }
                </button>
              </div>

              @if (passwordTouched() && passwordError() === 'minLength') {
                <div class="field-hint is-error">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ 'AUTH.REGISTER.PASSWORD_MIN' | translate }}</span>
                </div>
              } @else if (password().length > 0) {
                <!-- Password Strength Indicator -->
                <div class="mt-3 space-y-3 animate-fade-in bg-slate-50/60 border border-slate-100 rounded-2xl p-4">
                  <!-- Bar and label -->
                  <div class="flex items-center justify-between text-[11px] font-bold">
                    <span class="text-slate-400">{{ 'AUTH.REGISTER.PASSWORD_STRENGTH' | translate }}</span>
                    <span [class]="passwordStrengthColor() === 'bg-rose-500' ? 'text-rose-500' : passwordStrengthColor() === 'bg-amber-500' ? 'text-amber-500' : 'text-emerald-500'">
                      {{ passwordStrengthLabel() }}
                    </span>
                  </div>
                  <!-- Dynamic Bar -->
                  <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div [class]="passwordStrengthColor()"
                         [style.width]="passwordStrengthPercentage() + '%'"
                         class="h-full transition-all duration-500 rounded-full"></div>
                  </div>
                  <!-- Checklist grid -->
                  <div class="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-500]="hasMinLength()" [class.text-slate-400]="!hasMinLength()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span>{{ 'AUTH.REGISTER.RULE_MIN_LENGTH' | translate }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-500]="hasUppercase()" [class.text-slate-400]="!hasUppercase()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span>{{ 'AUTH.REGISTER.RULE_UPPERCASE' | translate }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-500]="hasNumber()" [class.text-slate-400]="!hasNumber()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      <span>{{ 'AUTH.REGISTER.RULE_NUMBER' | translate }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 transition-colors" [class.text-emerald-500]="hasSpecialChar()" [class.text-slate-400]="!hasSpecialChar()">
                      <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
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
                      [class]="(loading() || !isFormValid()) ? 'btn-luxury w-full py-4 mt-6 cursor-not-allowed opacity-60' : 'btn-luxury w-full py-4 mt-6 cursor-pointer'">
                @if (loading()) { <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                @if (!loading()) {
                  <span>{{ 'AUTH.REGISTER.SUBMIT_BTN' | translate }}</span>
                  <svg class="w-5 h-5 transition-transform ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
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

          <p class="text-center text-sm font-bold text-gray-400 mt-10">
            {{ 'AUTH.REGISTER.ALREADY_HAVE_ACCOUNT' | translate }} 
            <a routerLink="/auth/login" class="text-[#0a8f96] hover:underline">{{ 'AUTH.REGISTER.LOGIN_LINK' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private translate = inject(TranslateService);
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  role = 'Buyer';
  showPassword = signal(false);
  bgLoaded = signal(false);
  loading = signal(false);

  // Validation: touched state
  firstNameTouched = signal(false);
  lastNameTouched = signal(false);
  emailTouched = signal(false);
  passwordTouched = signal(false);

  // Validation: error code per field
  readonly firstNameError = computed<string | null>(() => {
    const v = this.firstName().trim();
    if (!v) return 'required';
    if (v.length < 2) return 'minLength';
    return null;
  });
  readonly lastNameError = computed<string | null>(() => {
    const v = this.lastName().trim();
    if (!v) return 'required';
    if (v.length < 2) return 'minLength';
    return null;
  });
  readonly emailError = computed<string | null>(() => {
    const v = this.email().trim();
    if (!v) return 'required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'invalid';
    return null;
  });
  readonly passwordError = computed<string | null>(() => {
    const v = this.password();
    if (!v) return 'required';
    if (v.length < 8) return 'minLength';
    return null;
  });

  readonly isFormValid = computed<boolean>(() => {
    if (this.firstNameError() !== null) return false;
    if (this.lastNameError() !== null) return false;
    if (this.emailError() !== null) return false;
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

  markAllTouched() {
    this.firstNameTouched.set(true);
    this.lastNameTouched.set(true);
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
  }

  // Strength signals
  passwordStrengthLabel = signal('');
  passwordStrengthColor = signal('bg-rose-500');
  passwordStrengthPercentage = signal(0);

  hasMinLength = signal(false);
  hasNumber = signal(false);
  hasUppercase = signal(false);
  hasSpecialChar = signal(false);

  onPasswordInput(val: string) {
    if (!val) {
      this.passwordStrengthLabel.set('');
      this.passwordStrengthColor.set('bg-rose-500');
      this.passwordStrengthPercentage.set(0);
      this.hasMinLength.set(false);
      this.hasNumber.set(false);
      this.hasUppercase.set(false);
      this.hasSpecialChar.set(false);
      return;
    }

    const minLength = val.length >= 8;
    const number = /\d/.test(val);
    const uppercase = /[A-Z]/.test(val);
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(val);

    this.hasMinLength.set(minLength);
    this.hasNumber.set(number);
    this.hasUppercase.set(uppercase);
    this.hasSpecialChar.set(special);

    let score = 0;
    if (minLength) score++;
    if (number) score++;
    if (uppercase) score++;
    if (special) score++;

    this.passwordStrengthPercentage.set(score * 25);

    if (score <= 1) {
      this.passwordStrengthLabel.set(this.translate.instant('AUTH.REGISTER.STRENGTH_WEAK'));
      this.passwordStrengthColor.set('bg-rose-500');
    } else if (score <= 3) {
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
      await this.auth.register({
        email: this.email(),
        password: this.password(),
        displayName: displayName || this.email(),
        role: this.role
      });
      this.toast.success('AUTH.REGISTER.SUCCESS');
      this.router.navigate(['/auth/login'], { queryParams: { email: this.email() } });
    } catch (e: any) {
      console.error('Registration error full details:', e);
      let errorMessage = 'AUTH.REGISTER.ERROR';

      if (e?.error?.detail) {
        errorMessage = e.error.detail;
      } else if (e?.error?.errors) {
        const firstErrorKey = Object.keys(e.error.errors)[0];
        const firstErrorMessages = e.error.errors[firstErrorKey];
        if (Array.isArray(firstErrorMessages) && firstErrorMessages.length > 0) {
          errorMessage = firstErrorMessages[0];
        } else if (typeof firstErrorMessages === 'string') {
          errorMessage = firstErrorMessages;
        }
      }

      if (e?.error?.instance) {
        console.error('Backend Trace ID (Instance):', e.error.instance);
      }
      this.toast.error(errorMessage);
    } finally { this.loading.set(false); }
  }
}
