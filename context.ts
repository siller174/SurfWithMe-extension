import { createContext } from 'preact'
import { useState, html, StateUpdater } from 'htm/preact'

type Ctx = {
  locked: {
    client?: boolean
    host?: boolean
  }
  setLocked: StateUpdater<{
    client?: boolean
    host?: boolean
  }>
}

export const LockContext = createContext({} as Ctx)

export const LockProvider = ({ children }: { children: any }) => {
  const [locked, setLocked] = useState({
    client: false,
    host: false,
  })

  return html`<${LockContext.Provider} value=${{ locked, setLocked }}>
    ${children}
    </LockContext.Provider>`
}
