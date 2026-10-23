import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoriasService } from '../categorias.service';
import { CategoriasDto } from '../categorias.models';
import { CategoriaIcone } from '../categoria-icone';
import { ApiValidationProblemDetails } from '../../auth/auth-models';

@Component({
  imports: [RouterLink, CategoriaIcone],
  selector: 'app-excluir',
  templateUrl: './excluir.html',
})
export class Excluir {
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly categoria = signal<CategoriasDto | null>(null);
  protected readonly mensagemErro = signal('');
  protected readonly carregando = signal(true);
  protected readonly enviandoFormulario = signal(false);

  constructor() {
    this.carregarCategoria();
  }

  carregarCategoria(): void {
    const categoriaId = this.route.snapshot.paramMap.get('id');

    if (!categoriaId) {
      this.mensagemErro.set('Categoria não encontrada.');
      this.carregando.set(false);
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.categoriasService.obterPorId(categoriaId).subscribe({
      next: (categoria) => {
        this.categoria.set(categoria);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.carregando.set(false);
      },
    });
  }

  protected excluirCategoria(event: SubmitEvent): void {
    event.preventDefault();

    const categoria = this.categoria();
    if (!categoria || this.enviandoFormulario()) return;

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.categoriasService.excluir(categoria.id).subscribe({
      next: () => {
        void this.router.navigateByUrl('/categorias/listar');
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.enviandoFormulario.set(false);
      },
    });
  }

  private obterMensagemErroApi(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    if (problem?.errors) {
      const mensagens = Object.values(problem.errors).flat();
      if (mensagens.length > 0) return mensagens.join('\n');
    }

    return problem?.detail ?? 'Não foi possível concluir a operação. Tente novamente em instantes.';
  }
}
