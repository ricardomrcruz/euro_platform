import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

// Mounted once in the app shell -- opened from anywhere (navbar, the register page's
// post-success prompt) via AuthService.openLoginDialog().
@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Dialog, ButtonModule, InputText, TranslatePipe],
  templateUrl: './login-dialog.component.html',
})
export class LoginDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly visible = this.authService.loginDialogVisible;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly submitting = signal(false);
  readonly errorKey = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorKey.set(null);
    try {
      await this.authService.login(this.form.getRawValue());
      this.form.reset();
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

  close(): void {
    this.authService.closeLoginDialog();
  }
}
