import {
  Finding,
  Severity,
} from './types.js'

export function calculateRiskScore(
  findings: Finding[],
): number {
  const score = findings.reduce(
    (total, finding) => total + finding.score,
    0,
  )

  return Math.min(score, 100)
}

export function calculateRiskLevel(
  score: number,
): Severity {
  if (score >= 80) {
    return 'CRITICAL'
  }

  if (score >= 60) {
    return 'HIGH'
  }

  if (score >= 30) {
    return 'MEDIUM'
  }

  return 'LOW'
}