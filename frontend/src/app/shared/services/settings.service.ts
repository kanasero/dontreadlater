import {Injectable} from '@angular/core';

export interface SettingsOptions {
  timeToStore: number,
  outdatedSoonThreshold: number,
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly _settingsField = 'settings'
  private readonly _defaultSettings: SettingsOptions = {
    timeToStore: 7,
    outdatedSoonThreshold: 3,
  }

  constructor() {
  }

  update$(settings: SettingsOptions) {
    return chrome.storage.local.set({[this._settingsField]: settings})
  }

  get$(optionName: string = ''): Promise<SettingsOptions> {
    return chrome.storage.local.get(this._settingsField)
      .then(result => result[this._settingsField] ?? this._defaultSettings)
      .then(settings => optionName ? settings[optionName] : settings)
  }

  private chromeNotifySettingsChange() {
    chrome.runtime.sendMessage({type: 'settings-update'})
  }
}
