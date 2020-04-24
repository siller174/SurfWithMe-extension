chrome.storage.local.get(({ mode, url, id }) => {
  const body = JSON.stringify({
    id,
  })

  if (id) {
    if (mode !== 'old_session') {
      if (mode === 'client') {
        fetch(`http://104.248.163.157:9091/api/v1/meeting`, {
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
        fetch(`http://104.248.163.157:9091/api/v1/meeting`, {
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
