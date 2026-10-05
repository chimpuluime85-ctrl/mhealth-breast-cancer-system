import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import {
  auth,
  db,
  firebaseConfigured,
} from '../services/firebase/config'

const AuthContext = createContext()

const DEMO_ACCOUNTS = {
  'patient.demo@breastcare.test': {
    password: 'DemoPatient123!',
    name: 'Amara Okafor',
    role: 'patient',
    status: 'active',
    label: 'Patient',
  },

  'doctor.demo@breastcare.test': {
    password: 'DemoDoctor123!',
    name: 'Dr. Adaeze Bello',
    role: 'doctor',
    status: 'active',
    specialization: 'Oncology',
    label: 'Doctor',
  },

  'admin.demo@breastcare.test': {
    password: 'DemoAdmin123!',
    name: 'System Administrator',
    role: 'admin',
    status: 'active',
    label: 'Admin',
  },
}

export function getFirebaseErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use':
      'An account already exists with this email address. Please log in or use another email.',

    'auth/invalid-email':
      'Enter a valid email address.',

    'auth/weak-password':
      'Your password is too weak. Use at least six characters.',

    'auth/invalid-credential':
      'Invalid email or password. Please check your login details.',

    'auth/user-not-found':
      'No account was found with this email address.',

    'auth/wrong-password':
      'Invalid email or password. Please check your login details.',

    'auth/operation-not-allowed':
      'Email/password registration is not enabled in Firebase Authentication.',

    'auth/network-request-failed':
      'Network connection failed. Check your connection and try again.',

    'permission-denied':
      'Your account was created, but the profile could not be saved because Firestore permission was denied.',

    'firestore/permission-denied':
      'Your account was created, but the profile could not be saved because Firestore permission was denied.',

    'firestore/invalid-argument':
      'Your account profile contains an invalid value and could not be saved.',
  }

  return (
    messages[error?.code] ||
    error?.message ||
    'We could not complete your request. Please try again.'
  )
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async account => {
    if (!account) return null

    if (import.meta.env.DEV) {
      console.info('Fetching Firestore user profile:', {
        uid: account.uid,
      })
    }

    const snap = await getDoc(
      doc(db, 'users', account.uid),
    )

    if (!snap.exists()) {
      throw new Error(
        'Your account is authenticated, but its user profile could not be found.',
      )
    }

    const profile = {
      uid: account.uid,
      ...snap.data(),
    }

    if (import.meta.env.DEV) {
      console.info('Firestore user profile loaded:', {
        uid: profile.uid,
        role: profile.role,
        status: profile.status,
      })
    }

    return profile
  }

  /*
   * Firebase authentication listener.
   *
   * Important:
   * We do NOT clear the current React user while Firebase is
   * hydrating the authenticated account.
   */
  useEffect(() => {
    if (!firebaseConfigured) {
      const saved = localStorage.getItem(
        'mhealth-demo-user',
      )

      setUser(
        saved
          ? JSON.parse(saved)
          : null,
      )

      setLoading(false)

      return undefined
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async account => {
        if (import.meta.env.DEV) {
          console.info(
            'onAuthStateChanged:',
            {
              uid: account?.uid ?? null,
              authenticated: Boolean(account),
            },
          )
        }

        /*
         * No Firebase account means the user is genuinely logged out.
         */
        if (!account) {
          setUser(null)
          setLoading(false)
          return
        }

        /*
         * Keep the existing authenticated profile while
         * Firebase loads the Firestore profile.
         */
        try {
          const profile =
            await fetchUserProfile(account)

          setUser(profile)
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(
              'Firebase auth state profile lookup failed:',
              error,
            )
          }

          /*
           * Only clear the user if Firebase has an authenticated
           * account but its profile genuinely cannot be loaded.
           */
          setUser(null)
        } finally {
          setLoading(false)
        }
      },
    )

    return unsubscribe
  }, [])

  const login = async (email, password) => {
    if (!firebaseConfigured) {
      const account =
        DEMO_ACCOUNTS[email.toLowerCase()]

      if (
        !account ||
        account.password !== password
      ) {
        throw new Error(
          'Invalid email or password. Use one of the local demo accounts below.',
        )
      }

      const profile = {
        uid: email,
        email,
        ...account,
      }

      localStorage.setItem(
        'mhealth-demo-user',
        JSON.stringify(profile),
      )

      setUser(profile)
      setLoading(false)

      return profile
    }

    try {
      setLoading(true)

      const result =
        await signInWithEmailAndPassword(
          auth,
          email,
          password,
        )

      if (import.meta.env.DEV) {
        console.info(
          'signInWithEmailAndPassword result:',
          {
            uid: result.user.uid,
            email: result.user.email,
          },
        )
      }

      const profile =
        await fetchUserProfile(result.user)

      /*
       * Set the complete profile before returning to Login.jsx.
       */
      setUser(profile)

      if (import.meta.env.DEV) {
        console.info(
          'LOGIN PROFILE READY:',
          {
            uid: profile.uid,
            role: profile.role,
            status: profile.status,
          },
        )
      }

      return profile
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          'Firebase login failed:',
          error,
        )
      }

      setUser(null)

      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async data => {
    const { password } = data

    const role =
      data.role === 'doctor'
        ? 'doctor'
        : 'patient'

    const profile = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role,
      status:
        role === 'doctor'
          ? 'pending'
          : 'active',

      ...(role === 'doctor'
        ? {
            specialization:
              data.specialization,
          }
        : {}),
    }

    if (!firebaseConfigured) {
      profile.uid = `demo-${Date.now()}`

      localStorage.setItem(
        'mhealth-demo-user',
        JSON.stringify(profile),
      )

      setUser(profile)
      setLoading(false)

      return profile
    }

    try {
      setLoading(true)

      const result =
        await createUserWithEmailAndPassword(
          auth,
          data.email,
          password,
        )

      if (!result.user) {
        throw new Error(
          'Firebase did not return an authenticated user.',
        )
      }

      const userProfileRef = doc(
        db,
        'users',
        result.user.uid,
      )

      const persistedProfile = {
        ...profile,
        email: result.user.email,
        createdAt: serverTimestamp(),
      }

      if (import.meta.env.DEV) {
        console.info(
          'Firebase profile payload before setDoc:',
          {
            userId: result.user.uid,
            profile: persistedProfile,
          },
        )
      }

      await setDoc(
        userProfileRef,
        persistedProfile,
      )

      const createdProfile = {
        uid: result.user.uid,
        ...profile,
        email: result.user.email,
      }

      setUser(createdProfile)

      return createdProfile
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          'Firebase registration failed:',
          error,
        )
      }

      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (firebaseConfigured) {
      await signOut(auth)
      setUser(null)
    } else {
      localStorage.removeItem(
        'mhealth-demo-user',
      )

      setUser(null)
    }
  }

  const resetPassword = async email => {
    if (!firebaseConfigured) return

    await sendPasswordResetEmail(
      auth,
      email,
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        demo: !firebaseConfigured,
        demoAccounts:
          Object.entries(
            DEMO_ACCOUNTS,
          ).map(
            ([email, account]) => ({
              email,
              password:
                account.password,
              label: account.label,
            }),
          ),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)