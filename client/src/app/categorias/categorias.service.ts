import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { URL_API } from '../auth/auth.tokens';
import { CategoriasDto, CriarCategoriasRequest } from './categorias.models';

@Service()
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  listar(): Observable<readonly CategoriasDto[]> {
    return this.http.get<readonly CategoriasDto[]>(`${this.urlApi}/categorias`);
  }

  cadastrar(requisicao: CriarCategoriasRequest): Observable<CategoriasDto> {
    return this.http.post<CategoriasDto>(`${this.urlApi}/categorias`, requisicao);
  }

  obterPorId(CategoriaId: string): Observable<CategoriasDto> {
    return this.http.get<CategoriasDto>(`${this.urlApi}/categorias/${CategoriaId}`);
  }
}
