import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuctionDetailComponent } from './auction-detail/auction-detail.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminBackofficeComponent } from './admin/admin-backoffice.component';
import { CreateAdComponent } from './ad/create-ad/create-ad.component';
import { authGuard, adminGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auctions/:id', component: AuctionDetailComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminBackofficeComponent, canActivate: [adminGuard] },
  { path: 'sell', component: CreateAdComponent, canActivate: [authGuard] },
];
