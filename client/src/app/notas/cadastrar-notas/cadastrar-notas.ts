import { Component, inject, signal } from '@angular/core';
import { NotasService } from '../notas.service';
import { Router, RouterLink } from '@angular/router';
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { CriarNotasRequest } from '../notas-models';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiValidationProblemDetails } from '../../auth/auth-models';
import { CategoriasService } from '../../categorias/categorias.service';
import { CategoriasDto } from '../../categorias/categorias.models';
import { CategoriaIcone } from '../../categorias/categoria-icone';
import { LucideArrowLeft, LucidePlus } from '@lucide/angular';

export interface NotasFormModel {
  readonly titulo: string;
  readonly descricao: string;
  readonly categoriaIds: readonly string[];
}

@Component({
  imports: [FormField, RouterLink, CategoriaIcone, LucideArrowLeft, LucidePlus],
  selector: 'app-cadastrar-notas',
  templateUrl: './cadastrar-notas.html',
})
export class CadastrarNotas {
  private readonly notasService = inject(NotasService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);

  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly categorias = signal<readonly CategoriasDto[]>([]);
  protected readonly carregandoCategorias = signal(true);
  protected readonly mensagemErroCategorias = signal('');

  protected readonly modeloNotas = signal<NotasFormModel>({
    titulo: '',
    descricao: '',
    categoriaIds: [],
  });
  protected readonly formularioNotas = form(this.modeloNotas, (modelo) => {
    required(modelo.titulo, { message: 'Informe o título da nota.' });
    minLength(modelo.titulo, 2, { message: 'O título deve conter no mínimo 2 caracteres.' });
    maxLength(modelo.titulo, 100, { message: 'O título pode ter no máximo 100 caracteres.' });
    maxLength(modelo.descricao, 300, { message: 'A descrição pode ter no máximo 300 caracteres.' });
  });

  constructor() {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.carregandoCategorias.set(true);
    this.mensagemErroCategorias.set('');
    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.carregandoCategorias.set(false);
      },
      error: () => {
        this.mensagemErroCategorias.set(
          'Não foi possível carregar as categorias. Tente novamente.',
        );
        this.carregandoCategorias.set(false);
      },
    });
  }

  protected selecionarCategoria(id: string): void {
    this.modeloNotas.update((modelo) => ({
      ...modelo,
      categoriaIds: modelo.categoriaIds.includes(id)
        ? modelo.categoriaIds.filter((categoriaId) => categoriaId !== id)
        : [...modelo.categoriaIds, id],
    }));
  }

  protected cadastrarNotas(event: SubmitEvent): void {
    event.preventDefault();

    if (this.enviandoFormulario()) return;

    this.modeloNotas.update((modelo) => ({
      ...modelo,
      titulo: modelo.titulo.trim(),
      descricao: modelo.descricao.trim(),
    }));

    const formulario = this.formularioNotas();

    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const modelo = this.modeloNotas();

    const requisicao: CriarNotasRequest = {
      titulo: modelo.titulo.trim(),
      descricao: modelo.descricao.trim() || null,
      categoriaIds: modelo.categoriaIds,
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.notasService.cadastrar(requisicao).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);
        void this.router.navigateByUrl('/notas/listar');
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

    return problem?.detail ?? 'Não foi possível cadastrar a nota. Tente novamente em instantes.';
  }
}
