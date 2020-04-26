import { useState, useEffect, useRef, useContext } from 'preact/hooks'
import { render, html, Ref } from 'htm/preact'
import Client from './client'
import Host from './host'

export const HOST = 'https://poom.live:9091'

type Tab = 'client' | 'host' | '' | 'old_session'

const NavBar = ({ setTab, refs }: { setTab: (tab: Tab) => void; refs: Ref<HTMLButtonElement>[] }) => {
  const [isLocked, lock] = useState<{
    host?: boolean
    client?: boolean
  }>({
    host: false,
    client: false,
  })

  chrome.storage.onChanged.addListener((mode) => {
    if (mode.mode.newValue === 'client') {
      refs[0].current?.setAttribute('disabled', 'disabled')
    } else if (mode.mode.newValue === 'host') {
      refs[1].current?.setAttribute('disabled', 'disabled')
    }
  })

  return html` <nav>
    <button onclick=${() => setTab('host')} ref=${refs[0]}>Хост</button>
    <button onclick=${() => setTab('client')} ref=${refs[1]}>Клиент</button>
  </nav>`
}

const Wrapper = ({
  children,
  setTab,

  refs,
}: {
  children: any
  setTab: (tab: Tab) => void
  tab: Tab
  refs: Ref<HTMLButtonElement>[]
}) => {
  return html`
    <${NavBar} setTab=${setTab} refs=${refs} />
    ${children}
  `
}

const App = () => {
  const [tab, setTab] = useState<Tab>('')

  const clientRef = useRef<HTMLButtonElement>()

  const hostRef = useRef<HTMLButtonElement>()

  useEffect(() => {
    chrome.storage.local.get(({ mode }) => {
      if (mode === 'old_session') {
        chrome.storage.local.remove(['id', 'sendLinks'])
      }

      setTab(mode)
    })
  }, [])

  switch (tab) {
    case 'old_session':
      return html`<${Wrapper} refs=${[hostRef, clientRef]} setTab=${setTab}>
 <p>Сессия устарела, создайте новую</p>
      </Wrapper>`

    case 'client':
      return html`<${Wrapper} refs=${[hostRef, clientRef]} setTab=${setTab}>
 <${Client} />
      </Wrapper>`
    case 'host':
      return html`<${Wrapper} refs=${[hostRef, clientRef]} setTab=${setTab} >
        <${Host} />
             </Wrapper>`
    default:
      return html`<${Wrapper} refs=${[hostRef, clientRef]} setTab=${setTab} />`
  }
}

render(html`<${App} />`, document.getElementById('app') as HTMLElement)
