import { Component, ElementRef, Injector, OnInit, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { interval } from 'rxjs';

import { Thread } from '../../shared/models/thread.model';
import { Message } from '../../shared/models/message.model';
import { MessageService } from '../../shared/services/message.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-messages',
  imports: [FormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly userId = inject(AuthService).currentUser?.idUser ?? 0;
  private readonly injector = inject(Injector);

  protected readonly threads = signal<Thread[]>([]);
  protected readonly messages = signal<Message[]>([]);
  protected readonly selectedId = signal<number | null>(null);

  // Reference au conteneur scrollable des messages, utilisee pour le scroll automatique en bas
  private readonly chatThread = viewChild<ElementRef<HTMLDivElement>>('chatThread');

  protected draft = '';

  // Lance le polling : toutes les 10s on rafraichit threads + messages.
  // takeUntilDestroyed() coupe l'abonnement quand le composant est detruit (pas de fuite memoire).
  constructor() {
    interval(10000).pipe(takeUntilDestroyed()).subscribe(() => this.refresh());
  }

  // Hook Angular appele une fois au montage du composant.
  // Charge la liste des threads de l'utilisateur, les trie, puis selectionne le premier par defaut.
  ngOnInit(): void {
    this.messageService.findThreadsByUser(this.userId).subscribe(threads => {
      const sorted = this.sort(threads);
      this.threads.set(sorted);
      if (sorted.length > 0) this.select(sorted[0].idThread);
    });
  }

  // Selectionne un thread : memorise son id et charge ses messages depuis l'API.
  // Appelee quand l'utilisateur clique sur une conversation dans la liste de gauche.
  // Apres chargement, on scrolle automatiquement en bas pour afficher le message le plus recent.
  protected select(id: number): void {
    this.selectedId.set(id);
    this.messageService.findMessagesByThread(id).subscribe(m => {
      this.messages.set(m);
      this.scrollToBottom();
    });
  }

  // Renvoie l'objet Thread actuellement selectionne (ou null si aucun).
  // Utilise par le template pour afficher l'en-tete de la conversation (nom du peer, etc.).
  protected selectedThread(): Thread | null {
    return this.threads().find(t => t.idThread === this.selectedId()) ?? null;
  }

  // Construit le nom complet du peer (autre participant) a partir du thread.
  // Le backend nous donne deja peerFirstName/peerLastName via ThreadMapper, on les concatene.
  protected peerName(t: Thread | null): string {
    return t ? `${t.peerFirstName ?? ''} ${t.peerLastName ?? ''}`.trim() : '';
  }

  // Extrait les initiales d'un nom (max 2 lettres) pour l'avatar par defaut.
  // Ex: "Manley Bouille" -> "MB". Renvoie "?" si vide.
  protected initials(name: string): string {
    return name.split(' ').filter(Boolean).map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  // Formate une date ISO en JJ/MM/AAAA HH:mm (utilise pour le dernier message d'une conversation
  // et pour la previsualisation dans la sidebar).
  // Ex: "2026-05-11T14:32:00" -> "11/05/2026 14:32".
  protected formatDateTime(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const date = d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  }

  // Indique si le message passe est le dernier d'un "bloc" consecutif du meme expediteur.
  // Le timestamp s'affiche en bas de chaque bloc (juste avant que l'autre participant prenne la parole),
  // ce qui evite la repetition tout en gardant une trace temporelle pour chaque echange.
  protected isLast(msg: Message): boolean {
    const list = this.messages();
    const idx = list.findIndex(m => m.idMessage === msg.idMessage);
    if (idx === -1) return false;
    if (idx === list.length - 1) return true;
    return this.isMine(list[idx + 1]) !== this.isMine(msg);
  }

  // Verifie si un message a ete envoye par l'utilisateur courant.
  // Le template s'en sert pour aligner la bulle a droite (mes messages) ou a gauche (peer).
  protected isMine(msg: Message): boolean {
    return msg.userId === this.userId;
  }

  // Envoie le message en cours de redaction (this.draft) dans le thread selectionne.
  // - Bloque si le texte est vide ou aucun thread selectionne
  // - Apres succes : ajoute le message a la liste, met a jour la preview du thread, vide le champ
  protected send(): void {
    const text = this.draft.trim();
    const id = this.selectedId();
    if (!text || id === null) return;

    this.messageService.send(id, this.userId, text).subscribe(created => {
      this.messages.update(l => [...l, created]);
      this.threads.update(l => l.map(t => t.idThread === id
        ? { ...t, lastMessage: created.content, lastMessageAt: created.sentAt }
        : t));
      this.draft = '';
      this.scrollToBottom();
    });
  }

  // Place le scroll du fil de discussion tout en bas. Appele apres chargement d'une
  // conversation et apres l'envoi d'un message.
  // afterNextRender s'execute apres le rendu Angular mais AVANT le prochain paint :
  // l'utilisateur ne voit jamais les messages s'afficher en haut avant de descendre.
  private scrollToBottom(): void {
    afterNextRender(() => {
      const el = this.chatThread()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, { injector: this.injector });
  }

  // Rafraichit silencieusement les donnees (appelee par le polling).
  // Recharge la liste des threads + les messages du thread actif s'il y en a un.
  private refresh(): void {
    this.messageService.findThreadsByUser(this.userId).subscribe(t => this.threads.set(this.sort(t)));
    const id = this.selectedId();
    if (id !== null) {
      this.messageService.findMessagesByThread(id).subscribe(m => this.messages.set(m));
    }
  }

  // Trie les threads par idThread croissant pour garder un ordre stable dans la liste.
  // Renvoie une nouvelle copie (immutabilite des signals).
  private sort(threads: Thread[]): Thread[] {
    return [...threads].sort((a, b) => a.idThread - b.idThread);
  }
}
