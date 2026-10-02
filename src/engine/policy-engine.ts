import {Finding} from './types.js'
import {GuardianPolicy} from '../config/policy.js'

export interface PolicyViolation {
  rule: string
  message: string
  findings: string[]
}

export interface PolicyResult {
  passed: boolean
  violations: PolicyViolation[]
}

export function evaluatePolicy(
  policy: GuardianPolicy,
  findings: Finding[],
  riskScore: number,
): PolicyResult {
  const violations: PolicyViolation[] = []

  if (riskScore > policy.maxRiskScore) {
    violations.push({
      rule: 'maxRiskScore',
      message: `Risk score ${riskScore} exceeds maximum allowed score ${policy.maxRiskScore}.`,
      findings: [],
    })
  }

  if (policy.rules.requireTests) {
    const missingTests = findings.filter(
      (finding) =>
        finding.id === 'TEST-001' &&
        finding.severity === 'MEDIUM',
    )

    if (missingTests.length > 0) {
      violations.push({
        rule: 'requireTests',
        message:
          'Production source changes without related tests are not allowed.',
        findings: missingTests.map((finding) => finding.file),
      })
    }
  }

  if (policy.rules.blockDestructiveChanges) {
    const destructiveChanges = findings.filter(
      (finding) => finding.id === 'DEPLOY-001',
    )

    if (destructiveChanges.length > 0) {
      violations.push({
        rule: 'blockDestructiveChanges',
        message:
          'Destructive deployment changes are blocked by policy.',
        findings: destructiveChanges.map((finding) => finding.file),
      })
    }
  }

  if (policy.rules.requirePermissionReview) {
    const permissionChanges = findings.filter(
      (finding) => finding.id === 'SEC-001',
    )

    if (permissionChanges.length > 0) {
      violations.push({
        rule: 'requirePermissionReview',
        message:
          'Permission or profile changes require governance review.',
        findings: permissionChanges.map((finding) => finding.file),
      })
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  }
}