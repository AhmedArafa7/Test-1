import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { AuthService } from './core/auth/auth.service';
import { NotificationSignalRService } from './core/services/notification-signalr.service';
import { ProfileService } from './features/profile/services/profile.service';
import { ToastService } from './core/services/toast.service';

import { LanguageService } from './core/services/language.service';
import { PageTitleService } from './core/services/page-title.service';
import { NavigationHistoryService } from './core/services/navigation-history.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  template: `<router-outlet /><app-toast-container /><app-confirm-dialog />`,
})
export class App {
  private activeToken: string | null = null;

  constructor(
    private languageService: LanguageService,
    private auth: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationSignalRService,
    private pageTitleService: PageTitleService,
    private navigationHistory: NavigationHistoryService,
    private translate: TranslateService,
    private toast: ToastService,
  ) {
    // Start routing history tracking
    this.navigationHistory.init();
    // Centralized SEO & Title setup
    this.pageTitleService.init();
    // Centralized language & RTL setup
    this.languageService.init();

    effect(() => {
      const token = this.auth.token;

      if (!token) {
        this.activeToken = null;
        this.notificationService.setNotifications([]);
        void this.notificationService.disconnect();
        return;
      }

      if (this.activeToken === token) {
        return;
      }

      this.activeToken = token;
      void this.bootstrapAuthenticatedSession();
    });
  }

  private async bootstrapAuthenticatedSession() {
    await this.auth.loadCurrentUser();

    if (!this.auth.token) {
      return;
    }

    // Show welcome message based on registration or returning visit
    try {
      this.showWelcomeMessage();
    } catch {
      // Silent fallback — welcome toast is non-critical
    }

    try {
      const res = await this.profileService.getNotifications();
      this.notificationService.setNotifications(res);
    } catch {
      this.notificationService.setNotifications([]);
    }

    await this.notificationService.connect();
  }

  private showWelcomeMessage() {
    const userId = this.auth.userId();
    if (!userId) return;

    const newUserKey = `baytology_welcome_new_${userId}`;

    const storedName = localStorage.getItem(newUserKey);
    if (storedName) {
      localStorage.removeItem(newUserKey);
      const msg = this.translate.instant('WELCOME.NEW_USER', { name: storedName });
      this.toast.success(msg !== 'WELCOME.NEW_USER' ? msg : `Welcome to Baytology, ${storedName}!`);
    }
  }
}


