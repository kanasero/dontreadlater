import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'secondsToTimeString',
  standalone: true,
})
export class SecondsToTimeStringPipe implements PipeTransform {

  transform(seconds: number): unknown {
    const days = Math.floor(seconds / 3600 / 24)
    seconds -= days * 3600 * 24
    const hours = Math.floor(seconds / 3600)
    seconds -= hours * 3600
    const minutes = Math.floor(seconds / 60)
    if (days === 0) {
      if (hours > 1) {
        return `>${hours}h`
      } else if (minutes >= 10) {
        return `${hours}h ${minutes}m`
      } else {
        return `<10m`
      }
    } else {
      if (hours === 0) {
        return `${days}d`
      } else {
        return `${days}d ${hours}h`
      }
    }
  }

}
