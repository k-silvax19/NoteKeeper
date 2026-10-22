import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  protected readonly selectedCategory = signal('Todas');
  protected readonly categories = ['Todas', 'Pessoal', 'Estudos', 'Trabalho'];
  protected readonly notes = [
    {
      title: 'Pequenas coisas, bons dias',
      description:
        'Fazer um café com calma. Voltar a ler aquele livro. Sair para caminhar sem pressa.',
      category: 'Pessoal',
      color: 'peach',
      date: 'Hoje',
    },
    {
      title: 'Uma ideia para depois',
      description:
        'Criar algo que deixe a rotina mais leve. Começar pequeno e aprender pelo caminho.',
      category: 'Trabalho',
      color: 'purple',
      date: 'Hoje',
    },
    {
      title: 'Aprender um pouco todo dia',
      description:
        'Revisar as anotações da aula e colocar em prática o que aprendi. Uma etapa de cada vez.',
      category: 'Estudos',
      color: 'green',
      date: 'Ontem',
    },
  ];
}
