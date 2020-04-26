import { HOST } from './app'
import { html } from 'htm/preact'
import { useState, useEffect, useContext } from 'preact/hooks'

const Host = () => {
  const [isSessionRunning, toggleSession] = useState(false)
  const [err, setErr] = useState('')

  const [id, setId] = useState('')

  useEffect(() => {
    chrome.storage.local.get('id', (s) => {
      setId(s.id)
    })
    chrome.storage.local.get('mode', (s) => {
      if (s.mode === 'host' || s.mode === 'client') {
        toggleSession(true)
      }
    })
  }, [])

  const finishHostSession = async (id: string) => {
    try {
      const res = await fetch(`${HOST}/api/v1/meeting`, {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })
      if (res.status === 204) {
        chrome.storage.local.remove(['id', 'mode'])
      } else {
        chrome.storage.local.remove(['id', 'mode'])
        setErr('Не удалось завершить сессию')
      }
    } catch (e) {
      setErr(e.message)
      chrome.storage.local.remove(['id', 'mode'])
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
          setErr('Ошибка создания сессии')
          chrome.storage.local.remove(['id', 'host'])
        }
      })
    } else if (isSessionRunning) {
      toggleSession(false)
      finishHostSession(id).then(() => location.reload())
    }
  }

  return html`
    ${err === ''
      ? html`<h1>Хост</h1>
          <p>ID: <code>${id}</code></p>

          <button onclick=${handleButton}>
            ${isSessionRunning ? 'Завершить сессию' : 'Начать сессию'}
          </button>`
      : err}
  `
}

export default Host
