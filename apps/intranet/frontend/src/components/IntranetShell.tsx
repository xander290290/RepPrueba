import { useEffect, useState, type FormEvent } from 'react'
import {
  createUser,
  getErrorMessage,
  getRolePermissions,
  getRoles,
  getUsers,
} from '../lib/api'
import type { NewUser, Role, User } from '../lib/api'

type Section = 'inicio' | 'usuarios' | 'roles' | 'modulos' | `modulo:${string}`

const navigation = [
  { id: 'inicio' as const, label: 'Inicio', icon: '⌂' },
  { id: 'usuarios' as const, label: 'Usuarios', icon: '♙' },
  { id: 'roles' as const, label: 'Roles y permisos', icon: '◇' },
  { id: 'modulos' as const, label: 'Módulos del proyecto', icon: '▦' },
]

const modules = [
  {
    id: 'anuncios',
    title: 'Tablón de anuncios',
    description: 'Publicación y consulta de avisos internos para el centro.',
    phase: 2,
  },
  {
    id: 'fem',
    title: 'Seguimiento FEM',
    description: 'Organización y seguimiento de la formación en empresa.',
    phase: 2,
  },
  {
    id: 'rrss',
    title: 'Borradores para redes sociales',
    description: 'Preparación de publicaciones y asistencia de IA por definir.',
    phase: 2,
  },
  {
    id: 'retrasos',
    title: 'Gestión de retrasos',
    description: 'Registro y consulta de retrasos del alumnado.',
    phase: 2,
  },
  {
    id: 'emplazamiento',
    title: 'Emplazamiento en el aula',
    description: 'Organización de la distribución del alumnado en el aula.',
    phase: 2,
  },
  {
    id: 'onboarding',
    title: 'Primeros pasos (onboarding)',
    description: 'Recursos para facilitar la incorporación al centro.',
    phase: 2,
  },
  {
    id: 'roles-completos',
    title: 'Administración completa de roles y permisos',
    description: 'Configuración de roles, permisos y acceso a los módulos.',
    phase: 2,
  },
  {
    id: 'rmi',
    title: 'Incidencias RMI',
    description: 'Comunicación y seguimiento de incidencias de recursos.',
    phase: 2,
  },
  {
    id: 'compras',
    title: 'Gestión de compras',
    description: 'Flujos de solicitud y seguimiento de compras.',
    phase: 2,
  },
  {
    id: 'guardias',
    title: 'Guardias y ausencias',
    description: 'Gestión de ausencias, cobertura y asignación de guardias.',
    phase: 3,
  },
  {
    id: 'convivencia',
    title: 'Aula de convivencia',
    description: 'Coordinación de actuaciones y seguimiento de convivencia.',
    phase: 3,
  },
  {
    id: 'comisiones',
    title: 'Comisiones de servicio',
    description: 'Gestión del flujo de comisiones y sus firmas.',
    phase: 3,
  },
  {
    id: 'firma',
    title: 'Flujos de firma',
    description: 'Firma de guardias, ausencias y comisiones de servicio.',
    phase: 3,
  },
  {
    id: 'integraciones',
    title: 'Integraciones y notificaciones',
    description: 'OAuth, Google Calendar y notificaciones push o por correo.',
    phase: 4,
  },
]

interface ShellProps {
  accessToken: string
  user: User
  onLogout: () => Promise<void>
}

function IntranetShell({ accessToken, user, onLogout }: ShellProps) {
  const [section, setSection] = useState<Section>('inicio')
  const [logoutPending, setLogoutPending] = useState(false)

  async function handleLogout() {
    setLogoutPending(true)
    try {
      await onLogout()
    } finally {
      setLogoutPending(false)
    }
  }

  const activeModule = section.startsWith('modulo:')
    ? modules.find((module) => module.id === section.slice('modulo:'.length))
    : undefined

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#inicio" onClick={() => setSection('inicio')}>
          <span className="brand-mark" aria-hidden="true">RA</span>
          <span className="brand-name">IES Ramón Arcas Meca</span>
        </a>
        <span className="app-header-caption">Intranet docente</span>
        <div className="profile-actions">
          <span className="profile-name">{user.name} {user.surname}</span>
          <button
            className="button button-outline button-compact"
            onClick={handleLogout}
            disabled={logoutPending}
          >
            {logoutPending ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar" aria-label="Navegación de la intranet">
          <p className="sidebar-label">Espacio de trabajo</p>
          <NavigationItems
            section={section}
            onNavigate={setSection}
          />
          <div className="sidebar-note">
            <span className="status-dot" aria-hidden="true" />
            <span>Sesión privada activa</span>
          </div>
        </aside>

        <main className="workspace" id="inicio">
          {section === 'inicio' && <DashboardHome user={user} onNavigate={setSection} />}
          {section === 'usuarios' && <UsersPage token={accessToken} />}
          {section === 'roles' && <RolesPage token={accessToken} />}
          {section === 'modulos' && <ModulesPage onNavigate={setSection} />}
          {activeModule && <PlannedModule module={activeModule} />}
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Navegación principal">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={section === item.id || (item.id === 'modulos' && section.startsWith('modulo:')) ? 'mobile-nav-item is-active' : 'mobile-nav-item'}
            onClick={() => setSection(item.id)}
            aria-current={section === item.id ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.id === 'modulos' ? 'Módulos' : item.label}</span>
          </button>
        ))}
      </nav>

      <footer className="app-footer">
        <span>IES Ramón Arcas Meca · Totana, Murcia</span>
        <span>Aplicación independiente de la web pública</span>
      </footer>
    </div>
  )
}

interface NavigationItemsProps {
  section: Section
  onNavigate: (section: Section) => void
}

function NavigationItems({ section, onNavigate }: NavigationItemsProps) {
  return (
    <nav className="side-nav">
      {navigation.map((item) => {
        const active = section === item.id || (item.id === 'modulos' && section.startsWith('modulo:'))
        return (
          <button
            key={item.id}
            className={active ? 'side-nav-item is-active' : 'side-nav-item'}
            onClick={() => onNavigate(item.id)}
            aria-current={section === item.id ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

function DashboardHome({
  user,
  onNavigate,
}: {
  user: User
  onNavigate: (section: Section) => void
}) {
  return (
    <>
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">IES Ramón Arcas Meca · Espacio privado</p>
          <h1>Hola, {user.name}</h1>
          <p className="hero-lead">
            Bienvenido a las herramientas de coordinación y gestión docente del centro.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="art-sun" />
          <span className="art-hill art-hill-back" />
          <span className="art-hill art-hill-front" />
        </div>
      </section>

      <section className="workspace-section" aria-labelledby="quick-access-title">
        <div className="section-heading section-heading-left">
          <p className="eyebrow">Tu espacio de trabajo</p>
          <h2 id="quick-access-title">Accesos de gestión</h2>
          <p>Estas áreas ya disponen de endpoints en la API de la intranet.</p>
        </div>
        <div className="card-grid">
          <article className="info-card dashboard-card">
            <span className="card-icon" aria-hidden="true">01</span>
            <p className="eyebrow">Cuenta</p>
            <h3>Mi perfil</h3>
            <p>{user.email}</p>
            <p className="role-chips">
              {user.roles.map((role) => <span className="role-chip" key={role}>{role}</span>)}
            </p>
          </article>
          <button className="info-card dashboard-card card-button" onClick={() => onNavigate('usuarios')}>
            <span className="card-icon" aria-hidden="true">02</span>
            <p className="eyebrow">Administración</p>
            <h3>Usuarios</h3>
            <p>Consultar usuarios y registrar cuentas con el permiso correspondiente.</p>
            <span className="text-link">Abrir gestión <span aria-hidden="true">→</span></span>
          </button>
          <button className="info-card dashboard-card card-button" onClick={() => onNavigate('roles')}>
            <span className="card-icon" aria-hidden="true">03</span>
            <p className="eyebrow">Acceso</p>
            <h3>Roles y permisos</h3>
            <p>Consultar los roles disponibles y los permisos que tiene cada uno.</p>
            <span className="text-link">Consultar roles <span aria-hidden="true">→</span></span>
          </button>
        </div>
      </section>

      <section className="program-band">
        <div>
          <p className="eyebrow">Desarrollo por fases</p>
          <h2>Los módulos docentes se irán incorporando según la memoria del proyecto.</h2>
        </div>
        <button className="button button-outline" onClick={() => onNavigate('modulos')}>
          Ver módulos previstos
        </button>
      </section>
    </>
  )
}

function UsersPage({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [roleName, setRoleName] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getUsers(token), getRoles(token)])
      .then(([userList, roleList]) => {
        if (active) {
          setUsers(userList)
          setRoles(roleList)
          setRoleName((current) => current || roleList[0]?.name || '')
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [token])

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSuccess('')
    setSaving(true)
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload: NewUser = {
      name: String(formData.get('name') ?? ''),
      surname: String(formData.get('surname') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      role: roleName,
    }
    try {
      const created = await createUser(token, payload)
      setSuccess(`La cuenta de ${created.name} ${created.surname} se ha registrado.`)
      setUsers((current) => [...current, created].sort((a, b) => a.email.localeCompare(b.email)))
      form.reset()
    } catch (createError) {
      setFormError(getErrorMessage(createError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="workspace-section management-page">
      <PageHeading eyebrow="Administración del centro" title="Usuarios">
        Consulta las cuentas existentes o registra una cuenta nueva. Las acciones
        están sujetas a los permisos que aplica el backend.
      </PageHeading>
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="management-grid">
        <section className="panel" aria-labelledby="user-list-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Directorio</p>
              <h2 id="user-list-title">Cuentas registradas</h2>
            </div>
            <span className="count-badge">{loading ? '…' : users.length}</span>
          </div>
          {loading ? <p className="muted-copy">Cargando usuarios…</p> : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Nombre</th><th>Correo</th><th>Roles</th></tr></thead>
                <tbody>
                  {users.map((listedUser) => (
                    <tr key={listedUser.id}>
                      <td>{listedUser.name} {listedUser.surname}</td>
                      <td>{listedUser.email}</td>
                      <td>{listedUser.roles.join(', ')}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={3}>No hay usuarios para mostrar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel" aria-labelledby="user-create-title">
          <p className="eyebrow">Alta de cuenta</p>
          <h2 id="user-create-title">Registrar usuario</h2>
          <p className="muted-copy">La contraseña debe tener al menos 12 caracteres.</p>
          {formError && <p className="error-message" role="alert">{formError}</p>}
          {success && <p className="success-message" role="status">{success}</p>}
          <form className="form-stack" onSubmit={handleCreateUser}>
            <label>Nombre
              <input name="name" autoComplete="given-name" maxLength={100} required />
            </label>
            <label>Apellidos
              <input name="surname" autoComplete="family-name" maxLength={100} />
            </label>
            <label>Correo electrónico
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>Contraseña inicial
              <input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required />
            </label>
            <label>Rol inicial
              <select value={roleName} onChange={(event) => setRoleName(event.target.value)} required disabled={roles.length === 0}>
                {roles.map((role) => <option value={role.name} key={role.name}>{role.name}</option>)}
              </select>
            </label>
            <button className="button button-primary" disabled={saving || roles.length === 0}>
              {saving ? 'Registrando…' : 'Registrar usuario'}
            </button>
          </form>
        </section>
      </div>
    </section>
  )
}

function RolesPage({ token }: { token: string }) {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getRoles(token)
      .then((roleList) => {
        if (active) {
          setRoles(roleList)
          if (roleList[0]) {
            setLoadingPermissions(true)
            setSelectedRole(roleList[0].name)
          }
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (active) setLoadingRoles(false)
      })
    return () => { active = false }
  }, [token])

  useEffect(() => {
    if (!selectedRole) return
    let active = true
    getRolePermissions(token, selectedRole)
      .then((rolePermissions) => {
        if (active) setPermissions(rolePermissions)
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError))
      })
      .finally(() => {
        if (active) setLoadingPermissions(false)
      })
    return () => { active = false }
  }, [selectedRole, token])

  return (
    <section className="workspace-section management-page">
      <PageHeading eyebrow="Control de acceso" title="Roles y permisos">
        Consulta los roles y permisos definidos en la API. La autorización se
        comprueba siempre en el backend.
      </PageHeading>
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="roles-layout">
        <section className="panel" aria-labelledby="role-list-title">
          <p className="eyebrow">Perfiles disponibles</p>
          <h2 id="role-list-title">Roles</h2>
          {loadingRoles ? <p className="muted-copy">Cargando roles…</p> : (
            <div className="role-list">
              {roles.map((role) => (
                <button
                  className={selectedRole === role.name ? 'role-option is-selected' : 'role-option'}
                  key={role.name}
                      onClick={() => {
                        if (selectedRole === role.name) return
                        setError('')
                        setPermissions([])
                        setLoadingPermissions(true)
                        setSelectedRole(role.name)
                      }}
                    >
                  <strong>{role.name}</strong>
                  <span>{role.description}</span>
                </button>
              ))}
              {roles.length === 0 && <p className="muted-copy">No hay roles disponibles.</p>}
            </div>
          )}
        </section>
        <section className="panel" aria-labelledby="permissions-title">
          <p className="eyebrow">Permisos de la API</p>
          <h2 id="permissions-title">{selectedRole || 'Selecciona un rol'}</h2>
          {loadingPermissions ? <p className="muted-copy">Cargando permisos…</p> : (
            <ul className="permission-list">
              {permissions.map((permission) => <li key={permission}>{permission}</li>)}
              {!loadingRoles && selectedRole && permissions.length === 0 && (
                <li className="muted-copy">Este rol no tiene permisos asignados.</li>
              )}
            </ul>
          )}
        </section>
      </div>
    </section>
  )
}

function ModulesPage({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return (
    <section className="workspace-section management-page">
      <PageHeading eyebrow="Plan del proyecto" title="Módulos de la intranet">
        La estructura sigue las fases de la memoria técnica y la temporalización.
        Los módulos que aún no tienen endpoints se muestran como pendientes.
      </PageHeading>
      <div className="module-grid">
        <article className="module-card module-card-ready">
          <span className="module-phase">Disponible en la API</span>
          <h2>Autenticación</h2>
          <p>Inicio de sesión, consulta de sesión, cierre de sesión y renovación de tokens.</p>
          <span className="status-pill status-ready">API disponible</span>
        </article>
        <article className="module-card module-card-ready">
          <span className="module-phase">Fase 1</span>
          <h2>Usuarios y roles</h2>
          <p>Registro y consulta de usuarios, roles y permisos básicos.</p>
          <button className="text-link" onClick={() => onNavigate('usuarios')}>Abrir gestión de usuarios →</button>
        </article>
        {modules.map((module) => (
          <button
            className="module-card module-card-planned"
            key={module.id}
            onClick={() => onNavigate(`modulo:${module.id}`)}
          >
            <span className="module-phase">Fase {module.phase}</span>
            <h2>{module.title}</h2>
            <p>{module.description}</p>
            <span className="status-pill">Pendiente de desarrollo</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function PlannedModule({ module }: { module: (typeof modules)[number] }) {
  return (
    <section className="workspace-section management-page">
      <PageHeading eyebrow={`Fase ${module.phase} · Módulo previsto`} title={module.title}>
        {module.description}
      </PageHeading>
      <div className="panel planned-notice">
        <span className="status-pill">Pendiente de desarrollo</span>
        <h2>Este módulo todavía no está conectado</h2>
        <p>
          Se muestra como parte de la estructura prevista en la memoria. Su
          interfaz y sus operaciones se implementarán cuando estén definidos
          sus flujos y la API correspondiente.
        </p>
      </div>
    </section>
  )
}

function PageHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: string
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  )
}

export default IntranetShell
