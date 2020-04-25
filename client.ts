import { HOST } from './app'
import { useState, useEffect, useRef } from 'preact/hooks'
import { JSX } from 'preact'
import { html } from 'htm/preact'

export const connectToSession = (id: string) => {
  return fetch(`${HOST}/api/v1/meeting`, {
    method: 'OPTIONS',

    body: JSON.stringify({
      id,
    }),
  })
    .then((res) => {
      if (res.status === 404 || res.status === 400) {
        return false
      } else {
        return true
      }
    })
    .catch((e) => {
      document.write(e.message)
    })
}

const Client = () => {
  const [id, setId] = useState('')

  const [connected, setConnected] = useState(false)

  useEffect(() => {
    chrome.storage.local.get('id', (s) => {
      setId(s.id)
    })
    chrome.storage.local.get('sendLinks', (s) => {
      setConnected(s.sendLinks)
    })
  }, [])

  const handleButton = () => {
    if (!connected) {
      connectToSession(id).then((ok) => {
        if (ok) {
          setConnected(true)
          chrome.storage.local.set({ id })
          chrome.storage.local.set({ mode: 'client' })
          chrome.storage.local.set({ sendLinks: true })
        } else {
          document.write('Ошибка подключения')
          chrome.storage.local.remove(['id', 'mode', 'sendLinks'])
        }
      })
    } else {
      setConnected(false)
      chrome.storage.local.set({ sendLinks: false })
      chrome.storage.local.remove('mode')
    }
  }

  const ref = useRef<HTMLInputElement>()

  return html`<h1>Клиент</h1>

    <input
      value=${id}
      oninput=${(e: JSX.TargetedEvent<HTMLInputElement, Event>) => setId(e.currentTarget.value)}
      placeholder="ID Сессии"
    />
    <button onclick=${handleButton}>
      ${connected ? 'Отключиться' : 'Подключиться'}
    </button>`
}

export default Client
