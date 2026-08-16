import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Thread } from '../models/thread.model';
import { Message } from '../models/message.model';
import { API_URL } from '../api';

// Service qui parle au backend Spring (endpoints /api/thread et /api/message)
@Injectable({ providedIn: 'root' })
export class MessageService {

  private http = inject(HttpClient);
  private baseUrl = API_URL;

  // Threads de l'utilisateur (avec infos peer + dernier message)
  findThreadsByUser(userId: number): Observable<Thread[]> {
    return this.http.get<Thread[]>(`${this.baseUrl}/thread/user/${userId}`);
  }

  // Messages d'un thread, du plus ancien au plus recent
  findMessagesByThread(threadId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/thread/${threadId}/messages`);
  }

  // Envoie d'un nouveau message dans un thread
  send(threadId: number, userId: number, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/message`, {
      threadId,
      userId,
      content,
    });
  }
}
