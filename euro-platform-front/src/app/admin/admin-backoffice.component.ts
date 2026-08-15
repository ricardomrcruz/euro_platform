import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

// Minimal placeholder -- the real content (the pending-ads review queue, validate/reject
// actions) is separate future work, this just gives the navbar identity link somewhere real
// to go for admins.
@Component({
  selector: 'app-admin-backoffice',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './admin-backoffice.component.html',
})
export class AdminBackofficeComponent {}
