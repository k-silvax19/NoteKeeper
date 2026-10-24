import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_API } from '../auth/auth.tokens';
import { FiltrarNotasRequest, NotasDto } from './notas-models';

@Service()
export class NotasService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  listar(filtro: FiltrarNotasRequest = {}): Observable<readonly NotasDto[]> {
    let params = new HttpParams();
    for (const id of filtro.categoriaIds ?? []) params = params.append('categoriaIds', id);
    return this.http.get<readonly NotasDto[]>(`${this.urlApi}/notas`, { params });
  }
}
