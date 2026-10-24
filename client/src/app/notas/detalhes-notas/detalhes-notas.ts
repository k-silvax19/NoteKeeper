import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LucidePencil, LucideSave, LucideTrash2, LucideX } from '@lucide/angular';
import { NotasDto, StatusNota } from '../notas-models';
import { NotasService } from '../notas.service';
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

  protected readonly status = signal<StatusNota>('Ativa');
  protected readonly statusDisponiveis: readonly StatusNota[] = ['Ativa', 'Arquivada'];
  
  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');

  ngOnInit(): void {
    this.status.set(this.nota().status);
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
        categoriaIds: nota.categorias.map((categoria) => categoria.id),
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
