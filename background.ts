const HOST = 'https://poom.live:9091'

chrome.storage.local.get(({ mode, url, id }) => {

  if (id) {
    if (mode !== 'old_session') {
      if (mode === 'client') {
        const body = JSON.stringify({
          id,
        })      
        fetch(`${HOST}/api/v1/meeting`, {
          method: 'POST',
          body,
        })
          .then((res) => {
            if (res.status === 404) {
              chrome.storage.local.set({ mode: 'old_session' })
            }

            return res.json()
          })
          .then((json) => {
            if (mode === 'client') {
              chrome.storage.local.set({ url })
              if (url !== json.url) {
                setTimeout(() => {
                  location.reload()
                }, 5000)
              }
            }
          })
      } else if (mode === 'host') {
        const body = JSON.stringify({
          id,
          url,
        })      
        fetch(`${HOST}/api/v1/meeting`, {
          method: 'PUT',
          body,
        }).then((res) => {
          if (res.status !== 204) {
            chrome.storage.local.set({ mode: 'old_session' })
          }
        })
      }
    }
  }
})
