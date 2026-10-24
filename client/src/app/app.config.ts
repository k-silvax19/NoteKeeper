import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { CHAVE_ARMAZENAMENTO, URL_API } from './auth/auth.tokens';
import { authInterceptor } from './auth/auth.interceptor';
import { isAnonymousGuard, isAuthenticatedGuard } from './auth/auth.guard';
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
    canActivate: [isAuthenticatedGuard],
    canActivateChild: [isAuthenticatedGuard],
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
  {
    path: 'notas',
    canActivate: [isAuthenticatedGuard],
    canActivateChild: [isAuthenticatedGuard],
    loadComponent: () =>
      import('./notas/shell/notas-shell').then((l) => l.NotasShell),
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      {
        path: 'excluir/:id', //rota de exclusão
        loadComponent: () => import('./notas/excluir-notas/excluir-notas').then((l) => l.ExcluirNotas),
      },
      {
        path: 'listar', //rota de listagem
        loadComponent: () => import('./notas/listar-notas/listar-notas').then((l) => l.ListarNotas),
      },
      {
        path: 'cadastrar', //Rota de cadastro
        loadComponent: () => import('./notas/cadastrar-notas/cadastrar-notas').then((l) => l.CadastrarNotas),
      },
      {
        path: 'editar/:id', //Rota de edição
        loadComponent: () => import('./notas/editar-notas/editar-notas').then((e) => e.EditarNotas),
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
