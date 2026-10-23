import { Component } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Navbar, RouterOutlet],
  selector: 'app-shell',
  templateUrl: './categorias-shell.html',
})
export class CategoriasShell {}
