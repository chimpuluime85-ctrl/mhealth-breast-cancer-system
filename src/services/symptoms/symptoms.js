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

export async function saveSymptom(userId, symptom) {
  if (!firebaseConfigured || !db) {
    throw new Error(
      'Firebase is not configured for symptom saving.',
    )
  }

  const reference = await addDoc(
    collection(db, 'symptoms'),
    {
      userId,
      symptom: symptom.symptom,
      severity: symptom.severity,
      date: symptom.date,
      description: symptom.description,
      createdAt: serverTimestamp(),
    },
  )

  return reference.id
}

export async function getSymptoms(userId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'symptoms'),
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