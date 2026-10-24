import { CategoriasDto } from '../categorias/categorias.models';

export type StatusNota = 'Ativa' | 'Arquivada';

export interface NotasDto {
  readonly id: string;
  readonly titulo: string;
  readonly descricao: string | null;
  readonly status: StatusNota;
  readonly categorias: readonly CategoriasDto[];
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}

export interface CriarNotasRequest {
  readonly titulo: string;
  readonly descricao?: string | null;
  readonly categoriaIds?: readonly string[] | null;
}

export interface EditarNotasRequest extends CriarNotasRequest {
  readonly status: StatusNota;
}

export interface FiltrarNotasRequest {
  readonly categoriaIds?: readonly string[];
}
