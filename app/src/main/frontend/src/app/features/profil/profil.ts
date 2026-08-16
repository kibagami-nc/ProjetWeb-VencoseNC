import { Component, inject } from '@angular/core';

import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-profil',
  imports: [],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {

  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.currentUser!;

  protected get initials(): string {
    const f = this.user.firstName?.charAt(0) ?? '';
    const l = this.user.lastName?.charAt(0) ?? '';
    return (f + l).toUpperCase();
  }
}
