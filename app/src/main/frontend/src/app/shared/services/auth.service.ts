import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../api';

// Utilisateur retourne par le backend (UserDto)
export interface AuthUser {
  idUser: number;
  lastName: string;
  firstName: string;
  email: string;
  phoneMobile: string;
  phoneLandline: string;
  registrationDate: string;
  isActive: boolean;
}

// Donnees envoyees au backend pour creer un compte
export interface RegisterPayload {
  lastName: string;
  firstName: string;
  email: string;
  phoneMobile: string;
  phoneLandline: string;
  password: string;
}

// Service qui gere la session utilisateur : connexion, inscription, deconnexion.
// Tous les appels HTTP lies a l'authentification passent par ici (jamais par les composants).
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);

  // Utilisateur connecte (null si personne). Signal prive en ecriture :
  // seul ce service peut le modifier, les composants le lisent via `currentUser()`.
  private readonly _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  // Derive du signal ci-dessus : les templates qui l'utilisent (navbar...)
  // se mettent a jour automatiquement au login / logout.
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  // POST /api/auth/login : connecte l'utilisateur puis memorise sa session
  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${API_URL}/auth/login`, { email, password })
      .pipe(tap(user => this.setUser(user)));
  }

  // POST /api/user : cree le compte puis connecte directement l'utilisateur
  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${API_URL}/user`, payload)
      .pipe(tap(user => this.setUser(user)));
  }

  logout(): void {
    this._currentUser.set(null);
    if (this.hasStorage()) {
      localStorage.removeItem('user');
    }
  }

  // Recharge l'utilisateur depuis le localStorage (utilise au demarrage de l'app)
  loadFromStorage(): void {
    if (!this.hasStorage()) return;
    const data = localStorage.getItem('user');
    if (data) {
      this._currentUser.set(JSON.parse(data));
    }
  }

  // Memorise l'utilisateur en memoire + localStorage (pour survivre au rechargement de la page)
  private setUser(user: AuthUser): void {
    this._currentUser.set(user);
    if (this.hasStorage()) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Verifie qu'on est cote navigateur (localStorage n'existe pas en SSR)
  private hasStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
