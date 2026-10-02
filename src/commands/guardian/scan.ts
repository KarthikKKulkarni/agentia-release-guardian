import {Command} from '@oclif/core'

import {runScan} from '../../engine/scanner.js'

export default class GuardianScan extends Command {
  static override description =
    'Analyze the current repository for release risks'

  static override examples = [
    '<%= config.bin %> guardian scan',
  ]

  public async run(): Promise<void> {
    const cwd = process.cwd()

    this.log('')
    this.log('╔══════════════════════════════════════════╗')
    this.log('║       AGENTIA RELEASE GUARDIAN           ║')
    this.log('╚══════════════════════════════════════════╝')
    this.log('')

    let result

    try {
      result = await runScan(cwd)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Guardian scan failed.'

      this.error(message, {exit: 1})
    }

    // --------------------------------------------------
    // Repository
    // --------------------------------------------------

    this.log('Repository')
    this.log('────────────────────────────────────────────')
    this.log(`Path:           ${result.repository.root}`)
    this.log(`Branch:         ${result.repository.branch}`)
    this.log(`Changed files:  ${result.changedFiles}`)
    this.log('')

    // --------------------------------------------------
    // Findings
    // --------------------------------------------------

    this.log('Findings')
    this.log('────────────────────────────────────────────')

    if (result.findings.length === 0) {
      this.log('✓ No findings detected.')
    } else {
      for (const finding of result.findings) {
        this.log(
          `${finding.severity.padEnd(8)} ` +
          `${finding.id} ` +
          `${finding.title}`,
        )

        this.log(
          `         File: ${finding.file}`,
        )

        this.log(
          `         ${finding.description}`,
        )

        if (
          finding.evidence &&
          finding.evidence.length > 0
        ) {
          this.log(
            `         Evidence: ${finding.evidence.join(' | ')}`,
          )
        }

        if (finding.recommendation) {
          this.log(
            `         Recommendation: ${finding.recommendation}`,
          )
        }

        this.log('')
      }
    }

    // --------------------------------------------------
    // Risk assessment
    // --------------------------------------------------

    this.log('Risk Assessment')
    this.log('────────────────────────────────────────────')
    this.log(
      `Risk Score:     ${result.riskScore}/100`,
    )
    this.log(
      `Risk Level:     ${result.riskLevel}`,
    )
    this.log('')

    // --------------------------------------------------
    // Policy evaluation
    // --------------------------------------------------

    this.log('Policy Evaluation')
    this.log('────────────────────────────────────────────')

    this.log(
      `Maximum Risk:   ${result.policy.maxRiskScore}`,
    )

    if (result.policy.evaluation.passed) {
      this.log(
        '✓ Policy requirements satisfied.',
      )
    } else {
      for (
        const violation
        of result.policy.evaluation.violations
      ) {
        this.log(
          `✗ ${violation.rule}: ${violation.message}`,
        )

        if (violation.findings.length > 0) {
          this.log(
            `  Affected: ${violation.findings.join(', ')}`,
          )
        }
      }
    }

    this.log('')

    // --------------------------------------------------
    // Release status
    // --------------------------------------------------

    this.log(
      `Release Status: ${result.releaseStatus}`,
    )

    this.log('')
  }
}