import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NotasService } from '../notas.service';
import { NotasDto } from '../notas-models';
import { ApiValidationProblemDetails } from '../../auth/auth-models';

@Component({
  imports: [],
  selector: 'app-excluir-notas',
  templateUrl: './excluir-notas.html',
})
export class ExcluirNotas {
  private readonly notasService = inject(NotasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly nota = signal<NotasDto | null>(null);
  protected readonly mensagemErro = signal('');
  protected readonly carregando = signal(true);
  protected readonly enviandoFormulario = signal(false);

  constructor() {
    this.carregarNota();
  }

  carregarNota(): void {
    const notaId = this.route.snapshot.paramMap.get('id');

    if (!notaId) {
      this.mensagemErro.set('Nota não encontrada.');
      this.carregando.set(false);
      return;
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.notasService.obterPorId(notaId).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.carregando.set(false);
      },
    });
  }

  protected excluirNota(event: SubmitEvent): void {
    event.preventDefault();

    const nota = this.nota();
    if (!nota || this.enviandoFormulario()) return;

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.notasService.excluir(nota.id).subscribe({
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
