import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';

// Minimal placeholder -- the real content (the user's ads/auctions with their status) is
// separate future work, this just gives the navbar identity link somewhere real to go.
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;
}
