import {Command} from '@oclif/core'
import {readFile} from 'node:fs/promises'
import {join} from 'node:path'

export default class GuardianPolicyValidate extends Command {
  static override description = 'Validate the Guardian policy configuration'

  static override examples = [
    '<%= config.bin %> guardian policy validate',
  ]

  public async run(): Promise<void> {
    const repositoryRoot = process.cwd()
    const policyPath = join(repositoryRoot, 'guardian.yml')

    let content: string

    try {
      content = await readFile(policyPath, 'utf8')
    } catch {
      this.error(
        `Guardian policy file not found: ${policyPath}`,
        {exit: 1},
      )
    }

    const errors: string[] = []

    const lines = content.split(/\r?\n/)

    let maxRiskScore: number | undefined
    const rules = new Set<string>()

    for (const rawLine of lines) {
      const line = rawLine.trim()

      if (!line || line.startsWith('#') || line === 'rules:') {
        continue
      }

      const separator = line.indexOf(':')

      if (separator === -1) {
        errors.push(`Invalid policy line: ${line}`)
        continue
      }

      const key = line.slice(0, separator).trim()
      const value = line.slice(separator + 1).trim()

      if (key === 'maxRiskScore') {
        const parsed = Number(value)

        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
          errors.push(
            'maxRiskScore must be a number between 0 and 100.',
          )
        } else {
          maxRiskScore = parsed
        }

        continue
      }

      if (
        key === 'requireTests' ||
        key === 'blockDestructiveChanges' ||
        key === 'requirePermissionReview'
      ) {
        if (value !== 'true' && value !== 'false') {
          errors.push(`${key} must be true or false.`)
        } else {
          rules.add(key)
        }

        continue
      }

      errors.push(`Unknown policy key: ${key}`)
    }

    if (maxRiskScore === undefined) {
      errors.push('Missing required policy key: maxRiskScore')
    }

    const requiredRules = [
      'requireTests',
      'blockDestructiveChanges',
      'requirePermissionReview',
    ]

    for (const rule of requiredRules) {
      if (!rules.has(rule)) {
        errors.push(`Missing required policy rule: ${rule}`)
      }
    }

    this.log('')
    this.log('AGENTIA RELEASE GUARDIAN')
    this.log('Policy Validation')
    this.log('────────────────────────────────────────────')

    if (errors.length === 0) {
      this.log('✓ Policy configuration is valid.')
      this.log(`  File: ${policyPath}`)
      this.log(`  Maximum risk score: ${maxRiskScore}`)
      this.log('  Rules: 3')
      this.log('')
      this.log('Policy Status: PASS')
      return
    }

    this.log('✗ Policy configuration is invalid.')
    this.log('')

    for (const error of errors) {
      this.log(`  • ${error}`)
    }

    this.log('')
    this.log('Policy Status: INVALID')

    this.exit(1)
  }
}