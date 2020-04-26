const HOST = 'https://poom.live:9091'

const MODE_CLIENT = 'client'
const MODE_HOST = 'host'
const MODE_OFF = 'old_session'

chrome.storage.local.get((res) => {
  if (res.mode === MODE_HOST) {
    const newLink = location.href
    if (res.host_last_send_link !== newLink) {
      fetch(`${HOST}/api/v1/meeting`, {
        method: 'PUT',
        body: JSON.stringify({
          id: res.id,
          url: newLink,
        }),
      }).then((res) => {
        if (res.status === 204) {
          chrome.storage.local.set({ host_last_send_link: newLink })
        } else {
          chrome.storage.local.remove('host_last_send_link')
          chrome.storage.local.set({ mode: MODE_OFF }) //todo or remove mode?
        }
      })
    }
  } else if (res.mode === MODE_CLIENT) {
    setInterval(() => {
      const { id, client_last_get_link } = res
      // extract id, session mode and last link used from chrome storage

      fetch(`${HOST}/api/v1/meeting`, {
        method: 'POST',
        body: JSON.stringify({
          id,
        }),
      })
        .then((res) => {
          if (res.status === 404) {
            // end session
            chrome.storage.local.set({ mode: MODE_OFF })
            return { url: '' }
          } else if (res.status == 200) {
            // send json response with URL
            return res.json()
          } else {
            return { url: '' }
          }
        })
        .then(({ url }) => {
          if (client_last_get_link !== url) {
            // link hasn't changed
            chrome.storage.local.set({ client_last_get_link: url })
            location.assign(url)
          }
        })
    }, 5 * 1000)
  }
})
