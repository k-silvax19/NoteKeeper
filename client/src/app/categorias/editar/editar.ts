import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoriasService } from '../categorias.service';
import { EditarCategoriasRequest } from '../categorias.models';
import { CategoriaIcone, ICONES_CATEGORIA } from '../categoria-icone';
import { ApiValidationProblemDetails } from '../../auth/auth-models';

export interface CategoriaFormModel {
  readonly titulo: string;
  readonly icone: string;
}

@Component({
  imports: [FormField, RouterLink, CategoriaIcone],
  selector: 'app-editar',
  templateUrl: './editar.html',
})
export class Editar {
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoriaId = this.route.snapshot.paramMap.get('id');

  protected readonly icones = ICONES_CATEGORIA;
  protected readonly carregando = signal(true);

  protected readonly categoriaCarregada = signal(false);
  protected readonly enviandoFormulario = signal(false);

  protected readonly mensagemErro = signal('');
  protected readonly modeloCategoria = signal<CategoriaFormModel>({ titulo: '', icone: 'pasta' });
  
  protected readonly formularioCategoria = form(this.modeloCategoria, (modelo) => {
    required(modelo.titulo, { message: 'Informe o título da categoria.' });
    minLength(modelo.titulo, 2, { message: 'O título deve conter no mínimo 2 caracteres.' });
    maxLength(modelo.titulo, 100, { message: 'O título pode ter no máximo 100 caracteres.' });
  });

  constructor() {
    this.carregarCategoria();
  }

  carregarCategoria(): void {
    if (!this.categoriaId) {
      this.mensagemErro.set('Identificador da categoria inválido.');
      this.carregando.set(false);
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');
    this.categoriasService.obterPorId(this.categoriaId).subscribe({
      next: (categoria) => {
        this.modeloCategoria.set({ titulo: categoria.titulo, icone: categoria.icone });
        this.categoriaCarregada.set(true);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.carregando.set(false);
      },
    });
  }

  protected editarCategoria(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.categoriaId || !this.categoriaCarregada() || this.enviandoFormulario()) return;

    this.modeloCategoria.update((modelo) => ({ ...modelo, titulo: modelo.titulo.trim() }));
    const formulario = this.formularioCategoria();
    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const modelo = this.modeloCategoria();
    const requisicao: EditarCategoriasRequest = { titulo: modelo.titulo, icone: modelo.icone };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');
    this.categoriasService.editar(this.categoriaId, requisicao).subscribe({
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
