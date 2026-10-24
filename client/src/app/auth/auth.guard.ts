import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  return inject(AuthService).estaAutenticado() || inject(Router).createUrlTree(['/login']);
};

export const visitanteGuard: CanActivateFn = () => {
  return !inject(AuthService).estaAutenticado() || inject(Router).createUrlTree(['/']);
};
