import {Component, inject, OnInit} from '@angular/core';
import {ChromeService, PageInfo} from '../../../shared/services/chrome.service';

@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.component.html',
  standalone: true,
  styleUrl: './popup.component.scss'
})
export class PopupComponent implements OnInit {
  pageInfo: PageInfo | undefined | null

  private chromeService = inject(ChromeService)

  ngOnInit() {
    this.chromeService.getPageInfoAsync().then(pageInfo => {
      this.pageInfo = pageInfo
    })
  }
}
