import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes,  useLocation,  useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  Stethoscope,
  Upload,
  Users,
  X,
} from 'lucide-react'
import {
  AuthProvider,
  getFirebaseErrorMessage,
  useAuth,
} from './contexts/AuthContext'
import { calculateRiskAssessment } from './utils/riskAssessment'
import {
  getRiskAssessmentHistory,
  saveRiskAssessment,
} from './services/assessments/riskAssessments'

import {
  getSymptoms,
  saveSymptom,
} from './services/symptoms/symptoms'

import {
  getAppointments,
  saveAppointment,
} from './services/appointments/appointments'

import {
  getMedicalRecords,
  uploadMedicalRecord,
} from './services/medicalRecords/medicalRecords'

import { getReports } from './services/reports/reports'

import { subscribeToDashboard } from './services/dashboard/dashboard'

import {
  getPatients,
  getPatientDetails,
} from './services/doctor/doctor'

import { createReport } from './services/reports/reports'

const education = [
  {
    title: 'Know the warning signs',
    text: 'A new lump, skin changes, nipple changes, or persistent pain should be discussed with a qualified health professional.',
  },
  {
    title: 'Screening matters',
    text: 'Professional screening can support early detection. Ask a clinician which option is suitable for you.',
  },
  {
    title: 'Healthy routines',
    text: 'Regular activity, balanced nutrition, and limiting alcohol can support overall breast health.',
  },
]

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<Site />} />
      </Routes>
    </AuthProvider>
  )
}

function Site() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="splash">
        <HeartPulse />
        Loading your health space...
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route
        path="/about"
        element={<Info title="About BreastCare Connect" />}
      />
      <Route path="/awareness" element={<Education />} />
      <Route path="/self-examination" element={<SelfExam />} />
      <Route path="/health-education" element={<Education />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/:role" element={<Register />} />
      <Route path="/forgot-password" element={<Forgot />} />

      <Route
        path="/patient/*"
        element={
          <Protected role="patient">
            <Portal />
          </Protected>
        }
      />

      <Route
        path="/doctor/*"
        element={
          <Protected role="doctor">
            <Portal />
          </Protected>
        }
      />

      <Route
        path="/admin/*"
        element={
          <Protected role="admin">
            <Portal />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function Protected({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="page">
        <div className="panel">
          <p>Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (location.pathname === '/login') {
      return children
    }

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (role && user.role !== role) {
    const dashboard =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'doctor'
          ? '/doctor/dashboard'
          : '/patient/dashboard'

    if (location.pathname !== dashboard) {
      return (
        <Navigate
          to={dashboard}
          replace
        />
      )
    }
  }

  return children
}

function Header() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header>
      <NavLink className="brand" to="/">
        <span>
          <HeartPulse size={22} />
        </span>
        BreastCare <b>Connect</b>
      </NavLink>

      <button
        className="icon mobile"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X /> : <Menu />}
      </button>

      <nav className={open ? 'open' : ''}>
        <NavLink to="/awareness">Awareness</NavLink>
        <NavLink to="/self-examination">Self-check guide</NavLink>
        <NavLink to="/health-education">Education</NavLink>

        {user ? (
          <>
            <NavLink
              className="button small"
              to={`/${user.role}/dashboard`}
            >
              My space
            </NavLink>

            <button className="text-button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink className="button small" to="/register/patient">
              Get started
            </NavLink>
          </>
        )}
      </nav>
    </header>
  )
}

function PublicHome() {
  return (
    <>
      <Header />

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">Breast health, thoughtfully supported</p>

            <h1>
              Awareness today.
              <br />
              <i>Confidence tomorrow.</i>
            </h1>

            <p className="lead">
              A friendly place to learn, track health changes, understand
              screening risk, and connect with professional support.
            </p>

            <div className="actions">
              <NavLink className="button" to="/register/patient">
                Start your health profile
                <ChevronRight size={17} />
              </NavLink>

              <NavLink className="button secondary" to="/awareness">
                Explore awareness
              </NavLink>
            </div>

            <p className="disclaimer">
              Educational support, not a medical diagnosis. Seek qualified
              care for any concern.
            </p>
          </div>

          <div className="hero-panel">
            <HeartPulse size={46} />

            <span>Early attention is powerful</span>

            <strong>Listen to your body.</strong>

            <div className="hero-list">
              <span>
                <ShieldCheck />
                Private by design
              </span>

              <span>
                <Stethoscope />
                Professional support
              </span>
            </div>
          </div>
        </section>

        <section className="feature-strip">
          <Feature
            icon={<Activity />}
            title="Risk assessment"
            text="A transparent questionnaire to help start informed conversations."
          />

          <Feature
            icon={<ClipboardList />}
            title="Symptom journal"
            text="Record changes clearly for your next healthcare conversation."
          />

          <Feature
            icon={<CalendarDays />}
            title="Care appointments"
            text="Find and request appointments with approved clinicians."
          />
        </section>

        <section className="content-section">
          <p className="eyebrow">Practical knowledge</p>

          <h2>Small steps can make a difference</h2>

          <div className="education-grid">
            {education.map(item => (
              <article key={item.title}>
                <BookOpen />
                <h3>{item.title}</h3>
                <p>{item.text}</p>

                <NavLink to="/health-education">
                  Read more <ChevronRight size={15} />
                </NavLink>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature">
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function Footer() {
  return (
    <footer>
      <span className="brand">
        <HeartPulse size={19} />
        BreastCare <b>Connect</b>
      </span>

      <span>
        School demonstration project. Not a certified medical service.
      </span>
    </footer>
  )
}

function Login() {
  const { login, demo, demoAccounts } = useAuth()
  const nav = useNavigate()

  const [form, setForm] = useState({
    email: 'patient.demo@breastcare.test',
    password: 'DemoPatient123!',
  })

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async e => {
    e.preventDefault()

    setBusy(true)
    setError('')

    try {
      const profile = await login(form.email, form.password)

      const destination =
        profile.role === 'doctor' && profile.status === 'pending'
          ? '/doctor/dashboard'
          : `/${profile.role}/dashboard`

      if (import.meta.env.DEV) {
        console.info('Login redirect destination:', {
          role: profile.role,
          status: profile.status,
          destination,
        })
      }

      nav(destination, { replace: true })
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthPage
      title="Welcome back"
      subtitle="Your health journey is always yours."
    >
      <form onSubmit={submit}>
        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={e =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={e =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <NavLink className="under" to="/forgot-password">
          Forgot password?
        </NavLink>

        {error && <p className="error">{error}</p>}

        <button className="button full" disabled={busy}>
          {busy ? 'Signing in...' : 'Log in'}
        </button>
      </form>

      {demo && (
        <div className="demo-note">
          <b>Local development demo accounts</b>

          {demoAccounts.map(account => (
            <p key={account.email}>
              <strong>{account.label}</strong>
              <br />
              <code>{account.email}</code>
              <br />
              <code>{account.password}</code>
            </p>
          ))}

          <small>
            These accounts are for local testing only and are not real medical
            authentication.
          </small>
        </div>
      )}

      <p className="auth-switch">
        New here? <NavLink to="/register/patient">Create a patient account</NavLink>
      </p>
    </AuthPage>
  )
}

function Register() {
  const { register } = useAuth()
  const nav = useNavigate()

  const path = window.location.pathname
  const isDoctor = path.endsWith('doctor')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
    registrationInfo: '',
    role: isDoctor ? 'doctor' : 'patient',
  })

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async e => {
    e.preventDefault()

    setBusy(true)
    setError('')

    try {
      const profile = await register(form)

      nav(
        profile.status === 'pending'
          ? '/doctor/dashboard'
          : '/patient/dashboard',
      )
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Registration form submission failed:', err)
      }

      setError(getFirebaseErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthPage
      title={isDoctor ? 'Join as a clinician' : 'Create your health profile'}
      subtitle={
        isDoctor
          ? 'Your account will be reviewed before activation.'
          : 'Take the first step in your breast-health journey.'
      }
    >
      <form onSubmit={submit}>
        <Input
          label="Full name"
          value={form.name}
          onChange={e =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <Input
          label="Email address"
          type="email"
          value={form.email}
          onChange={e =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <Input
          label="Phone number"
          value={form.phone}
          onChange={e =>
            setForm({
              ...form,
              phone: e.target.value,
            })
          }
        />

        {isDoctor && (
          <>
            <Input
              label="Specialization"
              value={form.specialization}
              onChange={e =>
                setForm({
                  ...form,
                  specialization: e.target.value,
                })
              }
            />

            <Input
              label="Professional registration information"
              value={form.registrationInfo}
              onChange={e =>
                setForm({
                  ...form,
                  registrationInfo: e.target.value,
                })
              }
            />
          </>
        )}

        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={e =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        {error && <p className="error">{error}</p>}

        <button className="button full" disabled={busy}>
          {busy
            ? 'Creating account...'
            : isDoctor
              ? 'Submit for approval'
              : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        {isDoctor ? 'Not a clinician?' : 'Are you a clinician?'}{' '}
        <NavLink to={`/register/${isDoctor ? 'patient' : 'doctor'}`}>
          {isDoctor
            ? 'Register as a patient'
            : 'Register for clinician access'}
        </NavLink>
      </p>
    </AuthPage>
  )
}

function Forgot() {
  const { resetPassword, demo } = useAuth()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  return (
    <AuthPage
      title="Reset your password"
      subtitle="We will send a reset link to your email address."
    >
      <form
        onSubmit={async e => {
          e.preventDefault()

          try {
            await resetPassword(email)

            setMessage(
              demo
                ? 'Firebase is not configured yet. In demo mode, use Demo123! for the sample accounts.'
                : 'Password reset link sent. Please check your inbox.',
            )
          } catch {
            setMessage(
              'We could not send the reset email. Please try again.',
            )
          }
        }}
      >
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        {message && <p className="notice">{message}</p>}

        <button className="button full">Send reset link</button>
      </form>
    </AuthPage>
  )
}

function AuthPage({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <NavLink className="brand" to="/">
        <span>
          <HeartPulse size={22} />
        </span>
        BreastCare <b>Connect</b>
      </NavLink>

      <section className="auth-card">
        <p className="eyebrow">Your private health space</p>

        <h1>{title}</h1>

        <p>{subtitle}</p>

        {children}
      </section>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <label className="input">
      <span>{label}</span>
      <input required {...props} />
    </label>
  )
}

function Portal() {
  const { user, logout } = useAuth()
  const [mobile, setMobile] = useState(false)

  const role = user.role

  const items =
    role === 'patient'
      ? [
          ['dashboard', Home, 'Overview'],
          ['risk-assessment', Activity, 'Risk assessment'],
          ['symptoms', ClipboardList, 'Symptoms'],
          ['self-examination', HeartPulse, 'Self-check guide'],
          ['appointments', CalendarDays, 'Appointments'],
          ['records', FileText, 'Medical records'],
          ['education', BookOpen, 'Education'],
          ['reports', FileText, 'Reports'],
          ['notifications', Bell, 'Notifications'],
          ['profile', Users, 'Profile'],
        ]
      : role === 'doctor'
        ? [
            ['dashboard', Home, 'Overview'],
            ['patients', Users, 'Patients'],
            ['reports', FileText, 'Reports'],
            ['profile', Users, 'Profile'],
          ]
        : [
            ['dashboard', Home, 'Overview'],
            ['users', Users, 'Users'],
            ['doctors', Stethoscope, 'Clinicians'],
            ['patients', Users, 'Patients'],
            ['appointments', CalendarDays, 'Appointments'],
            ['reports', FileText, 'Reports'],
            ['content', BookOpen, 'Education content'],
            ['settings', ShieldCheck, 'Settings'],
          ]

  return (
    <div className="portal">
      <aside className={mobile ? 'show' : ''}>
        <NavLink className="brand" to="/">
          <span>
            <HeartPulse size={20} />
          </span>
          BreastCare <b>Connect</b>
        </NavLink>

        <div className="role-label">{role} portal</div>

        <nav>
          {items.map(([key, Icon, label]) => (
            <NavLink
              key={key}
              to={`/${role}/${key}`}
              onClick={() => setMobile(false)}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <div className="portal-main">
        <div className="portal-top">
          <button
            className="icon mobile"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>

          <div>
            <p className="muted">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            <b>Hello, {user.name?.split(' ')[0] || 'there'}</b>
          </div>

          <button className="icon">
            <Bell size={19} />
          </button>
        </div>

        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="risk-assessment" element={<Risk />} />
          <Route path="symptoms" element={<Symptoms />} />
          <Route path="self-examination" element={<SelfExam />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="records" element={<Records />} />
          <Route path="education" element={<Education />} />
          <Route path="reports" element={<Reports />} />
          <Route
            path="notifications"
            element={
              <SimplePage
                title="Notifications"
                text="You are all caught up. Appointment and report updates will appear here."
              />
            }
          />
          <Route path="profile" element={<Profile />} />

          <Route path="patients" element={<Patients />} />

          <Route
            path="messages"
            element={
              <SimplePage
                title="Messages"
                text="Secure messaging can be enabled as a future Firebase extension. No patient messages are waiting in this demonstration."
              />
            }
          />
          <Route path="content" element={<Education manage />} />

          <Route
            path="settings"
            element={
              <SimplePage
                title="System settings"
                text="Firebase project configuration and administrative options are managed securely through the Firebase console."
              />
            }
          />

          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()

  if (user.role === 'doctor') return <DoctorDashboard />
  if (user.role === 'admin') return <AdminDashboard />

  return <PatientDashboard />
}

function PatientDashboard() {
  const { user } = useAuth()

  const [dashboard, setDashboard] = useState({
    risk: null,
    symptoms: [],
    appointments: [],
    reports: [],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToDashboard(
      user.uid,
      data => {
        setDashboard(data)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user?.uid])

  const latestRisk = dashboard.risk
  const latestSymptom = dashboard.symptoms[0]
  const nextAppointment = dashboard.appointments[0]

  return (
    <PageFrame
      eyebrow="Your health overview"
      title={`Good to see you, ${user?.name?.split(' ')[0] || 'there'}.`}
      actions={
        <NavLink
          className="button"
          to="/patient/risk-assessment"
        >
          Take assessment
          <ChevronRight size={18} />
        </NavLink>
      }
    >
      <p className="lead">
        Keep a gentle eye on your breast health, one
        informed step at a time.
      </p>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>

          <strong>
            {loading
              ? '...'
              : latestRisk?.riskLevel || '--'}
          </strong>

          <span>Latest risk result</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <ClipboardList size={24} />
          </div>

          <strong>
            {loading
              ? '...'
              : latestSymptom?.symptom || '0'}
          </strong>

          <span>Recent symptom entry</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={24} />
          </div>

          <strong>
            {loading
              ? '...'
              : nextAppointment?.preferredDate || '--'}
          </strong>

          <span>Next appointment</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>

          <strong>
            {loading
              ? '...'
              : dashboard.reports.length}
          </strong>

          <span>Available reports</span>
        </div>

      </div>

      <div className="dashboard-grid">

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                Care coordination
              </span>

              <h2>Your next appointment</h2>
            </div>

            <CalendarDays size={28} />
          </div>

          {loading ? (
            <p>Loading your appointments...</p>
          ) : nextAppointment ? (
            <div className="appointment-preview">
              <strong>
                {nextAppointment.clinician}
              </strong>

              <p>
                {nextAppointment.preferredDate}
              </p>

              <p>
                Status:{' '}
                <strong>
                  {nextAppointment.status}
                </strong>
              </p>

              <p>
                {nextAppointment.reason}
              </p>
            </div>
          ) : (
            <Empty text="No upcoming appointments yet. Appointment requests will appear here." />
          )}

        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">
                Breast health awareness
              </span>

              <h2>Health reminder</h2>
            </div>

            <HeartPulse size={28} />
          </div>

          <p>
            Take time to become familiar with what is
            normal for your breasts. New or persistent
            changes deserve professional attention.
          </p>

          <NavLink
            className="text-link"
            to="/patient/self-examination"
          >
            View self-check guide
          </NavLink>
        </section>

      </div>
    </PageFrame>
  )
}

function Stat({ icon, value, label, color }) {
  return (
    <article className={`stat ${color}`}>
      <span>{icon}</span>
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  )
}

function DoctorDashboard() {
  const { user } = useAuth()

  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    assessments: 0,
  })

  const [recentPatient, setRecentPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        setError('')

        const patients = await getPatients()

        const details = await Promise.all(
          patients.map(async patient => ({
            patient,
            details: await getPatientDetails(patient.id),
          })),
        )

        if (!active) return

        const appointments = details.flatMap(
          item => item.details.appointments || [],
        )

        const assessments = details.flatMap(
          item => item.details.riskAssessments || [],
        )

        let latest = null

        for (const item of details) {
          const assessment = item.details.riskAssessments?.[0]

          if (
            assessment &&
            (!latest?.assessment ||
              (assessment.createdAt?.toMillis?.() || 0) >
                (latest.assessment.createdAt?.toMillis?.() || 0))
          ) {
            latest = {
              patient: item.patient,
              assessment,
              symptom: item.details.symptoms?.[0] || null,
            }
          }
        }

        setStats({
          patients: patients.length,
          appointments: appointments.filter(
            item => item.status === 'pending',
          ).length,
          assessments: assessments.length,
        })

        setRecentPatient(latest)
      } catch (err) {
        console.error('Doctor dashboard loading error:', err)

        if (active) {
          setError(
            'Unable to load the clinical dashboard. Check your Firestore permissions.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [user?.uid])

  return (
    <PageFrame
      eyebrow="Clinical workspace"
      title={`Welcome, ${user?.name || 'Doctor'}`}
    >
      <p className="lead">
        Review patient information and prepare clinical reports.
      </p>

      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <strong>{loading ? '...' : stats.patients}</strong>
          <span>Patients</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={24} />
          </div>
          <strong>{loading ? '...' : stats.appointments}</strong>
          <span>Pending appointments</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <strong>{loading ? '...' : stats.assessments}</strong>
          <span>Risk assessments</span>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Patient attention</span>
            <h2>Recent patient activity</h2>
          </div>

          <Stethoscope size={28} />
        </div>

        {loading ? (
          <p>Loading patient activity...</p>
        ) : recentPatient ? (
          <div className="list-card">
            <div>
              <strong>{recentPatient.patient.name}</strong>

              <p>
                Latest assessment:{' '}
                {recentPatient.assessment?.riskLevel || 'Not available'}
              </p>

              <p>
                Recent symptom:{' '}
                {recentPatient.symptom?.symptom || 'No symptom entry'}
              </p>
            </div>

            <NavLink
              className="button secondary"
              to="/doctor/patients"
            >
              View patients
            </NavLink>
          </div>
        ) : (
          <Empty text="No patient activity is available yet." />
        )}
      </section>
    </PageFrame>
  )
}

function AdminDashboard() {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>System at a glance</h1>
          <p>
            School demonstration data only. Manage access and review activity.
          </p>
        </div>

        <NavLink className="button" to="/admin/doctors">
          Review clinicians
        </NavLink>
      </div>

      <div className="stats">
        <Stat
          icon={<Users />}
          value="--"
          label="Total users"
          color="pink"
        />

        <Stat
          icon={<HeartPulse />}
          value="--"
          label="Patients"
          color="purple"
        />

        <Stat
          icon={<Stethoscope />}
          value="--"
          label="Approved clinicians"
          color="blue"
        />

        <Stat
          icon={<Bell />}
          value="--"
          label="Pending clinicians"
          color="green"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel wide">
          <div className="panel-head">
            <div>
              <h2>Pending clinician approvals</h2>
              <p>
                Review registration details before activation.
              </p>
            </div>

            <NavLink className="under" to="/admin/doctors">
              Manage
            </NavLink>
          </div>

          <Table
            headers={['Name', 'Specialization', 'Status']}
            rows={[
              ['No data loaded', '--', 'Pending'],
            ]}
          />
        </section>

        <section className="panel">
          <h2>System note</h2>

          <p>
            Admin accounts are provisioned manually. Public registration never
            provides administrator access.
          </p>
        </section>
      </div>
    </section>
  )
}

/* =========================
   REAL FIREBASE RISK MODULE
   ========================= */

function Risk() {
  const { user } = useAuth()

  const [answers, setAnswers] = useState({
    ageRange: '',
    familyHistory: '',
    previousCondition: '',
    previousBiopsy: '',
    geneticHistory: '',
    reproductiveFactor: '',
    hormoneFactor: '',
    warningSigns: [],
  })

  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [busy, setBusy] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        const records = await getRiskAssessmentHistory(user.uid)

        if (active) {
          setHistory(records)
        }
      } catch (err) {
        console.error('Risk assessment history error:', err)
      } finally {
        if (active) {
          setLoadingHistory(false)
        }
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [user.uid])

  const updateAnswer = (key, value) => {
    setAnswers(current => ({
      ...current,
      [key]: value,
    }))

    setSaved(false)
  }

  const toggleWarningSign = value => {
    setAnswers(current => {
      const currentSigns = current.warningSigns || []

      if (value === 'none') {
        return {
          ...current,
          warningSigns: currentSigns.includes('none') ? [] : ['none'],
        }
      }

      const withoutNone = currentSigns.filter(sign => sign !== 'none')

      return {
        ...current,
        warningSigns: withoutNone.includes(value)
          ? withoutNone.filter(sign => sign !== value)
          : [...withoutNone, value],
      }
    })

    setSaved(false)
  }

  const submitAssessment = e => {
    e.preventDefault()
    setError('')

    const required = [
      'ageRange',
      'familyHistory',
      'previousCondition',
      'previousBiopsy',
      'geneticHistory',
      'reproductiveFactor',
      'hormoneFactor',
    ]

    const incomplete = required.some(key => !answers[key])

    if (incomplete || answers.warningSigns.length === 0) {
      setError(
        'Please complete every question before viewing your result.',
      )
      return
    }

    const assessment = calculateRiskAssessment(answers)

    setResult(assessment)
    setSaved(false)
  }

  const saveAssessment = async () => {
    if (!result) return

    setBusy(true)
    setError('')

    try {
      await saveRiskAssessment(user.uid, {
        ...result,
        answers,
      })

      setSaved(true)

      const records = await getRiskAssessmentHistory(user.uid)
      setHistory(records)
    } catch (err) {
      console.error('Risk assessment save error:', err)

      setError(
        err.message || 'Unable to save your assessment.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Screening support</p>

          <h1>Breast health risk assessment</h1>

          <p>
            This transparent questionnaire supports awareness. It does not
            diagnose breast cancer.
          </p>
        </div>
      </div>

      <div className="notice">
        <ShieldCheck size={20} />

        <div>
          <strong>Important</strong>

          <p>
            This assessment is for awareness and screening support only. It
            does not diagnose breast cancer or replace professional medical
            evaluation.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {!result ? (
        <form className="questionnaire" onSubmit={submitAssessment}>
          <fieldset>
            <legend>Age range</legend>

            <div>
              {[
                ['under40', 'Under 40'],
                ['40to49', '40 to 49'],
                ['50plus', '50 or above'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={
                    answers.ageRange === value ? 'selected' : ''
                  }
                >
                  <input
                    required
                    type="radio"
                    name="ageRange"
                    value={value}
                    checked={answers.ageRange === value}
                    onChange={e =>
                      updateAnswer('ageRange', e.target.value)
                    }
                  />

                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              Do you have a close family history of breast cancer?
            </legend>

            <div>
              {[
                ['no', 'No'],
                ['yes', 'Yes'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={
                    answers.familyHistory === value ? 'selected' : ''
                  }
                >
                  <input
                    required
                    type="radio"
                    name="familyHistory"
                    value={value}
                    checked={answers.familyHistory === value}
                    onChange={e =>
                      updateAnswer('familyHistory', e.target.value)
                    }
                  />

                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              Have you previously had a breast-related condition requiring
              clinical review?
            </legend>

            <div>
              {[
                ['no', 'No'],
                ['yes', 'Yes'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={
                    answers.previousCondition === value ? 'selected' : ''
                  }
                >
                  <input
                    required
                    type="radio"
                    name="previousCondition"
                    value={value}
                    checked={answers.previousCondition === value}
                    onChange={e =>
                      updateAnswer('previousCondition', e.target.value)
                    }
                  />

                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Have you previously had a breast biopsy?</legend>

            <div>
              {[
                ['no', 'No'],
                ['yes', 'Yes'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={
                    answers.previousBiopsy === value ? 'selected' : ''
                  }
                >
                  <input
                    required
                    type="radio"
                    name="previousBiopsy"
                    value={value}
                    checked={answers.previousBiopsy === value}
                    onChange={e =>
                      updateAnswer('previousBiopsy', e.target.value)
                    }
                  />

                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              Do you have a known inherited breast-cancer risk factor?
            </legend>

            <div>
              {[
                ['no', 'No'],
                ['yes', 'Yes'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={
                    answers.geneticHistory === value ? 'selected' : ''
                  }
                >
                  <input
                    required
                    type="radio"
                    name="geneticHistory"
                    value={value}
                    checked={answers.geneticHistory === value}
                    onChange={e =>
                      updateAnswer('geneticHistory', e.target.value)
                    }
                  />

                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              Is there a relevant reproductive-history factor?
            </legend>

            <div>
              {[
                ['no', 'No'],
                ['yes', 'Yes'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={
                    answers.reproductiveFactor === value ? 'selected' : ''
                  }
                >
                  <input
                    required
                    type="radio"
                    name="reproductiveFactor"
                    value={value}
                    checked={answers.reproductiveFactor === value}
                    onChange={e =>
                      updateAnswer(
                        'reproductiveFactor',
                        e.target.value,
                      )
                    }
                  />

                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              Is there a current or past hormone-related factor?
            </legend>

            <div>
              {[
                ['no', 'No'],
                ['yes', 'Yes'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={
                    answers.hormoneFactor === value ? 'selected' : ''
                  }
                >
                  <input
                    required
                    type="radio"
                    name="hormoneFactor"
                    value={value}
                    checked={answers.hormoneFactor === value}
                    onChange={e =>
                      updateAnswer('hormoneFactor', e.target.value)
                    }
                  />

                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              Are you currently experiencing any warning signs?
            </legend>

            <div>
              {[
                ['lump', 'A new lump or thickening'],
                ['skin', 'Skin or nipple change'],
                ['pain', 'Persistent breast pain'],
                ['none', 'None of these'],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className={
                    answers.warningSigns.includes(value)
                      ? 'selected'
                      : ''
                  }
                >
                  <input
                    type="checkbox"
                    checked={answers.warningSigns.includes(value)}
                    onChange={() => toggleWarningSign(value)}
                  />

                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <button className="button" type="submit">
            See screening result
            <ChevronRight size={17} />
          </button>
        </form>
      ) : (
        <section className={`risk-result ${result.riskLevel.toLowerCase().replace(' ', '-')}`}>
          <ShieldCheck />

          <div>
            <p>Your screening result</p>

            <h2>{result.riskLevel}</h2>

            <p>
              {result.riskSummary}
            </p>

            <p>
              <strong>Score:</strong> {result.score}
            </p>

            {result.contributingFactors.length > 0 && (
              <>
                <h3>Contributing factors</h3>

                <ul>
                  {result.contributingFactors.map(factor => (
                    <li key={factor}>{factor}</li>
                  ))}
                </ul>
              </>
            )}

            <h3>Recommended next steps</h3>

            <ul>
              {result.recommendations.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="button-row">
              <button
                className="button"
                onClick={saveAssessment}
                disabled={busy || saved}
              >
                {saved
                  ? 'Assessment saved'
                  : busy
                    ? 'Saving...'
                    : 'Save assessment'}
              </button>

              <button
                className="button secondary"
                onClick={() => {
                  setResult(null)
                  setSaved(false)
                  setError('')
                }}
              >
                Take again
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Your records</p>
            <h2>Assessment history</h2>
          </div>
        </div>

        {loadingHistory ? (
          <p className="muted">
            Loading your assessment history...
          </p>
        ) : history.length === 0 ? (
          <p className="muted">
            No saved assessments yet. Complete an assessment to create your
            first record.
          </p>
        ) : (
          <div className="history-list">
            {history.map(item => (
              <div className="history-item" key={item.id}>
                <div>
                  <strong>{item.riskLevel}</strong>
                  <p>Score: {item.score}</p>
                </div>

                <span>
                  {item.createdAt?.toDate
                    ? item.createdAt
                        .toDate()
                        .toLocaleDateString('en-GB')
                    : 'Recently saved'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

function Symptoms() {
  const { user } = useAuth()

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    symptom: '',
    severity: 'Mild',
    date: '',
    description: '',
  })

  useEffect(() => {
    let active = true

    async function loadSymptoms() {
      try {
        const records = await getSymptoms(user.uid)

        if (active) {
          setEntries(records)
        }
      } catch (err) {
        console.error(
          'Symptoms loading error:',
          err,
        )

        if (active) {
          setError(
            'Unable to load your symptom history.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSymptoms()

    return () => {
      active = false
    }
  }, [user.uid])

  const submit = async e => {
    e.preventDefault()

    setBusy(true)
    setError('')

    try {
      await saveSymptom(user.uid, form)

      const records = await getSymptoms(user.uid)

      setEntries(records)

      setForm({
        symptom: '',
        severity: 'Mild',
        date: '',
        description: '',
      })
    } catch (err) {
      console.error(
        'Symptom save error:',
        err,
      )

      setError(
        err.message ||
          'Unable to save your symptom entry.',
      )
    } finally {
      setBusy(false)
    }
  }

  const formatDate = value => {
    if (!value) return 'Date not provided'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Private symptom journal
          </p>

          <h1>Track health changes</h1>

          <p>
            Record observations to support a clearer
            conversation with a clinician. This tool does
            not provide a diagnosis.
          </p>
        </div>
      </div>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <div className="split">
        <form
          className="panel form-panel"
          onSubmit={submit}
        >
          <h2>Add an entry</h2>

          <Input
            label="Symptom or change"
            value={form.symptom}
            onChange={e =>
              setForm({
                ...form,
                symptom: e.target.value,
              })
            }
          />

          <label className="input">
            <span>Severity</span>

            <select
              value={form.severity}
              onChange={e =>
                setForm({
                  ...form,
                  severity: e.target.value,
                })
              }
            >
              <option value="Mild">
                Mild
              </option>

              <option value="Moderate">
                Moderate
              </option>

              <option value="Severe">
                Severe
              </option>
            </select>
          </label>

          <Input
            label="Date noticed"
            type="date"
            value={form.date}
            onChange={e =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
          />

          <label className="input">
            <span>Notes</span>

            <textarea
              required
              value={form.description}
              onChange={e =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </label>

          <button
            className="button"
            disabled={busy}
          >
            {busy
              ? 'Saving...'
              : 'Save symptom'}
          </button>
        </form>

        <section className="panel">
          <h2>History</h2>

          {loading ? (
            <p className="muted">
              Loading your symptom history...
            </p>
          ) : entries.length === 0 ? (
            <Empty text="No symptom entries yet." />
          ) : (
            entries.map(entry => (
              <article
                className="record"
                key={entry.id}
              >
                <div>
                  <h3>{entry.symptom}</h3>

                  <p>
                    {entry.description}
                  </p>

                  <small>
                    {formatDate(entry.date)}
                  </small>
                </div>

                <span
                  className={`badge ${
                    entry.severity?.toLowerCase() ||
                    'mild'
                  }`}
                >
                  {entry.severity}
                </span>
              </article>
            ))
          )}
        </section>
      </div>
    </section>
  )
}

function SelfExam() {
  return (
    <PageFrame
      eyebrow="Educational guide"
      title="Breast self-examination"
    >
      <p className="intro">
        This guide helps you become familiar with your own body. It cannot
        diagnose cancer and never replaces professional screening or medical
        advice.
      </p>

      <div className="steps">
        {[
          ['Prepare', 'Choose a comfortable, well-lit setting.'],
          [
            'Look',
            'Look for new changes in shape, skin texture, swelling, or nipple appearance.',
          ],
          [
            'Feel',
            'Use finger pads in a consistent pattern across breast and underarm areas.',
          ],
          [
            'Act',
            'Contact a qualified health professional about new or concerning changes.',
          ],
        ].map(([heading, text], index) => (
          <article key={heading}>
            <span>{index + 1}</span>

            <div>
              <h2>{heading}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </PageFrame>
  )
}

function Education({ manage = false }) {
  return (
    <PageFrame
      eyebrow={manage ? 'Content management' : 'Reliable learning'}
      title="Breast health education"
    >
      <div className="education-grid">
        {education.map(item => (
          <article key={item.title}>
            <BookOpen />

            <h3>{item.title}</h3>

            <p>{item.text}</p>

            <button className="under">
              {manage ? 'Manage article' : 'Read article'}
              <ChevronRight size={15} />
            </button>
          </article>
        ))}
      </div>
    </PageFrame>
  )
}

function Appointments() {
  const { user } = useAuth()

  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({
    clinician: '',
    preferredDate: '',
    reason: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAppointments() {
      try {
        setError('')
        const data = await getAppointments(user.uid)
        setAppointments(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load your appointments.')
      } finally {
        setLoading(false)
      }
    }

    if (user?.uid) {
      loadAppointments()
    }
  }, [user?.uid])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.clinician || !form.preferredDate || !form.reason) {
      setError('Please complete all appointment fields.')
      return
    }

    try {
      setSaving(true)
      setError('')

      await saveAppointment(user.uid, form)

      const updated = await getAppointments(user.uid)
      setAppointments(updated)

      setForm({
        clinician: '',
        preferredDate: '',
        reason: '',
      })
    } catch (err) {
      console.error(err)
      setError('Unable to request your appointment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageFrame
      eyebrow="Care coordination"
      title="Appointments"
    >
      <div className="split">
        <form
          className="panel form-panel"
          onSubmit={handleSubmit}
        >
          <h2>Request an appointment</h2>

          <label className="input">
            <span>Clinician</span>
            <select
              value={form.clinician}
              onChange={event =>
                setForm({
                  ...form,
                  clinician: event.target.value,
                })
              }
              required
            >
              <option value="">Select clinician</option>
              <option value="Breast Care Clinician">
                Breast Care Clinician
              </option>
              <option value="Radiology Specialist">
                Radiology Specialist
              </option>
              <option value="General Physician">
                General Physician
              </option>
            </select>
          </label>

          <Input
            label="Preferred date"
            type="date"
            value={form.preferredDate}
            onChange={event =>
              setForm({
                ...form,
                preferredDate: event.target.value,
              })
            }
            required
          />

          <label className="input">
            <span>Reason for visit</span>
            <textarea
              value={form.reason}
              onChange={event =>
                setForm({
                  ...form,
                  reason: event.target.value,
                })
              }
              required
              placeholder="Briefly describe why you want the appointment"
            />
          </label>

          {error && (
            <p className="error">{error}</p>
          )}

          <button
            className="button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Requesting...'
              : 'Request appointment'}
          </button>
        </form>

        <section className="panel">
          <h2>Your appointments</h2>

          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <Empty text="No appointments available yet." />
          ) : (
            <div className="stack">
              {appointments.map(appointment => (
                <article
                  className="list-card"
                  key={appointment.id}
                >
                  <div>
                    <strong>
                      {appointment.clinician}
                    </strong>

                    <p>
                      {appointment.preferredDate}
                    </p>

                    <p>
                      {appointment.reason}
                    </p>
                  </div>

                  <span className="status">
                    {appointment.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageFrame>
  )
}

function Records() {
  const { user } = useAuth()

  const [records, setRecords] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRecords() {
      try {
        setError('')

        const data = await getMedicalRecords(user.uid)

        setRecords(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load your medical records.')
      } finally {
        setLoading(false)
      }
    }

    if (user?.uid) {
      loadRecords()
    }
  }, [user?.uid])

  async function handleUpload(event) {
    event.preventDefault()

    if (!file) {
      setError('Please select a PDF or image file.')
      return
    }

    try {
      setUploading(true)
      setError('')

      await uploadMedicalRecord(user.uid, file)

      const updated = await getMedicalRecords(user.uid)

      setRecords(updated)
      setFile(null)

      event.target.reset()
    } catch (err) {
      console.error(err)
      setError(
        err?.message ||
        'Unable to upload your medical record.',
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <PageFrame
      eyebrow="Health information"
      title="Medical records"
    >
      <div className="split">

        <form
          className="panel form-panel"
          onSubmit={handleUpload}
        >
          <h2>Add a medical record</h2>

          <p>
            Add a medical record to your secure patient record.
          </p>

          <label className="input">
            <span>Choose file</span>

            <input
              type="file"
              accept=".pdf,image/*"
              onChange={event =>
                setFile(event.target.files?.[0] || null)
              }
              required
            />
          </label>

          {file && (
            <p>
              Selected: <strong>{file.name}</strong>
            </p>
          )}

          {error && (
            <p className="error">{error}</p>
          )}

          <button
            className="button"
            type="submit"
            disabled={uploading}
          >
            {uploading
              ? 'Saving...'
              : 'Save medical record'}
          </button>
        </form>

        <section className="panel">
          <h2>Your medical records</h2>

          {loading ? (
            <p>Loading records...</p>
          ) : records.length === 0 ? (
            <Empty text="No medical records uploaded yet." />
          ) : (
            <div className="stack">
              {records.map(record => (
                <article
                  className="list-card"
                  key={record.id}
                >
                  <div>
                    <strong>
                      {record.fileName}
                    </strong>

                    <p>
                      {record.fileType || 'Medical document'}
                    </p>

                    <p>
                      {Math.round(
                        (record.fileSize || 0) / 1024
                      )} KB
                    </p>
                  </div>

                  {record.downloadURL && (
                    <a
                      className="button secondary"
                      href={record.downloadURL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </PageFrame>
  )
}

function Reports() {
  const { user } = useAuth()

  if (user?.role === 'doctor') {
    return <DoctorReports />
  }

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReports() {
      try {
        setError('')

        const data = await getReports(user.uid)

        setReports(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load your reports.')
      } finally {
        setLoading(false)
      }
    }

    if (user?.uid) {
      loadReports()
    }
  }, [user?.uid])

  return (
    <PageFrame
      eyebrow="Clinical information"
      title="Reports"
    >
      <section className="panel">
        <h2>Your diagnostic reports</h2>

        <p>
          Reports shared with you by an authorized
          healthcare professional will appear here.
        </p>

        {loading ? (
          <p>Loading reports...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : reports.length === 0 ? (
          <Empty text="No reports available yet." />
        ) : (
          <div className="stack">
            {reports.map(report => (
              <article
                className="list-card"
                key={report.id}
              >
                <div>
                  <strong>
                    {report.title || 'Medical Report'}
                  </strong>

                  <p>
                    {report.summary ||
                      'Report available for review.'}
                  </p>

                  {report.findings && (
                    <p>
                      <strong>Findings:</strong> {report.findings}
                    </p>
                  )}

                  {report.createdAt && (
                    <p>
                      {report.createdAt
                        ?.toDate?.()
                        ?.toLocaleDateString()}
                    </p>
                  )}
                </div>

                {report.reportUrl && (
                  <a
                    className="button secondary"
                    href={report.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View report
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageFrame>
  )
}

function DoctorReports() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [findings, setFindings] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    let active = true

    async function loadPatients() {
      try {
        setError('')
        const data = await getPatients()

        if (active) {
          setPatients(data)
        }
      } catch (err) {
        console.error('Doctor report patients error:', err)

        if (active) {
          setError(
            'Unable to load patients for reporting.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPatients()

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedPatient || !title.trim() || !summary.trim()) {
      setError(
        'Select a patient and complete the report title and summary.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      await createReport({
        patientId: selectedPatient,
        doctorId: user.uid,
        title,
        summary,
        findings,
      })

      setTitle('')
      setSummary('')
      setFindings('')
      setMessage(
        'Report saved successfully. The patient can now view it.',
      )
    } catch (err) {
      console.error('Report creation error:', err)
      setError(
        err?.message || 'Unable to save the report.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageFrame
      eyebrow="Clinical reporting"
      title="Create report"
    >
      <section className="panel form-panel">
        <h2>Prepare a patient report</h2>

        <p>
          Save a clinical summary for the selected patient.
        </p>

        {error && <p className="error">{error}</p>}
        {message && <p className="notice">{message}</p>}

        <form onSubmit={handleSubmit}>
          <label className="input">
            <span>Patient</span>
            <select
              value={selectedPatient}
              onChange={event =>
                setSelectedPatient(event.target.value)
              }
              required
              disabled={loading}
            >
              <option value="">
                {loading ? 'Loading patients...' : 'Select patient'}
              </option>

              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.email})
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Report title"
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Clinical assessment report"
          />

          <label className="input">
            <span>Summary</span>
            <textarea
              required
              value={summary}
              onChange={event => setSummary(event.target.value)}
              placeholder="Enter the clinical summary..."
            />
          </label>

          <label className="input">
            <span>Findings</span>
            <textarea
              value={findings}
              onChange={event => setFindings(event.target.value)}
              placeholder="Enter relevant findings..."
            />
          </label>

          <button
            className="button"
            type="submit"
            disabled={saving || loading}
          >
            {saving ? 'Saving report...' : 'Save report'}
          </button>
        </form>
      </section>
    </PageFrame>
  )
}

function Patients() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadPatients() {
      try {
        setError('')
        const data = await getPatients()

        if (active) {
          setPatients(data)
        }
      } catch (err) {
        console.error('Patients loading error:', err)

        if (active) {
          setError(
            'Unable to load patients. Check your Firestore permissions.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadPatients()

    return () => {
      active = false
    }
  }, [])

  async function selectPatient(patient) {
    try {
      setSelectedPatient(patient)
      setDetails(null)
      setDetailsLoading(true)
      setError('')

      const data = await getPatientDetails(patient.id)
      setDetails(data)
    } catch (err) {
      console.error('Patient details loading error:', err)
      setError('Unable to load this patient record.')
    } finally {
      setDetailsLoading(false)
    }
  }

  return (
    <PageFrame
      eyebrow="Patient directory"
      title="Patients"
    >
      {error && <p className="error">{error}</p>}

      <div className="split">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Registered patients</span>
              <h2>Patient list</h2>
            </div>
            <Users size={28} />
          </div>

          {loading ? (
            <p>Loading patients...</p>
          ) : patients.length === 0 ? (
            <Empty text="No registered patients found." />
          ) : (
            <div className="stack">
              {patients.map(patient => (
                <button
                  className="list-card"
                  key={patient.id}
                  type="button"
                  onClick={() => selectPatient(patient)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <strong>{patient.name}</strong>
                    <p>{patient.email}</p>
                    <p>{patient.phone || 'No phone provided'}</p>
                  </div>

                  <span className="badge approved">
                    {patient.status || 'active'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Clinical summary</span>
              <h2>
                {selectedPatient
                  ? selectedPatient.name
                  : 'Select a patient'}
              </h2>
            </div>
            <Stethoscope size={28} />
          </div>

          {!selectedPatient ? (
            <p className="muted">
              Select a patient to review their available information.
            </p>
          ) : detailsLoading ? (
            <p>Loading patient information...</p>
          ) : details ? (
            <div className="stack">
              <div className="record">
                <div>
                  <h3>Latest risk assessment</h3>
                  <p>
                    {details.riskAssessments?.[0]?.riskLevel ||
                      'No assessment yet'}
                  </p>
                </div>
              </div>

              <div className="record">
                <div>
                  <h3>Recent symptom</h3>
                  <p>
                    {details.symptoms?.[0]?.symptom ||
                      'No symptom entry'}
                  </p>
                  {details.symptoms?.[0]?.description && (
                    <small>
                      {details.symptoms[0].description}
                    </small>
                  )}
                </div>
              </div>

              <div className="record">
                <div>
                  <h3>Appointments</h3>
                  <p>
                    {details.appointments?.length || 0} appointment record(s)
                  </p>
                </div>
              </div>

              <div className="record">
                <div>
                  <h3>Medical records</h3>
                  <p>
                    {details.medicalRecords?.length || 0} record(s)
                  </p>
                </div>
              </div>

              <div className="record">
                <div>
                  <h3>Reports</h3>
                  <p>
                    {details.reports?.length || 0} report(s)
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </PageFrame>
  )
}

function Profile() {
  const { user } = useAuth()

  return (
    <PageFrame eyebrow="Account details" title="Your profile">
      <section className="panel profile">
        <div className="avatar">
          {user.name?.[0]?.toUpperCase() || 'U'}
        </div>

        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>

          <span className="badge approved">
            {user.role} · {user.status}
          </span>
        </div>
      </section>
    </PageFrame>
  )
}

function Table({ headers, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {['Approved', 'Pending', 'Active'].includes(
                    cell,
                  ) ? (
                    <span
                      className={`badge ${String(
                        cell,
                      ).toLowerCase()}`}
                    >
                      {cell}
                    </span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PageFrame({ eyebrow, title, children }) {
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>

      {children}
    </section>
  )
}

function SimplePage({ title, text }) {
  return (
    <PageFrame eyebrow="BreastCare Connect" title={title}>
      <section className="panel">
        <Empty text={text} />
      </section>
    </PageFrame>
  )
}

function Empty({ text }) {
  return (
    <div className="empty">
      <Bell />
      <p>{text}</p>
    </div>
  )
}

function Info({ title }) {
  return (
    <>
      <Header />

      <main className="public-page">
        <PageFrame eyebrow="Our purpose" title={title}>
          <section className="panel">
            <p className="intro">
              BreastCare Connect is a university mHealth project bringing
              awareness, risk screening, symptom recording, appointments and
              support together.
            </p>

            <p>
              It does not medically confirm breast cancer or replace
              professional care.
            </p>
          </section>
        </PageFrame>
      </main>

      <Footer />
    </>
  )
}

function Pending() {
  const { logout } = useAuth()

  return (
    <div className="pending">
      <HeartPulse />

      <h1>Your clinician account awaits approval</h1>

      <p>
        An administrator will review your professional details before portal
        access is enabled.
      </p>

      <button className="button secondary" onClick={logout}>
        Log out
      </button>
    </div>
  )
}

export default App