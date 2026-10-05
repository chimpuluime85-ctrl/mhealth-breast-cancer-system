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

export async function getReports(userId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'reports'),
      where('userId', '==', userId),
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

export async function createReport({
  patientId,
  doctorId,
  title,
  summary,
  findings,
}) {
  if (!firebaseConfigured || !db) {
    throw new Error('Firebase is not configured for reports.')
  }

  if (!patientId || !doctorId) {
    throw new Error('Patient and doctor information are required.')
  }

  if (!title?.trim() || !summary?.trim()) {
    throw new Error('Report title and summary are required.')
  }

  const reference = await addDoc(
    collection(db, 'reports'),
    {
      userId: patientId,
      doctorId,
      title: title.trim(),
      summary: summary.trim(),
      findings: findings?.trim() || '',
      createdAt: serverTimestamp(),
    },
  )

  return reference.id
}