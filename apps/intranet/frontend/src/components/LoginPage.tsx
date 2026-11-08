import { useState, type FormEvent } from 'react'
import { getErrorMessage } from '../lib/api'

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>
  notice: string
}

function LoginPage({ onLogin, notice }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onLogin(email, password)
    } catch (loginError) {
      setError(getErrorMessage(loginError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="public-frame">
      <a className="skip-link" href="#login-form">
        Saltar al inicio de sesión
      </a>
      <header className="public-header">
        <a className="brand" href="/" aria-label="IES Ramón Arcas Meca">
          <span className="brand-mark" aria-hidden="true">RA</span>
          <span className="brand-name">IES Ramón Arcas Meca</span>
        </a>
        <span className="header-label">Espacio privado del centro</span>
      </header>

      <main>
        <section className="login-hero">
          <div className="login-hero-content">
            <p className="eyebrow">Intranet docente · Totana, Murcia</p>
            <h1>Un espacio para coordinar y acompañar</h1>
            <p className="hero-lead">
              Herramientas de trabajo para el profesorado y el equipo directivo
              del IES Ramón Arcas Meca.
            </p>
            <div className="login-highlights" aria-label="Áreas de la intranet">
              <span>Gestión docente</span>
              <span>Coordinación</span>
              <span>Comunidad educativa</span>
            </div>
          </div>

          <section className="login-card" aria-labelledby="login-title">
            <p className="eyebrow">Acceso seguro</p>
            <h2 id="login-title">Iniciar sesión</h2>
            <p className="login-intro">
              Identifícate con tu cuenta del centro para continuar.
            </p>
            {notice && <p className="notice-message" role="status">{notice}</p>}
            {error && <p className="error-message" role="alert">{error}</p>}
            <form id="login-form" className="form-stack" onSubmit={handleSubmit}>
              <label>
                Correo electrónico
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@educa.murcia.org"
                  required
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              <button className="button button-primary button-full" disabled={loading}>
                {loading ? 'Comprobando acceso…' : 'Entrar en la intranet'}
              </button>
            </form>
            <p className="login-footnote">
              El acceso se valida con la API privada del centro. Si no tienes
              cuenta, contacta con el equipo directivo.
            </p>
          </section>
        </section>

        <section className="content-section login-info" aria-labelledby="login-info-title">
          <div className="section-heading">
            <p className="eyebrow">Un entorno de trabajo común</p>
            <h2 id="login-info-title">Información y coordinación en un mismo lugar</h2>
            <p>
              La intranet organiza herramientas docentes por módulos y permisos,
              manteniendo separados los servicios privados de la web pública.
            </p>
          </div>
          <div className="card-grid">
            <article className="info-card">
              <span className="card-icon" aria-hidden="true">01</span>
              <h3>Acceso personal</h3>
              <p>La identidad y los permisos se verifican en el servidor.</p>
            </article>
            <article className="info-card">
              <span className="card-icon" aria-hidden="true">02</span>
              <h3>Herramientas docentes</h3>
              <p>Los módulos se incorporarán de forma progresiva según las fases del proyecto.</p>
            </article>
            <article className="info-card">
              <span className="card-icon" aria-hidden="true">03</span>
              <h3>Diseño adaptable</h3>
              <p>Una aplicación PWA preparada para pantallas de escritorio y móvil.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="footer-inner">
          <p><strong>IES Ramón Arcas Meca</strong><br />Totana, Murcia</p>
          <p>Intranet privada para el profesorado y el equipo directivo.</p>
          <span>Acceso separado de la web pública</span>
        </div>
      </footer>
    </div>
  )
}

export default LoginPage
