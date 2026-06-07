import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Public
  {
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/home/home').then(m => m.HomeComponent), data: { title: 'COMMON.HOME' } },
      { path: 'properties', loadComponent: () => import('./features/properties/property-list/property-list').then(m => m.PropertyListComponent), data: { title: 'NAV.BROWSE' } },
      // Keep these before `properties/:id` so explicit agent routes win over the detail route.
      { path: 'properties/new', canActivate: [roleGuard('Agent')], loadComponent: () => import('./features/properties/property-form/property-form').then(m => m.PropertyFormComponent), data: { title: 'NAV.ADD_PROPERTY' } },
      { path: 'properties/:id/edit', canActivate: [roleGuard('Agent')], loadComponent: () => import('./features/properties/property-form/property-form').then(m => m.PropertyFormComponent), data: { title: 'AUTH.EDIT_PROPERTY' } },
      { path: 'properties/:id', loadComponent: () => import('./features/properties/property-detail/property-detail').then(m => m.PropertyDetailComponent) },
      { path: 'agents/:id', loadComponent: () => import('./features/agents/agent-profile').then(m => m.AgentProfileComponent) },
      { path: 'privacy', loadComponent: () => import('./features/privacy/privacy').then(m => m.PrivacyComponent), data: { title: 'FOOTER.PRIVACY' } },
      { path: 'faq', loadComponent: () => import('./features/faq/faq').then(m => m.FaqComponent), data: { title: 'FOOTER.FAQ' } },
      { path: 'about', loadComponent: () => import('./features/about/about').then(m => m.AboutComponent), data: { title: 'FOOTER.ABOUT' } },
      { path: 'ai/chatbot', loadComponent: () => import('./features/ai/chatbot/chatbot').then(m => m.ChatbotComponent), data: { title: 'NAV.ASSISTANT' } },
    ]
  },

  // Auth
  { path: 'auth/login', loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent), data: { title: 'NAV.LOGIN' } },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent), data: { title: 'NAV.GET_STARTED' } },
  { path: 'auth/forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent), data: { title: 'AUTH.FORGOT_PW' } },
  { path: 'auth/reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent), data: { title: 'AUTH.RESET_PW' } },
  { path: 'auth/confirm-email', loadComponent: () => import('./features/auth/confirm-email/confirm-email').then(m => m.ConfirmEmailComponent), data: { title: 'AUTH.CONFIRM_EMAIL' } },

  // Authenticated User
  {
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'profile', loadComponent: () => import('./features/profile/user-profile/user-profile').then(m => m.UserProfileComponent), data: { title: 'NAV.PROFILE' } },
      { path: 'profile/edit', loadComponent: () => import('./features/profile/edit-profile/edit-profile').then(m => m.EditProfileComponent), data: { title: 'NAV.EDIT_PROFILE' } },
      { path: 'saved', canActivate: [roleGuard('Buyer')], loadComponent: () => import('./features/properties/saved-properties/saved-properties').then(m => m.SavedPropertiesComponent), data: { title: 'NAV.SAVED' } },
      { path: 'bookings', canActivate: [roleGuard('Buyer', 'Agent')], loadComponent: () => import('./features/bookings/booking-list/booking-list').then(m => m.BookingListComponent), data: { title: 'NAV.BOOKINGS' } },
      { path: 'bookings/new', canActivate: [roleGuard('Buyer')], loadComponent: () => import('./features/bookings/create-booking/create-booking').then(m => m.CreateBookingComponent), data: { title: 'BOOKINGS.CREATE.TITLE' } },
      { path: 'bookings/:id', canActivate: [roleGuard('Buyer', 'Agent')], loadComponent: () => import('./features/bookings/booking-detail/booking-detail').then(m => m.BookingDetailComponent), data: { title: 'BOOKINGS.DETAIL.TITLE' } },
      { path: 'conversations', canActivate: [roleGuard('Buyer', 'Agent')], loadComponent: () => import('./features/conversations/chat-room/chat-room').then(m => m.ChatRoomComponent), data: { title: 'NAV.MESSAGES' } },
      { path: 'conversations/:id', canActivate: [roleGuard('Buyer', 'Agent')], loadComponent: () => import('./features/conversations/chat-room/chat-room').then(m => m.ChatRoomComponent) },
      { path: 'ai/search', canActivate: [roleGuard('Buyer', 'Agent', 'Admin')], loadComponent: () => import('./features/ai/ai-search/ai-search').then(m => m.AiSearchComponent), data: { title: 'NAV.AI_SEARCH' } },
      { path: 'ai/recommendations', canActivate: [roleGuard('Buyer', 'Agent', 'Admin')], loadComponent: () => import('./features/ai/recommendations/recommendations').then(m => m.RecommendationsComponent), data: { title: 'NAV.RECOMMENDATIONS' } },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notification-list/notification-list').then(m => m.NotificationListComponent), data: { title: 'NOTIFICATIONS.TITLE' } },
      { path: 'settings', loadComponent: () => import('./features/settings/settings').then(m => m.SettingsComponent), data: { title: 'NAV.SETTINGS' } },
      { path: 'availability', canActivate: [roleGuard('Agent')], loadComponent: () => import('./features/availability/availability.component').then(m => m.AvailabilityComponent), data: { title: 'AVAILABILITY.TITLE' } },
    ]
  },

  // Admin Panel
  {
    path: 'admin',
    loadComponent: () => import('./shared/layouts/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [roleGuard('Admin')],
    children: [
      { path: '', loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/users/users').then(m => m.UsersComponent) },
      { path: 'agents', loadComponent: () => import('./features/admin/agents/agents').then(m => m.AgentsComponent), data: { title: 'NAV.AGENTS' } },
      { path: 'payments', loadComponent: () => import('./features/admin/payments/payments').then(m => m.PaymentsComponent) },
      { path: 'refunds', loadComponent: () => import('./features/admin/refunds/refunds').then(m => m.RefundsComponent) },
      { path: 'ai/search', loadComponent: () => import('./features/admin/ai-monitoring/ai-monitoring').then(m => m.AiMonitoringComponent) },
      { path: 'ai/recommendations', loadComponent: () => import('./features/admin/ai-recommendations/ai-recommendations').then(m => m.AiRecommendationsComponent) },
      { path: 'audit-logs', loadComponent: () => import('./features/admin/audit-logs/audit-logs').then(m => m.AuditLogsComponent) },
      { path: 'domain-events', loadComponent: () => import('./features/admin/audit-logs/audit-logs').then(m => m.AuditLogsComponent) },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
