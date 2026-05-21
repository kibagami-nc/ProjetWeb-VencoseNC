import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { BidService } from '../../services/bid.service';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pub-bid-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pub-bid-create.html',
  styleUrl: './pub-bid-create.css',
})
export class PubBidCreate {

  private readonly bidService = inject(BidService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  protected readonly user = this.auth.currentUser;
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  // Mode du modal : 'new' (creation) ou 'edit' (modification d'une annonce existante).
  // Determine au montage selon l'etat du ModalService.
  protected readonly isEdit = this.modal.current() === 'edit-bid';
  private readonly editingId = this.modal.selectedBid()?.idBid ?? null;

  // Liste des 33 communes de Nouvelle-Caledonie, triees alphabetiquement
  protected readonly communes: readonly string[] = [
    'Belep',
    'Boulouparis',
    'Bourail',
    'Canala',
    'Dumbea',
    'Farino',
    'Hienghene',
    'Houailou',
    'Ile des Pins',
    'Kaala-Gomen',
    'Kone',
    'Kouaoua',
    'Koumac',
    'La Foa',
    'Lifou',
    'Mare',
    'Moindou',
    'Mont-Dore',
    'Noumea',
    'Ouegoa',
    'Ouvea',
    'Paita',
    'Poindimie',
    'Ponerihouen',
    'Pouebo',
    'Pouembout',
    'Poum',
    'Poya',
    'Sarramea',
    'Thio',
    'Touho',
    'Voh',
    'Yate',
  ];

  // Champs saisis par l'utilisateur. En mode edit, on les preremplit depuis le bid selectionne.
  protected title = '';
  protected price: number | null = null;
  protected location = '';
  protected description = '';

  constructor() {
    if (this.isEdit) {
      const bid = this.modal.selectedBid();
      if (bid) {
        this.title = bid.title;
        this.price = bid.price;
        this.location = bid.location ?? '';
        this.description = bid.description;
      }
    }
  }

  // Empeche la saisie de tout caractere non-numerique dans le champ Prix.
  // type="number" tout seul laisse passer e, +, -, . et le copier-coller.
  protected onPriceKeydown(e: KeyboardEvent): void {
    if (e.ctrlKey || e.metaKey || e.key.length > 1) return; // controle: Backspace, Tab, fleches, Ctrl+C/V...
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  }


  protected onSubmit(): void {
    if (!this.user) {
      this.error.set('Vous devez etre connecte pour publier une annonce.');
      return;
    }
    if (!this.title.trim() || !this.description.trim()) return;

    this.submitting.set(true);
    this.error.set(null);

    const payload = {
      title: this.title.trim(),
      description: this.description.trim(),
      price: this.price,
      location: this.location.trim() || null,
      userId: this.user.idUser,
    };

    const request = (this.isEdit && this.editingId !== null)
      ? this.bidService.update(this.editingId, payload)
      : this.bidService.create(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.modal.close();
        this.toast.success(this.isEdit ? 'Annonce mise a jour.' : 'Annonce publiee.');
      },
      error: (err) => {
        console.error('Erreur ' + (this.isEdit ? 'modification' : 'creation') + ' annonce', err);
        this.submitting.set(false);
        if (!this.isEdit && err?.status === 403) {
          this.error.set('Limite de 4 annonces atteinte.');
        } else {
          this.error.set(this.isEdit ? 'Echec de la modification.' : 'Echec de la creation.');
        }
      },
    });
  }
}
