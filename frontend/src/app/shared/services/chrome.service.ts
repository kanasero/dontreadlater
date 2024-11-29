import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChromeService {

  constructor() {
  }

  storageGetAsync<T>(fieldName: string, defaultValue: any): Promise<T> {
    return chrome.storage.local.get(fieldName)
      .then(result => result[fieldName] ?? defaultValue);
  }

  storageSetAsync(fieldName: string, value: any): Promise<void> {
    return chrome.storage.local.set({[fieldName]: value})
  }
}
