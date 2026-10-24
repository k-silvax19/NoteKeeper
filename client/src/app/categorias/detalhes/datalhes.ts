import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoriasService } from '../categorias.service';
import { CategoriasDto } from '../categorias.models';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiValidationProblemDetails } from '../../auth/auth-models';

@Component({
  imports: [],
  selector: 'app-datalhes',
  templateUrl: './datalhes.html',
})
export class Datalhes {
  private readonly route = inject(ActivatedRoute);
  private readonly categoriasService = inject(CategoriasService);

  protected readonly categoria = signal<CategoriasDto | null>(null);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');

  constructor() {
    const categoriaId = this.route.snapshot.paramMap.get('categoriasId');

    if (!categoriaId) {
      this.mensagemErro.set('Identificador da categoria inválido.');
      this.carregando.set(false);
      return;
    }

    this.categoriasService.obterPorId(categoriaId).subscribe({
      next: (categoria) => {
        this.categoria.set(categoria);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.carregando.set(false);
      },
    });
  }
  
  protected formatarData(dataConclusao: string): string {
    return new Date(dataConclusao).toLocaleDateString();
  }

  obterMensagemErro(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    return problem?.detail ?? 'Não foi possível carregar o curso. Tente novamente em instantes.';
  }
}
