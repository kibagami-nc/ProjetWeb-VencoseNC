import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Bid, bidPhotoSrc, onImgError } from '../../models/bid.model';
import { BidService } from '../../services/bid.service';
import { ModalService } from '../../services/modal.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-pub-bid-list',
  standalone: true,
  imports: [],
  templateUrl: './pub-bid-list.html',
  styleUrl: './pub-bid-list.css',
})
export class PubBidList implements OnInit {

  private bidService = inject(BidService);
  protected readonly modal = inject(ModalService);
  protected readonly search = inject(SearchService);

  protected readonly bids = signal<Bid[]>([]);

  // Annonces filtrees par la recherche (navbar ou barre de l'accueil).
  // Se recalcule automatiquement a chaque frappe et a chaque mise a jour de la liste.
  protected readonly filteredBids = computed(() =>
    this.bids().filter(bid => this.search.matches(bid))
  );

  // Helpers d'affichage des photos (premiere photo ou placeholder local)
  protected readonly bidPhotoSrc = bidPhotoSrc;
  protected readonly onImgError = onImgError;

  constructor() {
    // Quand une annonce est creee via le modal, on l'insere en tete (pas de refetch)
    this.bidService.bidCreated.pipe(takeUntilDestroyed()).subscribe(bid => {
      this.bids.update(list => [bid, ...list]);
    });

    // Quand une annonce est modifiee (champs ou photos), on remplace la version locale :
    // la carte se met a jour immediatement, sans recharger la page
    this.bidService.bidUpdated.pipe(takeUntilDestroyed()).subscribe(updated => {
      this.bids.update(list => list.map(b => b.idBid === updated.idBid ? updated : b));
    });

    // Quand une annonce est supprimee, on retire la carte
    this.bidService.bidDeleted.pipe(takeUntilDestroyed()).subscribe(id => {
      this.bids.update(list => list.filter(b => b.idBid !== id));
    });
  }

  ngOnInit(): void {
    this.bidService.findAll().subscribe({
      next: (data) => this.bids.set(data),
      error: (err) => console.error('Erreur chargement annonces', err),
    });
  }
}
