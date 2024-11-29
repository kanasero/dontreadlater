import {inject, Injectable} from '@angular/core';
import {ChromeService} from './chrome.service';

export interface Statistics {
  read: number
  unread: number
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private chromeService = inject(ChromeService)

  private readonly _statisticsField = 'statistics'
  private readonly _initialStatistics: Statistics = {
    read: 0,
    unread: 0
  }

  constructor() {
  }

  addReadAsync(count: number): Promise<void> {
    return this.incrementStatisticsAsync({read: count})
  }

  addUnreadAsync(count: number): Promise<void> {
    return this.incrementStatisticsAsync({unread: count})
  }

  incrementStatisticsAsync(incrementStatistics: Partial<Record<keyof Statistics, number>>): Promise<void> {
    return this.chromeService.storageGetAsync<Statistics>(this._statisticsField, this._initialStatistics)
      .then(statistics => {
        console.log(statistics, incrementStatistics)
        for (const key in incrementStatistics) {
          statistics[key as keyof Statistics] += incrementStatistics[key as keyof Statistics]!
        }
        console.log(statistics)
        return this.saveStatistics(statistics)
      })
  }

  private saveStatistics(statistics: Statistics): Promise<void> {
    return this.chromeService.storageSetAsync(this._statisticsField, statistics)
  }
}
