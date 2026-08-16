import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { Icon } from '../../icon/icon';

@Component({
  selector: 'app-pub-navbar',
  imports: [RouterLink, Icon],
  templateUrl: './pub-navbar.html',
  styleUrl: './pub-navbar.css',
})
export class PubNavbar {

  protected readonly modal = inject(ModalService);
  protected readonly auth = inject(AuthService);
  protected readonly search = inject(SearchService);
  private readonly router = inject(Router);

  // Chaque frappe met a jour la recherche partagee. Si on n'est pas sur l'accueil
  // (ou la liste des annonces s'affiche), on y retourne pour voir les resultats.
  protected onSearch(event: Event): void {
    this.search.query.set((event.target as HTMLInputElement).value);
    if (this.router.url !== '/') {
      this.router.navigateByUrl('/');
    }
  }
}
