import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {PageInfo, ReadingListService} from '../../../shared/services/reading-list.service';
import {Subscription} from 'rxjs';
import {SecondsToTimeStringPipe} from '../../../shared/pipes/seconds-to-time-string.pipe';


@Component({
  selector: 'app-popup',
  imports: [
    SecondsToTimeStringPipe
  ],
  templateUrl: './popup.component.html',
  standalone: true,
  styleUrl: './popup.component.scss'
})
export class PopupComponent implements OnInit, OnDestroy {
  pageInfo: PageInfo | undefined | null
  readingList: PageInfo[] | undefined
  isPageInReadingList = false
  readingListService = inject(ReadingListService)

  private subscription = new Subscription()

  ngOnInit() {
    Promise.all([
      this.readingListService.getPageInfoAsync(),
      this.readingListService.getReadingListAsync(),
    ]).then(([pageInfo, readingList]) => {
      this.readingList = readingList
      this.pageInfo = pageInfo
      this.checkIsPageInReadList();
    })

    this.subscription.add(
      this.readingListService.readingList$.subscribe(readingList => {
        this.readingList = readingList
        this.checkIsPageInReadList()
      })
    )

  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  addToReadingList(pageInfo: PageInfo) {
    this.readingListService.addToReadingListAsync(pageInfo)
  }

  removeFromReadingList(pageInfo: PageInfo) {
    this.readingListService.removeFromReadingListAsync(pageInfo)
  }

  private checkIsPageInReadList() {
    const isDataReady = this.pageInfo === null || this.pageInfo === undefined || this.readingList === undefined;
    this.isPageInReadingList = isDataReady ? false : this.readingListService.isPageInReadingList(this.pageInfo!, this.readingList!)
  }

}
