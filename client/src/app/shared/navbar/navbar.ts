import { Component, inject, signal } from '@angular/core';
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

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
