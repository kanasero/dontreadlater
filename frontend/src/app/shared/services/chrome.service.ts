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

  getPageInfoAsync(): Promise<PageInfo | null> {
    return new Promise(resolve => {
      this.getActiveTabAsync().then(tab => {
        this.getTabTitle(tab).then(title => {
          const url = tab.url ?? null
          resolve(title === null || url === null ? null : {url, title})
          resolve({url: '', title: ''})
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

}
