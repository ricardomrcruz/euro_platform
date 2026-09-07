import { Component, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

// Mounted once in the app shell -- fires ahead of the token's own expiry (see
// AuthService.scheduleExpiryWarning) so the user gets a chance to stay signed in before an
// action actually fails, rather than only ever finding out reactively.
@Component({
  selector: 'app-session-warning-dialog',
  standalone: true,
  imports: [Dialog, ButtonModule, TranslatePipe],
  templateUrl: './session-warning-dialog.component.html',
})
export class SessionWarningDialogComponent {
  private readonly authService = inject(AuthService);

  readonly visible = this.authService.sessionWarningVisible;

  extendSession(): void {
    this.authService.extendSession();
  }

  dismiss(): void {
    this.authService.dismissSessionWarning();
  }
}
