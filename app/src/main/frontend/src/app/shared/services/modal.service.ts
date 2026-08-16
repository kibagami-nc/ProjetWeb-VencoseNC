import { Injectable, inject, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Bid } from '../models/bid.model';

export type ModalName = 'login' | 'register' | 'logout' | 'bid' | 'new-bid' | 'edit-bid' | 'delete-bid' | null;

@Injectable({ providedIn: 'root' })
export class ModalService {

  private readonly router = inject(Router);

  // Signal qui dit quelle modale est ouverte (ou null si aucune)
  readonly current = signal<ModalName>(null);

  // Bid affiche dans la modale de detail (null si la modale n'est pas une modale de bid)
  readonly selectedBid = signal<Bid | null>(null);

  constructor() {
    // Toute navigation ferme la modale courante (evite qu'elle reste collee sur la page suivante)
    this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe(() => {
        if (this.current() !== null) {
          this.close();
        }
      });
  }

  open(name: 'login' | 'register' | 'logout' | 'new-bid') {
    this.current.set(name);
    document.body.style.overflow = 'hidden';
  }

  openBidDetails(bid: Bid) {
    this.selectedBid.set(bid);
    this.current.set('bid');
    document.body.style.overflow = 'hidden';
  }

  // Ouvre le modal de creation en mode "edition" : le bid passe sera prefille
  openEditBid(bid: Bid) {
    this.selectedBid.set(bid);
    this.current.set('edit-bid');
    document.body.style.overflow = 'hidden';
  }

  // Ouvre le modal de confirmation de suppression pour le bid passe
  openDeleteBid(bid: Bid) {
    this.selectedBid.set(bid);
    this.current.set('delete-bid');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.current.set(null);
    this.selectedBid.set(null);
    document.body.style.overflow = '';
  }
}
