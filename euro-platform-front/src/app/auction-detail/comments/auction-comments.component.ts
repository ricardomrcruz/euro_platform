import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TranslatePipe } from '@ngx-translate/core';
import type { CommentItem } from '../interfaces/auction-detail.interface';

@Component({
  selector: 'app-auction-comments',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputText, TranslatePipe],
  templateUrl: './auction-comments.component.html',
})
export class AuctionCommentsComponent {
  comments = input.required<CommentItem[]>();

  initials(author: string): string {
    return author.slice(0, 2).toUpperCase();
  }
}
