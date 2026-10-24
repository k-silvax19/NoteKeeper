import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideList, LucidePlus, LucideSparkles } from '@lucide/angular';
import { ApiValidationProblemDetails } from '../../auth/auth-models';
import { CategoriasDto } from '../../categorias/categorias.models';
import { CategoriasService } from '../../categorias/categorias.service';
import { NotasDto, StatusNota } from '../notas-models';
import { NotasService } from '../notas.service';
import { DetalhesNotas } from '../detalhes-notas/detalhes-notas';

@Component({
  imports: [RouterLink, LucideArrowUpRight, LucideList, LucidePlus, LucideSparkles, DetalhesNotas],
  selector: 'app-listar-notas',
  templateUrl: './listar-notas.html',
})
export class ListarNotas {
  private readonly notasService = inject(NotasService);
  private readonly categoriasService = inject(CategoriasService);

  protected readonly notas = signal<readonly NotasDto[]>([]);
  protected readonly categorias = signal<readonly CategoriasDto[]>([]);
  protected readonly selecionadas = signal<readonly string[]>([]);
  protected readonly statusSelecionado = signal<StatusNota | null>(null);
  protected readonly filtrosStatus = [
    { valor: null, titulo: 'Todas' },
    { valor: 'Ativa', titulo: 'Ativas' },
    { valor: 'Arquivada', titulo: 'Arquivadas' },
  ] as const;
  protected readonly notasFiltradas = computed(() =>
    this.notas().filter(
      (nota) => !this.statusSelecionado() || nota.status === this.statusSelecionado(),
    ),
  );
  protected readonly notaSelecionada = signal<NotasDto | null>(null);
  private readonly modalDetalhes =
    viewChild.required<ElementRef<HTMLDialogElement>>('modalDetalhes');

  protected abrirDetalhes(nota: NotasDto): void {
    this.notaSelecionada.set(nota);
    this.modalDetalhes().nativeElement.showModal();
  }

  protected fecharDetalhes(): void {
    this.modalDetalhes().nativeElement.close();
  }

  protected atualizarDetalhes(): void {
    this.fecharDetalhes();
    this.carregarNotas();
  }

  protected limparFiltros(): void {
    this.statusSelecionado.set(null);
    this.filtrar();
  }

  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');
  protected readonly erroCategorias = signal(false);

  constructor() {
    this.carregarCategorias();
    this.carregarNotas();
  }

  carregarCategorias(): void {
    this.erroCategorias.set(false);
    this.categoriasService.listar().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => this.erroCategorias.set(true),
    });
  }

  carregarNotas(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.notasService.listar({ categoriaIds: this.selecionadas() }).subscribe({
      next: (notas) => {
        this.notas.set(notas);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.carregando.set(false);
      },
    });
  }

  protected filtrar(id?: string): void {
    if (this.carregando()) return;
    this.selecionadas.update(
      (atuais) =>
        !id ? [] : atuais.includes(id) ? atuais.filter((atual) => atual !== id) : [...atuais, id], //Filtro de notas
    );
    this.carregarNotas();
  }

  protected formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  obterMensagemErro(response: HttpErrorResponse): string {
    const problem = response.error as ApiValidationProblemDetails | null;
    return problem?.detail ?? 'Não foi possível carregar suas notas. Tente novamente.';
  }
}
