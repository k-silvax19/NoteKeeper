import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar],
  selector: 'app-shell',
  templateUrl: './notas-shell.html',
})
export class NotasShell {}
