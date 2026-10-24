import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Datalhes } from '../detalhes/datalhes';
import { CategoriaIcone } from '../categoria-icone';
import { RouterLink } from '@angular/router';
import { CategoriasService } from '../categorias.service';
import { CategoriasDto } from '../categorias.models';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiValidationProblemDetails } from '../../auth/auth-models';

@Component({
  imports: [RouterLink, CategoriaIcone, Datalhes],
  selector: 'app-listar',
  templateUrl: './listar.html',
})
export class Listar {
  private readonly categoriasService = inject(CategoriasService);

  protected readonly categorias = signal<readonly CategoriasDto[]>([]);
  protected readonly mensagemErro = signal('');
  protected readonly carregando = signal(true);

  protected readonly categoriaSelecionada = signal<CategoriasDto | null>(null);
  private readonly modalDetalhes = viewChild.required<ElementRef<HTMLDialogElement>>('modalDetalhes');

  protected abrirDetalhes(categoria: CategoriasDto): void {
    this.categoriaSelecionada.set(categoria);
    this.modalDetalhes().nativeElement.showModal();
  }

  protected fecharDetalhes(): void {
    this.modalDetalhes().nativeElement.close();
  }

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
