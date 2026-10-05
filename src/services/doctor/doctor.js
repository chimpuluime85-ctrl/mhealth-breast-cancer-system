import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

import {
  db,
  firebaseConfigured,
} from '../firebase/config'

function sortByCreatedAt(items) {
  return items.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0
    const bTime = b.createdAt?.toMillis?.() || 0

    return bTime - aTime
  })
}

export async function getPatients() {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'users'),
      where('role', '==', 'patient'),
    ),
  )

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}

export async function getPatientRiskAssessments(patientId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'riskAssessments'),
      where('userId', '==', patientId),
    ),
  )

  return sortByCreatedAt(
    snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    })),
  )
}

export async function getPatientSymptoms(patientId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'symptoms'),
      where('userId', '==', patientId),
    ),
  )

  return sortByCreatedAt(
    snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    })),
  )
}

export async function getPatientAppointments(patientId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
    ),
  )

  return sortByCreatedAt(
    snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    })),
  )
}

export async function getPatientMedicalRecords(patientId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'medicalRecords'),
      where('userId', '==', patientId),
    ),
  )

  return sortByCreatedAt(
    snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    })),
  )
}

export async function getPatientReports(patientId) {
  if (!firebaseConfigured || !db) {
    return []
  }

  const snapshot = await getDocs(
    query(
      collection(db, 'reports'),
      where('userId', '==', patientId),
    ),
  )

  return sortByCreatedAt(
    snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    })),
  )
}

export async function getPatientDetails(patientId) {
  const [
    riskAssessments,
    symptoms,
    appointments,
    medicalRecords,
    reports,
  ] = await Promise.all([
    getPatientRiskAssessments(patientId),
    getPatientSymptoms(patientId),
    getPatientAppointments(patientId),
    getPatientMedicalRecords(patientId),
    getPatientReports(patientId),
  ])

  return {
    riskAssessments,
    symptoms,
    appointments,
    medicalRecords,
    reports,
  }
}