import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

import { Bid } from '../../shared/models/bid.model';
import { BidService } from '../../shared/services/bid.service';
import { AuthService } from '../../shared/services/auth.service';
import { ModalService } from '../../shared/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-mes-annonces',
  imports: [DatePipe, Icon],
  templateUrl: './mes-annonces.html',
  styleUrl: './mes-annonces.css',
})
export class MesAnnonces implements OnInit {

  private readonly bidService = inject(BidService);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);
  // Id de l'utilisateur connecte. La route est protegee par authGuard, donc il existe toujours.
  private readonly userId = inject(AuthService).currentUser()!.idUser;

  protected readonly bids = signal<Bid[]>([]);
  protected readonly loading = signal(true);

  // Annonces de l'utilisateur connecte, triees de la plus recente a la plus ancienne.
  // Filtrage cote front car aucun endpoint /api/bid/user/{id} n'existe encore cote back.
  protected readonly mine = computed(() =>
    this.bids()
      .filter(b => b.userId === this.userId)
      .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
  );

  constructor() {
    // Quand une annonce est creee via le modal, on l'insere localement (pas de refetch)
    this.bidService.bidCreated.pipe(takeUntilDestroyed()).subscribe(bid => {
      this.bids.update(list => [bid, ...list]);
    });

    // Quand une annonce est modifiee, on remplace la version locale
    this.bidService.bidUpdated.pipe(takeUntilDestroyed()).subscribe(updated => {
      this.bids.update(list => list.map(b => b.idBid === updated.idBid ? updated : b));
    });
  }

  ngOnInit(): void {
    this.bidService.findAll().subscribe({
      next: data => {
        this.bids.set(data);
        this.loading.set(false);
      },
      error: err => {
        console.error('Erreur chargement annonces', err);
        this.loading.set(false);
      },
    });
  }

  // Supprime une annonce apres confirmation. Le stopPropagation empeche l'ouverture
  // du modal de detail au clic sur l'icone.
  protected onDelete(bid: Bid, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Supprimer l'annonce "${bid.title}" ?`)) return;

    this.bidService.delete(bid.idBid).subscribe({
      next: () => {
        this.bids.update(list => list.filter(b => b.idBid !== bid.idBid));
        this.toast.success('Annonce supprimee.');
      },
      error: err => {
        console.error('Erreur suppression annonce', err);
        this.toast.error('Echec de la suppression.');
      },
    });
  }

  // Ouvre le modal d'edition prerempli avec le bid cible.
  protected onEdit(bid: Bid, event: Event): void {
    event.stopPropagation();
    this.modal.openEditBid(bid);
  }
}
