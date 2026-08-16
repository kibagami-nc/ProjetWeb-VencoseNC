import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-pub-bid-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pub-bid-details.html',
  styleUrl: './pub-bid-details.css',
})
export class PubBidDetails {

  protected readonly modal = inject(ModalService);
  private readonly auth = inject(AuthService);

  // Vrai si l'annonce affichee appartient a l'utilisateur connecte (= il peut la modifier
  // au lieu d'avoir un bouton "Contacter le vendeur" qui n'aurait pas de sens).
  protected readonly isMine = computed(() => {
    const bid = this.modal.selectedBid();
    const me = this.auth.currentUser();
    return !!bid && !!me && bid.userId === me.idUser;
  });

  protected onEdit(): void {
    const bid = this.modal.selectedBid();
    if (bid) this.modal.openEditBid(bid);
  }
}
