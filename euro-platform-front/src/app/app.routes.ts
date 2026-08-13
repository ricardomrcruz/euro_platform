import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuctionDetailComponent } from './auction-detail/auction-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auctions/:id', component: AuctionDetailComponent },
];
