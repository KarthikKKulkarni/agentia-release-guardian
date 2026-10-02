export type Severity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export type FindingCategory =
  | 'SECURITY'
  | 'TESTING'
  | 'METADATA'
  | 'CONFIGURATION'
  | 'CODE'
  | 'GOVERNANCE'

export interface Finding {
  id: string
  category: FindingCategory
  severity: Severity
  title: string
  description: string
  file: string
  evidence?: string[]
  recommendation?: string
  score: number
}

export interface PolicyViolation {
  rule: string
  message: string
  findings: string[]
}

export interface PolicyEvaluation {
  passed: boolean
  violations: PolicyViolation[]
}

export interface ScanResult {
  repository: {
    root: string
    branch: string
  }

  changedFiles: number

  findings: Finding[]

  riskScore: number

  riskLevel: Severity

  policy: {
    maxRiskScore: number
    evaluation: PolicyEvaluation
  }

  releaseStatus: 'PASS' | 'BLOCKED'
}