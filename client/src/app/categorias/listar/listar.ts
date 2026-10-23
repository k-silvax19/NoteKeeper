import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CursosService } from '../categorias.service';
import { CategoriasDto } from '../categorias.models';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiValidationProblemDetails } from '../../auth/auth-models';

@Component({
  imports: [RouterLink],
  selector: 'app-listar',
  templateUrl: './listar.html',
})
export class Listar {
  private readonly categoriasService = inject(CursosService);

  protected readonly categorias = signal<readonly CategoriasDto[]>([]);
  protected readonly mensagemErro = signal('');
  protected readonly carregando = signal(true);

  constructor() {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
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

  obterMensagemErro(response: HttpErrorResponse): string {
    const problem = response.error as ApiValidationProblemDetails | null;

    return (
      problem?.detail ?? 'Não foi possível carregar as categorias. Tente novamente em instantes.'
    );
  }
}
