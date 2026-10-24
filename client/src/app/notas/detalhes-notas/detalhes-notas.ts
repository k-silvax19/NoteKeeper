import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LucidePencil, LucideSave, LucideTrash2, LucideX } from '@lucide/angular';
import { NotasDto, StatusNota } from '../notas-models';
import { NotasService } from '../notas.service';
import { CategoriasService } from '../../categorias/categorias.service';
import { CategoriasDto } from '../../categorias/categorias.models';
import { ApiValidationProblemDetails } from '../../auth/auth-models';

@Component({
  imports: [RouterLink, LucidePencil, LucideSave, LucideTrash2, LucideX],
  selector: 'app-detalhes-notas',
  templateUrl: './detalhes-notas.html',
})
export class DetalhesNotas implements OnInit {
  readonly nota = input.required<NotasDto>();
  readonly fechar = output<void>();
  readonly salvo = output<void>();
  private readonly notasService = inject(NotasService);
  private readonly categoriasService = inject(CategoriasService);

  protected readonly categorias = signal<readonly CategoriasDto[]>([]);
  protected readonly selecionadas = signal<readonly string[]>([]);
  protected readonly status = signal<StatusNota>('Ativa');
  protected readonly statusDisponiveis: readonly StatusNota[] = ['Ativa', 'Arquivada'];
  protected readonly carregandoCategorias = signal(true);
  protected readonly erroCategorias = signal(false);
  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');

  ngOnInit(): void {
    this.selecionadas.set(this.nota().categorias.map((categoria) => categoria.id));
    this.status.set(this.nota().status);
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.carregandoCategorias.set(true);
    this.erroCategorias.set(false);
    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.carregandoCategorias.set(false);
      },
      error: () => {
        this.erroCategorias.set(true);
        this.carregandoCategorias.set(false);
      },
    });
  }

  protected selecionarCategoria(id: string): void {
    this.selecionadas.update((ids) =>
      ids.includes(id) ? ids.filter((atual) => atual !== id) : [...ids, id],
    );
  }

  protected salvar(event: SubmitEvent): void {
    event.preventDefault();
    if (this.enviandoFormulario()) return;
    const nota = this.nota();
    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');
    this.notasService
      .editar(nota.id, {
        titulo: nota.titulo,
        descricao: nota.descricao,
        status: this.status(),
        categoriaIds: this.selecionadas(),
      })
      .subscribe({
        next: () => {
          this.enviandoFormulario.set(false);
          this.salvo.emit();
        },
        error: (resposta: HttpErrorResponse) => {
          const problem = resposta.error as ApiValidationProblemDetails | null;
          this.mensagemErro.set(
            Object.values(problem?.errors ?? {})
              .flat()
              .join('\n') ||
              problem?.detail ||
              'Não foi possível salvar a nota. Tente novamente.',
          );
          this.enviandoFormulario.set(false);
        },
      });
  }
}
