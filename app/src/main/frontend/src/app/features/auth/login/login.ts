import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalService } from '../../../shared/services/modal.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-login',
  imports: [FormsModule, Icon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  protected readonly modal = inject(ModalService);
  private readonly auth = inject(AuthService);

  email = '';
  password = '';
  errorMessage = signal('');
  showPassword = signal(false);

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }

  // Tente la connexion via AuthService ; ferme la modale si succes, affiche l'erreur sinon
  onSubmit() {
    this.errorMessage.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.modal.close(),
      error: () => this.errorMessage.set('Email ou mot de passe incorrect'),
    });
  }
}
