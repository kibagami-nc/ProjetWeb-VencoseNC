import { SERVER_URL } from '../api';

// Une photo d'annonce telle que renvoyee par le backend (PhotoDto)
export interface BidPhoto {
  idPhoto: number;
  url: string;
}

// Modele Bid : reflete le BidDto envoye par le backend
export interface Bid {
  idBid: number;
  title: string;
  description: string;
  price: number | null;
  location: string | null;
  creationDate: string;
  userId: number;
  userFirstName: string;
  userLastName: string;
  photos: BidPhoto[];
}

// Image locale affichee quand une annonce n'a pas de photo (aucune requete externe)
export const PLACEHOLDER_IMG = '/img-placeholder.svg';

// Convertit l'url stockee en BDD en URL affichable :
// - "/uploads/..." (nos fichiers) -> prefixee par l'origine du backend
// - URL http(s) complete (donnees de demo) -> inchangee
export function photoSrc(url: string): string {
  return url.startsWith('http') ? url : SERVER_URL + url;
}

// Photo principale d'une annonce (la premiere), ou placeholder local si aucune
export function bidPhotoSrc(bid: Bid): string {
  const first = bid.photos?.[0];
  return first ? photoSrc(first.url) : PLACEHOLDER_IMG;
}

// Remplace une image cassee (ex: URL de demo qui n'existe plus) par le placeholder
export function onImgError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (!img.src.endsWith(PLACEHOLDER_IMG)) img.src = PLACEHOLDER_IMG;
}
