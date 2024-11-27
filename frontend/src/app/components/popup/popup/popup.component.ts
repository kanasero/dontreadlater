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
  readingList: PageInfo[] | undefined
  isPageInReadingList = false

  private chromeService = inject(ChromeService)

  ngOnInit() {
    Promise.all([
      this.chromeService.getPageInfoAsync(),
      this.chromeService.getReadingListAsync(),
    ]).then(([pageInfo, readingList]) => {
      this.readingList = readingList
      this.isPageInReadingList = pageInfo === null ?
        false : this.chromeService.isPageInReadingList(pageInfo, this.readingList)
      this.pageInfo = pageInfo
    })
  }

  addToReadingList(pageInfo: PageInfo) {
    this.chromeService.addToReadingListAsync(pageInfo)
  }

  removeFromReadingList(pageInfo: PageInfo) {

  }
}
