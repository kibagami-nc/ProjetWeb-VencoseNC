import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { PubNavbar, PubFooter, PubBidDetails, PubBidCreate } from './shared/public';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Logout } from './features/auth/logout/logout';
import { ToastList } from './shared/toast/toast';
import { ModalService } from './shared/services/modal.service';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PubNavbar, PubFooter, Login, Register, Logout, PubBidDetails, PubBidCreate, ToastList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  protected readonly modal = inject(ModalService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Suit l'URL courante pour pouvoir masquer le footer sur certaines routes (ex: /messages)
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly showFooter = computed(() => !this.currentUrl().startsWith('/messages'));

  ngOnInit() {
    // recharge l'utilisateur connecte si dispo
    this.auth.loadFromStorage();
  }
}
