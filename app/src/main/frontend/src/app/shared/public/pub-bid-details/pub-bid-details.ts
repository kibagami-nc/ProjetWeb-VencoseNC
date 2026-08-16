import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PLACEHOLDER_IMG, onImgError, photoSrc } from '../../models/bid.model';

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

  protected readonly onImgError = onImgError;
  protected readonly photoSrc = photoSrc;

  // Index de la photo affichee en grand (change au clic sur une vignette)
  protected readonly selectedPhoto = signal(0);

  // URL de la photo principale : celle selectionnee, ou placeholder local si aucune photo
  protected readonly mainPhotoSrc = computed(() => {
    const photos = this.modal.selectedBid()?.photos ?? [];
    const photo = photos[this.selectedPhoto()] ?? photos[0];
    return photo ? photoSrc(photo.url) : PLACEHOLDER_IMG;
  });

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
