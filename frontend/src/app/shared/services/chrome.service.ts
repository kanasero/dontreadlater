import { Injectable } from '@angular/core';
import Tab = chrome.tabs.Tab;

export interface PageInfo {
  url: string
  title: string
}

@Injectable({
  providedIn: 'root'
})
export class ChromeService {

  constructor() { }

  getPageInfoAsync(): Promise<PageInfo> {
    return new Promise(resolve => {
      this.getActiveTabAsync().then(tab => {
        this.getTabTitle(tab).then(title => {
          resolve({
            url: tab.url ?? '',
            title: title ?? '',
          })
        })
      })
    })
  }

  private getActiveTabAsync(): Promise<Tab> {
    return chrome.tabs.query({
      active: true,
      currentWindow: true,
    }).then((tabs: chrome.tabs.Tab[]) => tabs[0])
  }

  private getTabTitle(tab: Tab): Promise<string | undefined> {
    return new Promise(resolve => {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: () => {
            let title = document.querySelector('h1')?.innerText.trim()
            if (!title) {
              title = document.getElementsByTagName('title')?.item(0)?.innerText
            }
            return new Promise(resolve => resolve(title ?? tab.title))
          },
        })
          .then(([injectionResult]) => {
            resolve(injectionResult.result as string)
          })
      } else {
        resolve('')
      }
    })
  }

}
