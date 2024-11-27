import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ChromeService, PageInfo} from '../../../shared/services/chrome.service';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-popup',
  imports: [],
  templateUrl: './popup.component.html',
  standalone: true,
  styleUrl: './popup.component.scss'
})
export class PopupComponent implements OnInit, OnDestroy {
  pageInfo: PageInfo | undefined | null
  readingList: PageInfo[] | undefined
  isPageInReadingList = false

  private chromeService = inject(ChromeService)
  private subscription = new Subscription()

  ngOnInit() {
    Promise.all([
      this.chromeService.getPageInfoAsync(),
      this.chromeService.getReadingListAsync(),
    ]).then(([pageInfo, readingList]) => {
      this.readingList = readingList
      this.pageInfo = pageInfo
      this.checkIsPageInReadList();
    })

    this.subscription.add(
      this.chromeService.readingList$.subscribe(readingList => {
        this.readingList = readingList
        this.checkIsPageInReadList()
      })
    )
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  private checkIsPageInReadList() {
    const isDataReady = this.pageInfo === null || this.pageInfo === undefined || this.readingList === undefined;
    this.isPageInReadingList = isDataReady ? false : this.chromeService.isPageInReadingList(this.pageInfo!, this.readingList!)
  }

  addToReadingList(pageInfo: PageInfo) {
    this.chromeService.addToReadingListAsync(pageInfo)
  }

  removeFromReadingList(pageInfo: PageInfo) {
    this.chromeService.removeFromReadingListAsync(pageInfo)
  }
}
