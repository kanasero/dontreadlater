import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {debounceTime, Subject} from 'rxjs';
import {SettingsOptions, SettingsService} from '../../shared/services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  standalone: true,
})
export class SettingsComponent implements OnInit {
  settings = new FormGroup({
    timeToStore: new FormControl<number>(7, [Validators.required]),
    outdatedSoonThreshold: new FormControl<number>(3, [Validators.required]),
  })
  settingsChanges$ = new Subject<SettingsOptions>()

  private settingsService = inject(SettingsService)

  ngOnInit() {
    this.settings.valueChanges.subscribe(values => {
      this.setOutdatedSoonThresholdNotGreaterThanTimeToStore()
      if (values.timeToStore && values.outdatedSoonThreshold) {
        this.settingsChanges$.next(values as SettingsOptions)
      }
    })

    this.settingsChanges$.pipe(debounceTime(500)).subscribe(settings => {
      this.settingsService.update$(settings)
    })

    this.settingsService.get$().then(settings => {
      this.settings.patchValue(settings)
    })
  }

  private setOutdatedSoonThresholdNotGreaterThanTimeToStore() {
    if (this.settings.value.timeToStore && this.settings.value.outdatedSoonThreshold) {
      if (this.settings.value.timeToStore < this.settings.value.outdatedSoonThreshold) {
        this.settings.patchValue({outdatedSoonThreshold: this.settings.value.timeToStore})
      }
    }
  }
}
