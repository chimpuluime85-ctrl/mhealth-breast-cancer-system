import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import {
  db,
  firebaseConfigured,
} from '../firebase/config'

export async function saveAppointment(userId, appointment) {
  if (!firebaseConfigured || !db) {
    throw new Error('Firebase is not configured for appointments.')
  }

  const reference = await addDoc(
    collection(db, 'appointments'),
    {
      patientId: userId,
      clinician: appointment.clinician,
      preferredDate: appointment.preferredDate,
      reason: appointment.reason,
      status: 'pending',
      createdAt: serverTimestamp(),
    },
  )

  return reference.id
}

export async function getAppointments(userId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'appointments'),
      where('patientId', '==', userId),
    ),
  )

  return snapshot.docs
    .map(item => ({
      id: item.id,
      ...item.data(),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0
      const bTime = b.createdAt?.toMillis?.() || 0

      return bTime - aTime
    })
}