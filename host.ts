import { HOST } from './app'
import { html } from 'htm/preact'
import { useState, useEffect, useContext } from 'preact/hooks'

const Host = () => {
  const [isSessionRunning, toggleSession] = useState(false)
  const [err, setErr] = useState('')

  const [id, setId] = useState('')

  useEffect(() => {
    chrome.storage.local.get(({ id, mode }) => {
      setId(id)
      if (mode === 'host' || mode === 'client') {
        toggleSession(true)
      }
    })
  }, [])

  const finishHostSession = async (id: string) => {
    chrome.storage.local.remove(['mode', 'id', 'host_last_send_link'])
    try {
      const res = await fetch(`${HOST}/api/v1/meeting`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      if (res.status === 204) {
      } else {
        setErr('Could not end session')
      }
    } catch (e) {
      setErr(e.message)
    }
  }

  const startHostSession = () => {
    return fetch(`${HOST}/api/v1/meeting/create`, {
      method: 'POST',
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json()
        } else {
          return {
            id: '',
            ok: false,
          }
        }
      })
      .then(({ id }) => {
        if (id) {
          return {
            id,
            ok: true,
          }
        } else {
          return { ok: false }
        }
      })
  }

  const handleButton = () => {
    if (id && !isSessionRunning) {
      chrome.storage.local.remove(['id', 'mode'])
      location.reload()
    }

    if (!isSessionRunning && !id) {
      startHostSession().then(({ id, ok }) => {
        if (ok) {
          toggleSession(true)
          setId(id)
          chrome.storage.local.set({ id })
          chrome.storage.local.set({ mode: 'host' })
        } else {
          setErr('Error creating session')
          chrome.storage.local.remove(['mode', 'id', 'host_last_send_link'])
        }
      })
    } else if (isSessionRunning) {
      toggleSession(false)
      finishHostSession(id).then(() => location.reload())
    }
  }

  return html`
    ${err === ''
      ? html`<h1>Host</h1>
          <h2>ID: ${id}</h2>

          <button onclick=${handleButton}>
            ${isSessionRunning ? 'Finish session' : 'Create session'}
          </button>`
      : err}
  `
}

export default Host
