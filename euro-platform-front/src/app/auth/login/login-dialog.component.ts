import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

// Mounted once in the app shell -- opened from anywhere (navbar, the register dialog's
// post-success prompt, the session-expiry warning, the interceptor's reactive 401 handling)
// via AuthService.openLoginDialog().
@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Dialog, ButtonModule, InputText, Checkbox, TranslatePipe],
  templateUrl: './login-dialog.component.html',
})
export class LoginDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly visible = this.authService.loginDialogVisible;
  readonly sessionExpiredNotice = this.authService.sessionExpiredNotice;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  readonly submitting = signal(false);
  readonly errorKey = signal<string | null>(null);

  constructor() {
    // Re-syncs the email/remember-me fields to whatever's currently remembered every time the
    // dialog opens -- covers logging in with "remember me" and then, later, this same
    // long-lived instance reopening on a session expiry with a freshly-remembered email.
    effect(() => {
      if (!this.visible()) return;
      const email = this.authService.rememberedEmail();
      this.form.patchValue({ email, rememberMe: !!email });
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorKey.set(null);
    try {
      await this.authService.login(this.form.getRawValue());
      this.form.patchValue({ password: '' });
      this.close();
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      this.errorKey.set(
        status === 401 ? 'auth.login.invalidCredentialsError' : 'auth.login.genericError',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) this.close();
  }

  switchToRegister(): void {
    this.close();
    this.authService.openRegisterDialog();
  }

  close(): void {
    this.authService.closeLoginDialog();
  }
}
