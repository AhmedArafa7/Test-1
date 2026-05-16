import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (!auth.currentUser()) {
    await auth.loadCurrentUser();
  }

  return auth.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};

export const roleGuard = (...roles: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (!auth.currentUser()) {
      await auth.loadCurrentUser();
    }

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    const userRoles = auth.userRoles();
    return roles.some(role => userRoles.includes(role))
      ? true
      : router.createUrlTree(['/']);
  };
};
