import { useState, useEffect, useRef, useContext } from 'preact/hooks'
import { render, html, Ref } from 'htm/preact'
import Client from './client'
import Host from './host'
import { LockProvider, LockContext } from './context'

export const HOST = 'https://poom.live:9091'

type Tab = 'client' | 'host' | '' | 'old_session'

const NavBar = ({ setTab, refs }: { setTab: (tab: Tab) => void; refs: Ref<HTMLButtonElement>[] }) => {
  const { locked } = useContext(LockContext)

  if (locked.host) {
    refs[0].current?.setAttribute('disabled', 'disabled')
  } else if (locked.client) {
    refs[1].current?.setAttribute('disabled', 'disabled')
  }

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
  <${LockProvider}>

<${NavBar} setTab=${setTab} refs=${refs} />
  ${children}
  </LockProvider>
 
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
    chrome.storage.onChanged.addListener((l) => console.log(l))
  }, [])

  useEffect(() => {
    if (!tab) return

    chrome.storage.local.get(({ id }) => {
      if (tab === 'client') {
        if (id) {
          chrome.storage.local.set({ mode: 'client' })
        }
        hostRef
      } else if (tab === 'host') {
        if (id) {
          chrome.storage.local.set({ mode: 'host' })
        }
      }
    })
  }, [tab])

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
