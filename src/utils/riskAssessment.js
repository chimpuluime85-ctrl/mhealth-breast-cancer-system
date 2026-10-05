const factorLabels = {
  age50: 'Age 50 or above',
  age40: 'Age 40 to 49',
  family: 'Close family history of breast cancer',
  condition: 'Previous breast-related condition',
  biopsy: 'Previous breast biopsy',
  genetic: 'Known inherited breast-cancer risk factor',
  reproductive: 'Relevant reproductive-history factor',
  hormone: 'Current or past hormone-related factor',
  lump: 'A new lump or thickening',
  skin: 'Skin or nipple change',
  pain: 'Persistent breast pain'
}

export function calculateRiskAssessment(answers) {
  const factors = []
  let score = 0
  const add = (condition, points, label) => { if (condition) { score += points; factors.push(label) } }
  add(answers.ageRange === '50plus', 2, factorLabels.age50)
  add(answers.ageRange === '40to49', 1, factorLabels.age40)
  add(answers.familyHistory === 'yes', 3, factorLabels.family)
  add(answers.previousCondition === 'yes', 2, factorLabels.condition)
  add(answers.previousBiopsy === 'yes', 2, factorLabels.biopsy)
  add(answers.geneticHistory === 'yes', 4, factorLabels.genetic)
  add(answers.reproductiveFactor === 'yes', 1, factorLabels.reproductive)
  add(answers.hormoneFactor === 'yes', 1, factorLabels.hormone)
  add(answers.warningSigns?.includes('lump'), 4, factorLabels.lump)
  add(answers.warningSigns?.includes('skin'), 3, factorLabels.skin)
  add(answers.warningSigns?.includes('pain'), 2, factorLabels.pain)
  const riskLevel = score >= 7 ? 'Higher Risk' : score >= 3 ? 'Moderate Risk' : 'Low Risk'
  const riskSummary = riskLevel === 'Higher Risk'
    ? 'Your responses indicate factors associated with a higher risk profile in this questionnaire.'
    : riskLevel === 'Moderate Risk'
      ? 'Your responses indicate some factors worth discussing during routine professional care.'
      : 'Your responses indicate a lower risk profile based on this questionnaire.'
  const recommendations = riskLevel === 'Higher Risk'
    ? ['Arrange a qualified healthcare consultation soon.', 'Discuss your family and personal history with a clinician.', 'Seek prompt care for any new or persistent breast change.']
    : riskLevel === 'Moderate Risk'
      ? ['Discuss your risk factors at your next healthcare visit.', 'Continue routine screening as advised by a clinician.', 'Seek care promptly for new or persistent breast changes.']
      : ['Continue breast-health awareness and routine professional screening as advised.', 'Stay familiar with changes in your breasts and underarm area.', 'Seek care for any new, persistent, or concerning symptoms.']
  return { score, riskLevel, riskSummary, contributingFactors: factors, recommendations }
}
