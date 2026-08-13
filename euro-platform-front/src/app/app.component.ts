import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly translate = inject(TranslateService);

  // Keeps <html lang> in sync with the active language for accessibility/SEO,
  // including after the navbar toggle switches it at runtime.
  private readonly syncHtmlLang = effect(() => {
    const lang = this.translate.currentLang();
    if (lang) document.documentElement.lang = lang;
  });
}
