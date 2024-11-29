import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, timer} from 'rxjs';
import {SettingsService} from './settings.service';
import {StatisticsService} from './statistics.service';
import {ChromeService} from './chrome.service';
import Tab = chrome.tabs.Tab;

export interface PageInfo {
  url: string
  title: string
  add_time: number
}

@Injectable({
  providedIn: 'root'
})
export class ReadingListService {
  readingList$ = new BehaviorSubject<PageInfo[]>([])

  private chromeService = inject(ChromeService)
  private statisticsService = inject(StatisticsService)
  private settingsService = inject(SettingsService)
  private timestamp = Math.floor(Date.now() / 1000)
  private timeToStore: number | undefined
  private outdatedSoonThreshold: number | undefined

  private readonly _timestampInterval = 10000
  private readonly _readingListField = 'readingList'
  private readonly _quickDeletionThreshold = 15 * 60

  constructor() {
    this.removeOutdatedItems().then(() => {
      this.getReadingListAsync().then(readingList => this.readingList$.next)
    })

    this.settingsService.get$().then(settings => {
      this.timeToStore = settings.timeToStore * 24 * 3600
      this.outdatedSoonThreshold = settings.outdatedSoonThreshold * 24 * 3600
    })

    timer(this._timestampInterval, this._timestampInterval).subscribe(() => {
      this.timestamp = Math.floor(Date.now() / 1000)
    })
  }

  getPageInfoAsync(): Promise<PageInfo | null> {
    return new Promise(resolve => {
      this.getActiveTabAsync().then(tab => {
        this.getTabTitle(tab).then(title => {
          const timestamp = Math.floor(Date.now() / 1000)
          const url = tab.url ?? null
          const ifNoPageInfo = title === null || url === null
          resolve(ifNoPageInfo ? null : {url, title, add_time: timestamp})
        })
      })
    })
  }

  addToReadingListAsync(pageInfo: PageInfo): Promise<void> {
    return this.getReadingListAsync().then(readingList => {
      readingList.push(pageInfo)
      this.readingList$.next(readingList)
      const clearedReadingList = this.excludeOutdatedFromReadingList(readingList)
      const removedCount = readingList.length - clearedReadingList.length
      return this.chromeStorageUpdateAsync(clearedReadingList)
        .then(this.statisticsService.addUnreadAsync.bind(this.statisticsService, removedCount))
    })
  }

  removeFromReadingListAsync(pageInfo: PageInfo) {
    return this.getReadingListAsync().then(readingList => {
      readingList = readingList.filter(pageInfoInList => pageInfo.url !== pageInfoInList.url)
      const clearedReadingList = this.excludeOutdatedFromReadingList(readingList)
      const removedCount = readingList.length - clearedReadingList.length
      this.readingList$.next(clearedReadingList)
      return this.chromeStorageUpdateAsync(clearedReadingList)
        .then(() => {
          const isQuickDeletion = this.isQuickDeletion(pageInfo)
          if (!isQuickDeletion || removedCount > 0) {
            return this.statisticsService.incrementStatisticsAsync({
              read: this.isQuickDeletion(pageInfo) ? 0 : 1,
              unread: removedCount,
            })
          } else {
            return Promise.resolve()
          }
        })
    })
  }

  getReadingListAsync(): Promise<PageInfo[]> {
    return this.chromeStorageGetAsync()
  }

  isPageInReadingList(pageInfoToCheck: PageInfo, readingList: PageInfo[]) {
    return readingList.some(pageInfoInList => pageInfoToCheck.url === pageInfoInList.url)
  }

  getTimeLeft(pageIngo: PageInfo) {
    return this.timeToStore !== undefined ? this.timeToStore + pageIngo.add_time - this.timestamp : 0;
  }

  isTimeLeftSoonOutdated(timeLeft: number): boolean {
    return this.outdatedSoonThreshold !== undefined ? timeLeft < this.outdatedSoonThreshold : false
  }

  removeOutdatedItems(): Promise<void> {
    return this.getReadingListAsync().then(readingList => {
      const clearedReadingList = this.excludeOutdatedFromReadingList(readingList)
      if (clearedReadingList.length !== readingList.length) {
        const removedCount = readingList.length - clearedReadingList.length
        this.readingList$.next(readingList)
        return this.chromeStorageUpdateAsync(readingList)
          .then(this.statisticsService.addUnreadAsync.bind(this.statisticsService, removedCount))
      } else {
        return Promise.resolve()
      }
    })
  }

  private chromeStorageGetAsync() {
    return this.chromeService.storageGetAsync<PageInfo[]>(this._readingListField, [])
  }

  private chromeStorageUpdateAsync(readingList: PageInfo[]) {
    return this.chromeService.storageSetAsync(this._readingListField, readingList)
      .then(this.chromeNotifyReadingListChange);
  }

  private excludeOutdatedFromReadingList(pageInfo: PageInfo[]) {
    if (this.timeToStore !== undefined) {
      const now = Math.floor(Date.now() / 1000)
      pageInfo = pageInfo.filter(pageInfoItem => now - pageInfoItem.add_time <= this.timeToStore!)
    }
    return pageInfo
  }

  private getActiveTabAsync(): Promise<Tab> {
    return chrome.tabs.query({
      active: true,
      currentWindow: true,
    }).then((tabs: chrome.tabs.Tab[]) => tabs[0])
  }

  private getTabTitle(tab: Tab): Promise<string | null> {
    return new Promise(resolve => {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: (tabTitle) => {
            let title = document.querySelector('h1')?.innerText.trim()
            return new Promise(resolve => resolve(title ? title : tabTitle))
          },
          args: [tab.title]
        })
          .then(([injectionResult]) => {
            resolve(injectionResult.result as string)
          })
          .catch(error => {
            resolve(null)
          })
      } else {
        resolve(null)
      }
    })
  }

  private chromeNotifyReadingListChange() {
    chrome.runtime.sendMessage({type: 'reading-list-update'})
  }

  private isQuickDeletion(pageInfo: PageInfo) {
    const now = Math.floor(Date.now() / 1000)
    return now - pageInfo.add_time < this._quickDeletionThreshold;
  }
}
