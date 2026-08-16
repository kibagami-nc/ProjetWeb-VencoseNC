import { Component, inject } from '@angular/core';

import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-pub-search',
  imports: [],
  templateUrl: './pub-search.html',
  styleUrl: './pub-search.css',
})
export class PubSearch {

  protected readonly search = inject(SearchService);

  // Chaque frappe met a jour la recherche partagee : la liste filtre en direct
  protected onSearch(event: Event): void {
    this.search.query.set((event.target as HTMLInputElement).value);
  }
}
