import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalService } from '../../../shared/services/modal.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-register',
  imports: [FormsModule, Icon],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  protected readonly modal = inject(ModalService);
  private readonly auth = inject(AuthService);

  lastName = '';
  firstName = '';
  email = '';
  phoneMobile = '';
  phoneLandline = '';
  password = '';
  confirmPassword = '';
  errorMessage = signal('');
  showPassword = signal(false);

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }

  // Valide les champs puis cree le compte via AuthService.
  // En cas de succes l'utilisateur est directement connecte et la modale se ferme.
  onSubmit() {
    this.errorMessage.set('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.errorMessage.set('L\'email n\'est pas valide');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(this.password)) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas');
      return;
    }

    this.auth.register({
      lastName: this.lastName,
      firstName: this.firstName,
      email: this.email,
      phoneMobile: this.phoneMobile,
      phoneLandline: this.phoneLandline,
      password: this.password,
    }).subscribe({
      next: () => this.modal.close(),
      error: () => this.errorMessage.set('Erreur lors de l\'inscription'),
    });
  }
}
