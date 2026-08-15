import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AppLang, SUPPORTED_LANGS, setStoredLang } from '../../i18n/lang-storage';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ButtonModule, IconField, InputIcon, InputText, TranslatePipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);

  readonly langs = SUPPORTED_LANGS;
  readonly currentLang = this.translate.currentLang;

  readonly currentUser = this.authService.currentUser;
  // CLIENT/GUEST land on their profile, ADMIN lands on the backoffice.
  readonly identityRoute = computed(() =>
    this.currentUser()?.role === 'ADMIN' ? '/admin' : '/profile',
  );
  // "Ricardo Martinho" -> "Ricardo M." -- falls back to email for tokens issued before
  // firstName/lastName were added to the payload (still valid, just missing these claims
  // until the holder logs in again).
  readonly displayName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    if (!user.firstName || !user.lastName) return user.email;
    return `${user.firstName} ${user.lastName.charAt(0)}.`;
  });

  switchLang(lang: AppLang): void {
    this.translate.use(lang).subscribe();
    setStoredLang(lang);
  }

  openLoginDialog(): void {
    this.authService.openLoginDialog();
  }

  signOut(): void {
    this.authService.logout();
  }
}
