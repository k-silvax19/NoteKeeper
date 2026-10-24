import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { HttpErrorResponse } from '@angular/common/http';
import { NotasService } from '../notas.service';
import { EditarNotasRequest, StatusNota } from '../notas-models';
import { CategoriasService } from '../../categorias/categorias.service';
import { CategoriasDto } from '../../categorias/categorias.models';
import { ApiValidationProblemDetails } from '../../auth/auth-models';
import { CategoriaIcone } from '../../categorias/categoria-icone';
import { LucideArrowLeft, LucideSave } from '@lucide/angular';

export interface EditarNotasFormModel {
  readonly titulo: string;
  readonly descricao: string;
  readonly categoriaIds: readonly string[];
}

@Component({
  imports: [FormField, RouterLink, CategoriaIcone, LucideArrowLeft, LucideSave],
  selector: 'app-editar-notas',
  templateUrl: './editar-notas.html',
})
export class EditarNotas {
  private readonly notasService = inject(NotasService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notaId = this.route.snapshot.paramMap.get('id');

  protected readonly carregando = signal(true);
  protected readonly notaCarregada = signal(false);
  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly categorias = signal<readonly CategoriasDto[]>([]);
  protected readonly carregandoCategorias = signal(true);
  protected readonly mensagemErroCategorias = signal('');
  private readonly statusAtual = signal<StatusNota | null>(null);

  protected readonly modeloNotas = signal<EditarNotasFormModel>({
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
    this.carregarNota();
    this.carregarCategorias();
  }

  carregarNota(): void {
    if (!this.notaId) {
      this.mensagemErro.set('Identificador da nota inválido.');
      this.carregando.set(false);
      return;
    }

    this.carregando.set(true);
    this.notaCarregada.set(false);
    this.mensagemErro.set('');
    this.notasService.obterPorId(this.notaId).subscribe({
      next: (nota) => {
        this.statusAtual.set(nota.status);
        this.modeloNotas.set({
          titulo: nota.titulo,
          descricao: nota.descricao ?? '',
          categoriaIds: nota.categorias.map((categoria) => categoria.id),
        });
        this.notaCarregada.set(true);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.carregando.set(false);
      },
    });
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
    if (!this.notaCarregada() || this.enviandoFormulario()) return;

    this.modeloNotas.update((modelo) => ({
      ...modelo,
      categoriaIds: modelo.categoriaIds.includes(id)
        ? modelo.categoriaIds.filter((categoriaId) => categoriaId !== id)
        : [...modelo.categoriaIds, id],
    }));
  }

  protected editarNota(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.notaId || !this.notaCarregada() || this.enviandoFormulario()) return;

    const status = this.statusAtual();
    if (!status) return;

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
    const requisicao: EditarNotasRequest = {
      titulo: modelo.titulo,
      descricao: modelo.descricao || null,
      status,
      categoriaIds: modelo.categoriaIds,
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');
    this.notasService.editar(this.notaId, requisicao).subscribe({
      next: () => {
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
    return problem?.detail ?? 'Não foi possível concluir a operação. Tente novamente em instantes.';
  }
}
