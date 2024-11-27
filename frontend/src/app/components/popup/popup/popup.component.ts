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

  private chromeService = inject(ChromeService)

  ngOnInit() {
    this.chromeService.getPageInfoAsync().then(pageInfo => {
      this.pageInfo = pageInfo
    })

    this.chromeService.getReadingListAsync().then(readingList => {
      this.readingList = readingList
    })
  }

  addToReadingList(pageInfo: PageInfo) {
    this.chromeService.addToReadingListAsync(pageInfo)
  }
}
