import { Routes } from '@angular/router';

import { Main } from './features/main/main/main';
import { Profil } from './features/profil/profil/profil';
import { Messages } from './features/messages/messages';
import { MesAnnonces } from './features/mes-annonces/mes-annonces';
import { AdminAccounts } from './features/admin/admin-accounts/admin-accounts';
import { AdminStats } from './features/admin/admin-stats/admin-stats';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Main },
  { path: 'profil', component: Profil, canActivate: [authGuard] },
  { path: 'messages', component: Messages, canActivate: [authGuard] },
  { path: 'mes-annonces', component: MesAnnonces, canActivate: [authGuard] },
  { path: 'admin/accounts', component: AdminAccounts , canActivate: [authGuard]},
  { path: 'admin/stats', component: AdminStats, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
