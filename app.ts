import { useState, useEffect, useRef } from 'preact/hooks'
import { render, html, Ref } from 'htm/preact'
import Client from './client'
import Host from './host'

export const HOST = 'http://104.248.163.157:9091'

const Wrapper = ({
  children,
  setTab,
  refs,
}: {
  children: any
  setTab: (tab: 'client' | 'host' | '' | 'old_session') => void
  refs: Ref<HTMLButtonElement>[]
}) => html`
  <nav>
    <button onclick=${() => setTab('host')} ref=${refs[0]}>Хост</button>
    <button onclick=${() => setTab('client')} ref=${refs[1]}>Клиент</button>
  </nav>
  ${children}
`

const App = () => {
  const [tab, setTab] = useState<'client' | 'host' | '' | 'old_session'>('')

  const clientRef = useRef<HTMLButtonElement>()

  const hostRef = useRef<HTMLButtonElement>()

  useEffect(() => {
    chrome.storage.local.get(({ mode }) => {
      if (mode === 'old_session') {
        chrome.storage.local.remove(['id', 'sendLinks'])
      }

      setTab(mode)
    })
    chrome.storage.onChanged.addListener((l) => console.log(l))
  }, [])

  useEffect(() => {
    if (!tab) return

    if (tab === 'client') {
      hostRef.current?.setAttribute('disabled', 'disabled')
    } else if (tab === 'host') {
      clientRef.current?.setAttribute('disabled', 'disabled')
    }
  }, [tab])

  switch (tab) {
    case '':
      return html` ${Wrapper} refs=${[hostRef, clientRef]} setTab=${setTab} /> `
    case 'old_session':
      return html`<${Wrapper} refs=${[hostRef, clientRef]} setTab=${setTab}>
 <p>Сессия устарела, создайте новую</p>
      </Wrapper>`

    default:
      return html`<${Wrapper} refs=${[hostRef, clientRef]} setTab=${setTab}>
 <${tab && tab === 'client' ? Client : Host} />
      </Wrapper>`
  }
}

render(html`<${App} />`, document.getElementById('app') as HTMLElement)
