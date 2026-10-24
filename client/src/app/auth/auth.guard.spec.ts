import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../app.config';
import { AuthService } from './auth.service';
import { CHAVE_ARMAZENAMENTO, URL_API } from './auth.tokens';

@Component({ imports: [RouterOutlet], template: '<router-outlet />' })
class PaginaTeste {}

// Mantem as guards e a estrutura reais sem carregar telas que consultam a API.
function rotasParaTeste(originais: Routes): Routes {
  return originais.map(({ loadComponent, children, ...rota }) => ({
    ...rota,
    ...(loadComponent ? { component: PaginaTeste } : {}),
    ...(children ? { children: rotasParaTeste(children) } : {}),
  }));
}

describe('Guards das rotas', () => {
  const chave = 'notekeeper.sessao.teste';

  function salvarSessao(expiracao = Date.now() + 60_000): void {
    localStorage.setItem(
      chave,
      JSON.stringify({
        token: {
          accessToken: 'token-teste',
          dataExpiracaoEmUtc: new Date(expiracao).toISOString(),
        },
        usuario: { id: '1', nome: 'Teste', email: 'teste@example.com' },
      }),
    );
  }

  beforeEach(() => {
    localStorage.removeItem(chave);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideRouter(rotasParaTeste(routes)),
        { provide: URL_API, useValue: '/api' },
        { provide: CHAVE_ARMAZENAMENTO, useValue: chave },
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(chave);
  });

  it.each([
    '/categorias',
    '/categorias/listar',
    '/categorias/cadastrar',
    '/categorias/editar/1',
    '/categorias/excluir/1',
  ])('protege %s sem sessao', async (url) => {
    await RouterTestingHarness.create(url);
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it.each(['/', '/login', '/cadastro'])('permite acesso publico a %s', async (url) => {
    await RouterTestingHarness.create(url);
    expect(TestBed.inject(Router).url).toBe(url);
  });

  it.each(['/login', '/cadastro'])('redireciona usuario autenticado de %s', async (url) => {
    salvarSessao();
    await RouterTestingHarness.create(url);
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('permite acesso as categorias com sessao valida', async () => {
    salvarSessao();
    await RouterTestingHarness.create('/categorias');
    expect(TestBed.inject(Router).url).toBe('/categorias/listar');
  });

  it('recusa sessao expirada ao abrir o app', async () => {
    salvarSessao(Date.now() - 1);
    await RouterTestingHarness.create('/categorias');
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(localStorage.getItem(chave)).toBeNull();
  });

  it('revalida a expiracao ao navegar entre rotas filhas', async () => {
    const agora = Date.now();
    salvarSessao(agora + 60_000);
    const harness = await RouterTestingHarness.create('/categorias/listar');
    vi.spyOn(Date, 'now').mockReturnValue(agora + 60_001);

    await harness.navigateByUrl('/categorias/cadastrar');

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(TestBed.inject(AuthService).sessao()).toBeNull();
    expect(localStorage.getItem(chave)).toBeNull();
  });
});
