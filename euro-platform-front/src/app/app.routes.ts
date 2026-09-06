import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuctionsListComponent } from './auctions-list/auctions-list.component';
import { AuctionDetailComponent } from './auction-detail/auction-detail.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminBackofficeComponent } from './admin/admin-backoffice.component';
import { CreateAdComponent } from './ad/create-ad/create-ad.component';
import { LaunchAuctionComponent } from './auction/launch-auction/launch-auction.component';
import { authGuard, adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auctions', component: AuctionsListComponent },
  { path: 'auctions/:id', component: AuctionDetailComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminBackofficeComponent, canActivate: [adminGuard] },
  { path: 'sell', component: CreateAdComponent, canActivate: [authGuard] },
  { path: 'sell/:id', component: CreateAdComponent, canActivate: [authGuard] },
  { path: 'sell/:id/auction', component: LaunchAuctionComponent, canActivate: [authGuard] },
];
