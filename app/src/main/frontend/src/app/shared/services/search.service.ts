import { Injectable, signal } from '@angular/core';

import { Bid } from '../models/bid.model';

// Etat partage de la recherche : les deux barres (navbar et hero de l'accueil)
// ecrivent dans le meme signal `query`, et la liste des annonces filtre dessus.
@Injectable({ providedIn: 'root' })
export class SearchService {

  // Texte tape par l'utilisateur (le meme pour les deux barres)
  readonly query = signal('');

  // Vrai si l'annonce correspond a la recherche courante
  // (titre, description ou commune, sans tenir compte de la casse ni des accents)
  matches(bid: Bid): boolean {
    const q = this.normalize(this.query().trim());
    if (!q) return true;

    return [bid.title, bid.description, bid.location ?? '']
      .some(field => this.normalize(field).includes(q));
  }

  // Normalise un texte pour la comparaison : minuscules et sans accents
  // ("Vélo" -> "velo", ainsi "velo" trouve "Vélo VTT")
  private normalize(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
}
