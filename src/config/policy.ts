import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

export interface GuardianRules {
  requireTests: boolean
  blockDestructiveChanges: boolean
  requirePermissionReview: boolean
}

export interface GuardianPolicy {
  maxRiskScore: number
  rules: GuardianRules
}

const DEFAULT_POLICY: GuardianPolicy = {
  maxRiskScore: 70,
  rules: {
    requireTests: true,
    blockDestructiveChanges: true,
    requirePermissionReview: true,
  },
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback

  return value.trim().toLowerCase() === 'true'
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback

  const parsed = Number(value.trim())

  return Number.isFinite(parsed) ? parsed : fallback
}

export async function loadPolicy(repositoryRoot: string): Promise<GuardianPolicy> {
  const policyPath = join(repositoryRoot, 'guardian.yml')

  try {
    const content = await readFile(policyPath, 'utf8')
    const lines = content.split(/\r?\n/)

    let maxRiskScore = DEFAULT_POLICY.maxRiskScore
    let requireTests = DEFAULT_POLICY.rules.requireTests
    let blockDestructiveChanges =
      DEFAULT_POLICY.rules.blockDestructiveChanges
    let requirePermissionReview =
      DEFAULT_POLICY.rules.requirePermissionReview

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (!line || line.startsWith('#') || line === 'rules:') {
        continue
      }

      const separator = line.indexOf(':')

      if (separator === -1) {
        continue
      }

      const key = line.slice(0, separator).trim()
      const value = line.slice(separator + 1).trim()

      switch (key) {
        case 'maxRiskScore':
          maxRiskScore = parseNumber(value, maxRiskScore)
          break

        case 'requireTests':
          requireTests = parseBoolean(value, requireTests)
          break

        case 'blockDestructiveChanges':
          blockDestructiveChanges = parseBoolean(
            value,
            blockDestructiveChanges,
          )
          break

        case 'requirePermissionReview':
          requirePermissionReview = parseBoolean(
            value,
            requirePermissionReview,
          )
          break
      }
    }

    return {
      maxRiskScore,
      rules: {
        requireTests,
        blockDestructiveChanges,
        requirePermissionReview,
      },
    }
  } catch {
    return DEFAULT_POLICY
  }
}