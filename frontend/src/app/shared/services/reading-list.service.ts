import {Injectable} from '@angular/core';
import {BehaviorSubject, timer} from 'rxjs';
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

  private timestamp = Math.floor(Date.now() / 1000)
  private timeToStore = 7 * 24 * 3600

  private readonly _timestampInterval = 10000

  constructor() {
    this.getReadingListAsync().then(readingList => this.readingList$.next)

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
      readingList.unshift(pageInfo)
      this.readingList$.next(readingList)
      readingList = this.removeOutdatedFromReadingList(readingList)
      return chrome.storage.local.set({readingList: readingList})
    })
  }

  removeFromReadingListAsync(pageInfo: PageInfo) {
    return this.getReadingListAsync().then(readingList => {
      readingList = readingList.filter(pageInfoInList => pageInfo.url !== pageInfoInList.url)
      this.readingList$.next(readingList)
      readingList = this.removeOutdatedFromReadingList(readingList)
      return chrome.storage.local.set({readingList: readingList})
    })
  }

  getReadingListAsync(): Promise<PageInfo[]> {
    return chrome.storage.local.get('readingList')
      .then(({readingList}) => readingList ?? [])
  }

  isPageInReadingList(pageInfoToCheck: PageInfo, readingList: PageInfo[]) {
    return readingList.some(pageInfoInList => pageInfoToCheck.url === pageInfoInList.url)
  }

  private removeOutdatedFromReadingList(pageInfo: PageInfo[]) {
    const now = Math.floor(Date.now() / 1000)
    pageInfo = pageInfo.filter(pageInfoItem => now - pageInfoItem.add_time <= this.timeToStore)
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

  getTimeLeft(pageIngo: PageInfo) {
    return this.timeToStore + pageIngo.add_time - this.timestamp;
  }
}
