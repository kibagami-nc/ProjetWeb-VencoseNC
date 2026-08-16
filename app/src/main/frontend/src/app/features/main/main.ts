import { Component } from '@angular/core';

import { PubSearch } from '../../../shared/public/pub-search/pub-search';
import { PubBidList } from '../../../shared/public/pub-bid-list/pub-bid-list';
import { Accueil } from '../accueil/accueil';

@Component({
  selector: 'app-main-hero',
  imports: [PubSearch, PubBidList, Accueil],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {

}
