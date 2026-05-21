import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  // Liste des toasts actuellement affiches, lue par le composant ToastList
  readonly toasts = signal<Toast[]>([]);

  private nextId = 0;

  // Affiche un toast pendant `duration` ms puis le retire automatiquement
  show(message: string, type: ToastType = 'info', duration = 3000): void {
    const id = ++this.nextId;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }

  // Retire un toast manuellement (croix de fermeture ou timeout)
  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
