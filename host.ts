import { HOST } from './app'
import { html } from 'htm/preact'
import { useState, useEffect } from 'preact/hooks'

const startHostSession = async (): Promise<string> => {
  const res = await fetch(`${HOST}/api/v1/meeting/create`, {
    method: 'POST',
  })

  const { id } = await res.json()

  return id
}

const finishHostSession = async (id: string) => {
  try {
    const res = await fetch(`${HOST}/api/v1/meeting`, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    if (res.status === 204) {
      chrome.storage.local.remove('id')
      chrome.storage.local.remove('mode')
    } else {
      document.write('Не удалось завершить сессию')
    }
  } catch (e) {
    document.write(e.message)
  }
}

const Host = () => {
  const [isSessionRunning, toggleSession] = useState(false)

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

  const handleButton = () => {
    if (id && !isSessionRunning) {
      chrome.storage.local.remove('id')
      location.reload()
    }

    if (!isSessionRunning && !id) {
      startHostSession().then((id) => {
        toggleSession(true)
        setId(id)
        chrome.storage.local.set({ id })
        chrome.storage.local.set({ mode: 'host' })
      })
    } else if (isSessionRunning) {
      toggleSession(false)
      finishHostSession(id).then(() => location.reload())
    }
  }

  return html`
    <h1>Хост</h1>
    <p>ID: <code>${id}</code></p>

    <button onclick=${handleButton}>
      ${isSessionRunning ? 'Завершить сессию' : 'Начать сессию'}
    </button>
  `
}

export default Host
