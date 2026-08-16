import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';

import { Bid } from '../models/bid.model';
import { API_URL } from '../api';


// Service qui parle au backend Spring (endpoint /api/bid)
@Injectable({ providedIn: 'root' })
export class BidService {

  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/bid`;

  // Stream des nouvelles annonces creees, ecoute par les pages qui affichent la liste
  // pour s'inserer en tete sans avoir a refetch
  private readonly bidCreated$ = new Subject<Bid>();
  readonly bidCreated = this.bidCreated$.asObservable();

  // Stream des annonces mises a jour (meme principe, ecoute par les listes)
  private readonly bidUpdated$ = new Subject<Bid>();
  readonly bidUpdated = this.bidUpdated$.asObservable();

  // Stream des annonces supprimees (id), ecoute par les listes pour retirer la carte
  private readonly bidDeleted$ = new Subject<number>();
  readonly bidDeleted = this.bidDeleted$.asObservable();

  // Recupere toutes les annonces
  findAll(): Observable<Bid[]> {
    return this.http.get<Bid[]>(this.apiUrl);
  }

  // Recupere une annonce par son id
  findById(id: number): Observable<Bid> {
    return this.http.get<Bid>(`${this.apiUrl}/${id}`);
  }

  // Cree une nouvelle annonce (le back fixe creationDate)
  create(payload: Partial<Bid>): Observable<Bid> {
    return this.http.post<Bid>(this.apiUrl, payload).pipe(
      tap(bid => this.bidCreated$.next(bid)),
    );
  }

  // Met a jour une annonce existante
  update(id: number, payload: Partial<Bid>): Observable<Bid> {
    return this.http.put<Bid>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(bid => this.bidUpdated$.next(bid)),
    );
  }

  // Supprime une annonce par son id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.bidDeleted$.next(id)),
    );
  }

  // Ajoute des photos a une annonce (envoi multipart) ; renvoie l'annonce mise a jour
  uploadPhotos(bidId: number, files: File[]): Observable<Bid> {
    const form = new FormData();
    files.forEach(file => form.append('files', file));
    return this.http.post<Bid>(`${this.apiUrl}/${bidId}/photo`, form).pipe(
      tap(bid => this.bidUpdated$.next(bid)),
    );
  }

  // Supprime une photo d'annonce ; renvoie l'annonce mise a jour
  deletePhoto(photoId: number): Observable<Bid> {
    return this.http.delete<Bid>(`${API_URL}/photo/${photoId}`).pipe(
      tap(bid => this.bidUpdated$.next(bid)),
    );
  }
}
