import {Component, inject, OnInit} from '@angular/core';
import {Statistics, StatisticsService} from '../../../shared/services/statistics.service';

@Component({
  selector: 'app-brief-statistics',
  imports: [],
  templateUrl: './brief-statistics.component.html',
  styleUrl: './brief-statistics.component.scss',
  standalone: true,
})
export class BriefStatisticsComponent implements OnInit {
  statistics: Statistics | undefined
  readPercentage: number | undefined

  private statisticsService = inject(StatisticsService)

  ngOnInit() {
    this.statisticsService.getStatisticsAsync().then(this.updateStatistics.bind(this))
    this.statisticsService.statisticsChange$.subscribe(this.updateStatistics.bind(this))
  }

  private updateStatistics(statistics: Statistics) {
    this.statistics = statistics
    this.readPercentage = Math.round(10000 * statistics.read / (statistics.read + statistics.unread)) / 100
  }
}
