import { Component, inject, signal } from '@angular/core';

import { ModalService } from '../../services/modal.service';
import { BidService } from '../../services/bid.service';
import { ToastService } from '../../services/toast.service';

// Modale de confirmation avant suppression d'une annonce (meme principe que la deconnexion)
@Component({
  selector: 'app-pub-bid-delete',
  standalone: true,
  imports: [],
  templateUrl: './pub-bid-delete.html',
  styleUrl: './pub-bid-delete.css',
})
export class PubBidDelete {

  protected readonly modal = inject(ModalService);
  private readonly bidService = inject(BidService);
  private readonly toast = inject(ToastService);

  protected readonly deleting = signal(false);

  // Supprime l'annonce selectionnee puis ferme la modale.
  // Les listes se mettent a jour via le stream bidDeleted du BidService.
  protected confirm(): void {
    const bid = this.modal.selectedBid();
    if (!bid) return;

    this.deleting.set(true);
    this.bidService.delete(bid.idBid).subscribe({
      next: () => {
        this.deleting.set(false);
        this.modal.close();
        this.toast.success('Annonce supprimee.');
      },
      error: (err) => {
        console.error('Erreur suppression annonce', err);
        this.deleting.set(false);
        this.modal.close();
        this.toast.error('Echec de la suppression.');
      },
    });
  }
}
