import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { BidService } from '../../services/bid.service';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast.service';
import { Bid, BidPhoto, photoSrc } from '../../models/bid.model';

@Component({
  selector: 'app-pub-bid-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pub-bid-create.html',
  styleUrl: './pub-bid-create.css',
})
export class PubBidCreate implements OnDestroy {

  private readonly bidService = inject(BidService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  // Signal de l'utilisateur connecte (lu dans le template pour preremplir nom / telephone)
  protected readonly user = this.auth.currentUser;
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  // Mode du modal : 'new' (creation) ou 'edit' (modification d'une annonce existante).
  // Determine au montage selon l'etat du ModalService.
  protected readonly isEdit = this.modal.current() === 'edit-bid';
  private readonly editingId = this.modal.selectedBid()?.idBid ?? null;

  // Annonce deja enregistree pendant cette ouverture du modal (evite de creer
  // un doublon si l'utilisateur re-clique "Publier" apres un echec d'envoi des photos)
  private savedBid: Bid | null = null;

  /* ---- Photos ------------------------------------------------------- */

  protected readonly MAX_PHOTOS = 6;
  protected readonly photoSrc = photoSrc;

  // Formats acceptes (doit rester coherent avec PhotoStorageServiceImpl cote backend)
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // Photos deja enregistrees (mode edition), supprimables une par une
  protected readonly existingPhotos = signal<BidPhoto[]>(this.modal.selectedBid()?.photos ?? []);

  // Nouvelles photos choisies, avec apercu local ; envoyees au backend a la validation
  protected readonly newPhotos = signal<{ file: File; previewUrl: string }[]>([]);

  protected readonly totalPhotos = computed(() => this.existingPhotos().length + this.newPhotos().length);

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

  // Clic n'importe ou dans la zone grise -> ouvre le selecteur de fichiers.
  // On ignore les clics sur une photo (et son bouton x) pour ne pas gener la suppression.
  protected onPhotosZoneClick(event: Event, input: HTMLInputElement): void {
    const target = event.target as HTMLElement;
    if (target.closest('.photo-tile')) return;
    if (this.totalPhotos() >= this.MAX_PHOTOS) return;
    input.click();
  }

  // Ajoute les fichiers choisis a la liste, avec un apercu local (URL.createObjectURL)
  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // permet de re-selectionner le meme fichier plus tard

    if (files.length > this.MAX_PHOTOS - this.totalPhotos()) {
      this.error.set(`Maximum ${this.MAX_PHOTOS} photos par annonce.`);
      return;
    }
    if (files.some(f => !PubBidCreate.ALLOWED_TYPES.includes(f.type))) {
      this.error.set('Formats acceptes : JPEG, PNG ou WebP.');
      return;
    }

    this.error.set(null);
    this.newPhotos.update(list => [
      ...list,
      ...files.map(file => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  }

  // Retire une nouvelle photo (pas encore envoyee au backend)
  protected removeNewPhoto(index: number): void {
    const photo = this.newPhotos()[index];
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    this.newPhotos.update(list => list.filter((_, i) => i !== index));
  }

  // Supprime une photo deja enregistree (mode edition) : suppression immediate cote backend
  protected removeExistingPhoto(photo: BidPhoto): void {
    this.bidService.deletePhoto(photo.idPhoto).subscribe({
      next: bid => this.existingPhotos.set(bid.photos),
      error: err => {
        console.error('Erreur suppression photo', err);
        this.error.set('Echec de la suppression de la photo.');
      },
    });
  }

  protected onSubmit(): void {
    const user = this.user();
    if (!user) {
      this.error.set('Vous devez etre connecte pour publier une annonce.');
      return;
    }
    if (!this.title.trim() || !this.description.trim()) return;

    this.submitting.set(true);
    this.error.set(null);

    // L'annonce a deja ete enregistree (echec photos au tour precedent) : on ne renvoie que les photos
    if (this.savedBid) {
      this.uploadPhotosThenClose(this.savedBid);
      return;
    }

    const payload = {
      title: this.title.trim(),
      description: this.description.trim(),
      price: this.price,
      location: this.location.trim() || null,
      userId: user.idUser,
    };

    const request = (this.isEdit && this.editingId !== null)
      ? this.bidService.update(this.editingId, payload)
      : this.bidService.create(payload);

    request.subscribe({
      next: (bid) => {
        this.savedBid = bid;
        this.uploadPhotosThenClose(bid);
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

  // Envoie les nouvelles photos au backend (s'il y en a) puis ferme la modale
  private uploadPhotosThenClose(bid: Bid): void {
    const files = this.newPhotos().map(p => p.file);
    if (files.length === 0) {
      this.finish();
      return;
    }

    this.bidService.uploadPhotos(bid.idBid, files).subscribe({
      next: () => this.finish(),
      error: (err) => {
        console.error('Erreur envoi photos', err);
        this.submitting.set(false);
        // 413 = fichier trop lourd (limite spring.servlet.multipart.max-file-size)
        this.error.set(err?.status === 413
          ? 'Photo trop lourde : 10 Mo maximum par fichier.'
          : 'Annonce enregistree, mais echec de l\'envoi des photos. Reessayez.');
      },
    });
  }

  // Ferme la modale avec un message de succes
  private finish(): void {
    this.submitting.set(false);
    this.modal.close();
    this.toast.success(this.isEdit ? 'Annonce mise a jour.' : 'Annonce publiee.');
  }

  // Libere les apercus locaux quand la modale est detruite (pas de fuite memoire)
  ngOnDestroy(): void {
    this.newPhotos().forEach(p => URL.revokeObjectURL(p.previewUrl));
  }
}
