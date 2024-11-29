import {inject, Injectable} from '@angular/core';
import {ChromeService} from './chrome.service';
import {Subject} from 'rxjs';

export interface Statistics {
  read: number
  unread: number
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  statisticsChange$ = new Subject<Statistics>();

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
    return this.getStatisticsAsync()
      .then(statistics => {
        for (const key in incrementStatistics) {
          statistics[key as keyof Statistics] += incrementStatistics[key as keyof Statistics]!
        }
        return this.saveStatistics(statistics)
      })
  }

  getStatisticsAsync(): Promise<Statistics> {
    return this.chromeService.storageGetAsync<Statistics>(this._statisticsField, this._initialStatistics)
  }

  private saveStatistics(statistics: Statistics): Promise<void> {
    return this.chromeService.storageSetAsync(this._statisticsField, statistics)
      .then(() => {
        this.statisticsChange$.next(statistics)
      })
  }
}
