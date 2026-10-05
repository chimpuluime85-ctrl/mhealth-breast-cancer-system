import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'

import { db, firebaseConfigured } from '../firebase/config'

export function subscribeToDashboard(userId, callback) {
  if (!firebaseConfigured || !db) {
    callback({
      risk: null,
      symptoms: [],
      appointments: [],
      reports: [],
    })

    return () => {}
  }

  let risk = []
  let symptoms = []
  let appointments = []
  let reports = []

  const sendUpdate = () => {
    const sortedRisk = [...risk].sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0
      const bTime = b.createdAt?.toMillis?.() || 0

      return bTime - aTime
    })

    const sortedSymptoms = [...symptoms].sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0
      const bTime = b.createdAt?.toMillis?.() || 0

      return bTime - aTime
    })

    const today = new Date().toISOString().split('T')[0]

    const upcomingAppointments = [...appointments]
      .filter(
        item =>
          item.preferredDate >= today &&
          item.status !== 'cancelled',
      )
      .sort((a, b) =>
        a.preferredDate.localeCompare(b.preferredDate),
      )

    callback({
      risk: sortedRisk[0] || null,
      symptoms: sortedSymptoms,
      appointments: upcomingAppointments,
      reports,
    })
  }

  const unsubscribeRisk = onSnapshot(
    query(
      collection(db, 'riskAssessments'),
      where('userId', '==', userId),
    ),
    snapshot => {
      risk = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }))

      sendUpdate()
    },
  )

  const unsubscribeSymptoms = onSnapshot(
    query(
      collection(db, 'symptoms'),
      where('userId', '==', userId),
    ),
    snapshot => {
      symptoms = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }))

      sendUpdate()
    },
  )

  const unsubscribeAppointments = onSnapshot(
    query(
      collection(db, 'appointments'),
      where('patientId', '==', userId),
    ),
    snapshot => {
      appointments = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }))

      sendUpdate()
    },
  )

  const unsubscribeReports = onSnapshot(
    query(
      collection(db, 'reports'),
      where('userId', '==', userId),
    ),
    snapshot => {
      reports = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data(),
      }))

      sendUpdate()
    },
  )

  return () => {
    unsubscribeRisk()
    unsubscribeSymptoms()
    unsubscribeAppointments()
    unsubscribeReports()
  }
}