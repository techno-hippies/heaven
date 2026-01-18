import { createContext, useContext, type ParentComponent, createSignal, type Accessor } from 'solid-js'

interface AuthContextValue {
  isAuthenticated: Accessor<boolean>
  pkpAddress: Accessor<string | undefined>
  eoaAddress: Accessor<string | undefined>
  openAuthDialog: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>()

export const AuthProvider: ParentComponent = (props) => {
  const [isAuthenticated, setIsAuthenticated] = createSignal(false)
  const [pkpAddress, setPkpAddress] = createSignal<string | undefined>()
  const [eoaAddress, setEoaAddress] = createSignal<string | undefined>()

  const openAuthDialog = () => {
    console.log('[Auth] Stub: Open auth dialog')
    // TODO: Implement actual auth
  }

  const logout = () => {
    setIsAuthenticated(false)
    setPkpAddress(undefined)
    setEoaAddress(undefined)
  }

  const value: AuthContextValue = {
    isAuthenticated,
    pkpAddress,
    eoaAddress,
    openAuthDialog,
    logout,
  }

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
