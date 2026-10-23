import { Component, inject, model, signal } from '@angular/core';
import { CategoriasService } from '../categorias.service';
import { Router, RouterLink } from '@angular/router';
import { FormField, form, maxLength, min, minLength, required } from '@angular/forms/signals';
import { CriarCategoriasRequest } from '../categorias.models';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiValidationProblemDetails } from '../../auth/auth-models';

import { CategoriaIcone, ICONES_CATEGORIA } from '../categoria-icone';

export interface CategoriaFormModel {
  readonly titulo: string;
  readonly icone: string;
}

@Component({
  imports: [FormField, RouterLink, CategoriaIcone],
  selector: 'app-cadastro',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);

  protected readonly icones = ICONES_CATEGORIA;

  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly modeloCategoria = signal<CategoriaFormModel>({
    titulo: '',
    icone: 'pasta',
  });
  protected readonly formularioCategoria = form(this.modeloCategoria, (modelo) => {
    required(modelo.titulo, { message: 'Informe o título da categoria.' });
    minLength(modelo.titulo, 2, { message: 'O título deve que conter no mínimo 2 caracteres.' });
    maxLength(modelo.titulo, 100, { message: 'O título pode ter no máximo 100 caracteres.' });
  });

  protected cadastrarCategorias(event: SubmitEvent): void {
    event.preventDefault();

    const formulario = this.formularioCategoria();

    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const modelo = this.modeloCategoria();

    const requisicao: CriarCategoriasRequest = {
      titulo: modelo.titulo.trim(),
      icone: modelo.icone,
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.categoriasService.cadastrar(requisicao).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);

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

    return problem?.detail ?? 'Não foi possível cadastrar o curso. Tente novamente em instantes.';
  }
}
