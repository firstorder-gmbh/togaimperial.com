import { Component } from '@angular/core';

import { FooterService } from '../../shared/footer/footer.service';
import { HeaderService } from '../../shared/header/header.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  constructor(
      private footerService: FooterService,
      private headerService: HeaderService
  ) {
    this.footerService.footerClass$.next(null);
    this.headerService.headerClass$.next(null);
    this.headerService.headerTitle$.next('ABOUT.TITLE');
  }
}
