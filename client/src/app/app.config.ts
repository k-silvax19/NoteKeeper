import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { CHAVE_ARMAZENAMENTO, URL_API } from './auth/auth.tokens';
import { authInterceptor } from './auth/auth.interceptor';
import { isAnonymousGuard } from './auth/auth.guard';
import { environment } from './environments/environment';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((c) => c.Home),
  },
  {
    path: 'cadastro',
    canActivate: [isAnonymousGuard],
    loadComponent: () => import('./auth/cadastro/cadastro').then((c) => c.Cadastro),
  },
  {
    path: 'login',
    canActivate: [isAnonymousGuard],
    loadComponent: () => import('./auth/login/login').then((c) => c.Login),
  },
  {
    path: 'categorias',
    canActivate: [isAnonymousGuard],
    canActivateChild: [isAnonymousGuard],
    loadComponent: () =>
      import('./categorias/shell/categorias-shell').then((l) => l.CategoriasShell),
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      {
        path: 'excluir/:id', //rota de exclusão
        loadComponent: () => import('./categorias/excluir/excluir').then((l) => l.Excluir),
      },
      {
        path: 'listar', //rota de listagem
        loadComponent: () => import('./categorias/listar/listar').then((l) => l.Listar),
      },
      {
        path: 'cadastrar', //Rota de cadastro
        loadComponent: () => import('./categorias/cadastro/cadastro').then((l) => l.Cadastro),
      },
      {
        path: 'editar/:id', //Rota de edição
        loadComponent: () => import('./categorias/editar/editar').then((e) => e.Editar),
      },
    ],
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: URL_API, useValue: environment.urlApi },
    { provide: CHAVE_ARMAZENAMENTO, useValue: 'notekeeper.sessao' },
    provideRouter(routes),
  ],
};
