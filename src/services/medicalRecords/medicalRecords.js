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

export async function uploadMedicalRecord(userId, file) {
  if (!firebaseConfigured || !db) {
    throw new Error(
      'Firebase is not configured for medical records.'
    )
  }

  const reference = await addDoc(
    collection(db, 'medicalRecords'),
    {
      userId,
      fileName: file.name,
      fileType: file.type || 'Unknown',
      fileSize: file.size,
      status: 'Uploaded',
      createdAt: serverTimestamp(),
    },
  )

  return reference.id
}

export async function getMedicalRecords(userId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'medicalRecords'),
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