import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { RouterLink } from '@angular/router';
import { LucideArrowUpRight, LucideLogOut, LucideMenu, LucideUserPlus, LucideX } from '@lucide/angular';

@Component({
  imports: [RouterLink, LucideArrowUpRight, LucideLogOut, LucideMenu, LucideUserPlus, LucideX],
  selector: 'app-navbar',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  protected readonly sessao = this.authService.sessao;
  protected readonly menuOpen = signal(false);
  protected readonly encerrandoSessao = signal(false);
  protected readonly erroLogout = signal('');

  protected sair(): void {
    if (this.encerrandoSessao()) return;

    this.erroLogout.set('');
    this.encerrandoSessao.set(true);
    this.authService.encerrarSessao().pipe(
      finalize(() => this.encerrandoSessao.set(false)),
    ).subscribe({
      next: () => this.closeMenu(),
      error: () => this.erroLogout.set('Não foi possível sair da conta. Tente novamente.'),
    });
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
