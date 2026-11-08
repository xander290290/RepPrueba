import { useState } from 'react'
import './App.css'
import { getCurrentUser, getErrorMessage, login, logout } from './lib/api'
import type { User } from './lib/api'
import LoginPage from './components/LoginPage'
import IntranetShell from './components/IntranetShell'

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [notice, setNotice] = useState('')

  async function handleLogin(email: string, password: string) {
    setNotice('')
    const tokens = await login(email, password)

    try {
      const currentUser = await getCurrentUser(tokens.access_token)
      setAccessToken(tokens.access_token)
      setUser(currentUser)
    } catch (error) {
      let message = getErrorMessage(error)
      try {
        await logout(tokens.access_token)
      } catch (logoutError) {
        message += ` No se pudo revocar la sesión: ${getErrorMessage(logoutError)}`
      }
      throw new Error(message)
    }
  }

  async function handleLogout() {
    let logoutNotice = ''
    if (accessToken) {
      try {
        await logout(accessToken)
      } catch (error) {
        logoutNotice = `La sesión local se ha cerrado, pero la API no confirmó el cierre: ${getErrorMessage(error)}`
      }
    }
    setAccessToken(null)
    setUser(null)
    setNotice(logoutNotice)
  }

  if (!accessToken || !user) {
    return <LoginPage onLogin={handleLogin} notice={notice} />
  }

  return (
    <IntranetShell
      accessToken={accessToken}
      user={user}
      onLogout={handleLogout}
    />
  )
}

export default App
