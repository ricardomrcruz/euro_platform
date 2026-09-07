import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

// Mounted once in the app shell, mirroring app-login-dialog -- opened from anywhere via
// AuthService.openRegisterDialog().
@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Dialog, ButtonModule, InputText, TranslatePipe],
  templateUrl: './register-dialog.component.html',
})
export class RegisterDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly visible = this.authService.registerDialogVisible;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
  });

  readonly submitting = signal(false);
  readonly registered = signal(false);
  readonly errorKey = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorKey.set(null);
    try {
      await this.authService.register(this.form.getRawValue());
      this.registered.set(true);
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 0;
      this.errorKey.set(
        status === 409 ? 'auth.register.emailTakenError' : 'auth.register.genericError',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) this.close();
  }

  switchToLogin(): void {
    this.close();
    this.authService.openLoginDialog();
  }

  close(): void {
    this.authService.closeRegisterDialog();
    // Reset so reopening later starts fresh rather than showing the previous success screen.
    this.registered.set(false);
    this.form.reset();
  }
}
