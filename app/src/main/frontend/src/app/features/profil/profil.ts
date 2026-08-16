import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-profil',
  imports: [FormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {

  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  // Utilisateur connecte (signal du service : l'affichage se met a jour apres enregistrement)
  protected readonly user = this.auth.currentUser;

  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  // Copies locales des champs : modifiees dans le formulaire,
  // envoyees au backend seulement quand on clique "Enregistrer"
  protected lastName = '';
  protected firstName = '';
  protected email = '';
  protected phoneMobile = '';
  protected phoneLandline = '';

  constructor() {
    this.syncFields();
  }

  protected get initials(): string {
    const u = this.user();
    const f = u?.firstName?.charAt(0) ?? '';
    const l = u?.lastName?.charAt(0) ?? '';
    return (f + l).toUpperCase();
  }

  // Passe en mode edition : les champs deviennent saisissables
  protected startEdit(): void {
    this.syncFields();
    this.error.set(null);
    this.editing.set(true);
  }

  // Abandonne les modifications et revient a l'affichage
  protected cancelEdit(): void {
    this.syncFields();
    this.error.set(null);
    this.editing.set(false);
  }

  // Valide les champs puis envoie les modifications au backend
  protected save(): void {
    if (!this.lastName.trim() || !this.firstName.trim()) {
      this.error.set('Nom et prenom sont obligatoires.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.error.set('L\'email n\'est pas valide');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.auth.updateProfile({
      lastName: this.lastName.trim(),
      firstName: this.firstName.trim(),
      email: this.email.trim(),
      phoneMobile: this.phoneMobile.trim(),
      phoneLandline: this.phoneLandline.trim(),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.toast.success('Profil mis a jour.');
      },
      error: (err) => {
        console.error('Erreur mise a jour profil', err);
        this.saving.set(false);
        this.error.set('Echec de la mise a jour (email deja utilise ?).');
      },
    });
  }

  // Recharge les champs locaux depuis l'utilisateur connecte
  private syncFields(): void {
    const u = this.user();
    if (!u) return;
    this.lastName = u.lastName;
    this.firstName = u.firstName;
    this.email = u.email;
    this.phoneMobile = u.phoneMobile ?? '';
    this.phoneLandline = u.phoneLandline ?? '';
  }
}
