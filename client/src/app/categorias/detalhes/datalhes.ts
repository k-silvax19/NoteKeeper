import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriasDto } from '../categorias.models';
import { CategoriaIcone } from '../categoria-icone';

@Component({
  imports: [RouterLink, CategoriaIcone],
  selector: 'app-datalhes',
  templateUrl: './datalhes.html',
})
export class Datalhes {
  readonly categoria = input.required<CategoriasDto>();
  readonly fechar = output<void>();
}
