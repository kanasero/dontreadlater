let timeToStore
let outdatedSoonThreshold
const defaultSettings = {
  timeToStore: 7,
  outdatedSoonThreshold: 3,
}

function getSettings() {
  return chrome.storage.local.get('settings')
    .then(result => result['settings'] ?? defaultSettings)
}

function getReadingListAsync() {
  return chrome.storage.local.get('readingList')
    .then(({readingList}) => readingList ?? [])
}

function getOutdatedSoon() {
  return new Promise(resolve => {
    const now = Math.floor(Date.now() / 1000)
    getReadingListAsync().then(readingList => {
      readingList = readingList.filter(readItem => {
        const timeLeft = readItem.add_time + timeToStore - now
        return timeLeft > 0 && timeLeft < outdatedSoonThreshold
      })
      resolve(readingList)
    })
  })
}

function getOutdatedSoonCount() {
  return getOutdatedSoon().then(items => items.length)
}

function updateOutdatedSoonCountNotification() {
  getOutdatedSoonCount().then(count => {
    chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : ''
    })
    let title = "Don't Read Later"
    if (count > 0) {
      title += `\n${count} article${count > 1 ? 's' : ''} will be outdated soon`
    }
    chrome.action.setTitle({
      title,
    })
  })
}

chrome.action.setBadgeBackgroundColor({
  color: '#aa0000'
})

chrome.action.setBadgeTextColor({
  color: '#ffffff'
})

getSettings().then(settings => {
  timeToStore = settings.timeToStore * 24 * 3600
  outdatedSoonThreshold = settings.outdatedSoonThreshold * 24 * 3600

  chrome.runtime.onMessage.addListener(message => {
    if (message === 'settings-update' || message === 'reading-list-update') {
      updateOutdatedSoonCountNotification()
    }
  })

  updateOutdatedSoonCountNotification()

  setTimeout(updateOutdatedSoonCountNotification, 10000);
})
