import { Component, input } from '@angular/core';

export const ICONES_CATEGORIA = [
  { valor: 'pasta', nome: 'Pasta', caminho: 'M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z' },
  { valor: 'livro', nome: 'Estudos', caminho: 'M12 6v15M12 6C9 3 5 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 2Z' },
  { valor: 'maleta', nome: 'Trabalho', caminho: 'M8 6V3h8v3M3 6h18v14H3ZM3 11h18M10 11v3h4v-3' },
  { valor: 'casa', nome: 'Pessoal', caminho: 'm3 10 9-7 9 7v11h-6v-7H9v7H3Z' },
  { valor: 'estrela', nome: 'Favoritos', caminho: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z' },
  { valor: 'coracao', nome: 'Saúde', caminho: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z' },
] as const;

@Component({
  selector: 'app-categoria-icone',
  template: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="caminho()" /></svg>`,
})
export class CategoriaIcone {
  readonly icone = input<string>('pasta');
  protected caminho(): string {
    return (ICONES_CATEGORIA.find((opcao) => opcao.valor === this.icone()) ?? ICONES_CATEGORIA[0]).caminho;
  }
}
