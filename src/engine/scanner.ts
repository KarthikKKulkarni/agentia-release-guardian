import {
  isGitRepository,
  analyzeGitRepository,
  getRepositoryFiles,
} from '../analyzers/git.js'

import {classifyFiles} from '../analyzers/file-classifier.js'
import {analyzeFiles} from '../analyzers/risk-analyzer.js'

import {
  calculateRiskLevel,
  calculateRiskScore,
} from './risk-engine.js'

import {loadPolicy} from '../config/policy.js'

import {evaluatePolicy} from './policy-engine.js'

import {ScanResult} from './types.js'

export async function runScan(
  cwd: string,
): Promise<ScanResult> {
  if (!await isGitRepository(cwd)) {
    throw new Error(
      'No Git repository found in the current directory.',
    )
  }

  const repository = await analyzeGitRepository(cwd)

  // Guardian configuration is not itself a release artifact.
  const changedChanges = repository.changes.filter(
    (change) => change.file !== 'guardian.yml',
  )

  const changedFilePaths = changedChanges.map(
    (change) => change.file,
  )

  // Get all tracked repository files for contextual analysis.
  const repositoryFiles = await getRepositoryFiles(
    repository.root,
  )

  const allFilePaths = [
    ...new Set([
      ...repositoryFiles,
      ...changedFilePaths,
    ]),
  ]

  const allFiles = classifyFiles(allFilePaths)

  const changedFiles = classifyFiles(
    changedFilePaths,
  )

  const findings = analyzeFiles(
    changedFiles,
    allFiles,
  )

  const riskScore = calculateRiskScore(findings)

  const riskLevel = calculateRiskLevel(
    riskScore,
  )

  const policy = await loadPolicy(
    repository.root,
  )

  const policyEvaluation = evaluatePolicy(
    policy,
    findings,
    riskScore,
  )

  return {
    repository: {
      root: repository.root,
      branch: repository.branch,
    },

    changedFiles: changedChanges.length,

    findings,

    riskScore,

    riskLevel,

    policy: {
      maxRiskScore: policy.maxRiskScore,
      evaluation: policyEvaluation,
    },

    releaseStatus: policyEvaluation.passed
      ? 'PASS'
      : 'BLOCKED',
  }
}