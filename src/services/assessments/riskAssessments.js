import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { db, firebaseConfigured } from '../firebase/config'

export async function saveRiskAssessment(userId, assessment) {
  if (!firebaseConfigured || !db) throw new Error('Firebase is not configured for assessment saving.')
  const reference = await addDoc(collection(db, 'riskAssessments'), {
    userId,
    score: assessment.score,
    riskLevel: assessment.riskLevel,
    answers: assessment.answers,
    contributingFactors: assessment.contributingFactors,
    recommendations: assessment.recommendations,
    createdAt: serverTimestamp()
  })
  return reference.id
}

export async function getRiskAssessmentHistory(userId) {
  if (!firebaseConfigured || !db) return []
  const snapshot = await getDocs(query(collection(db, 'riskAssessments'), where('userId', '==', userId)))
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() })).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
}
