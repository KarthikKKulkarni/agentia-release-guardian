import {ScanResult, Finding} from '../engine/types.js'

function summarizeFinding(finding: Finding, index: number): string[] {
  const lines: string[] = []

  lines.push(
    `${index}. ${finding.title}`,
  )

  lines.push(
    `   Severity: ${finding.severity}`,
  )

  lines.push(
    `   File: ${finding.file}`,
  )

  lines.push(
    `   ${finding.description}`,
  )

  if (finding.evidence && finding.evidence.length > 0) {
    lines.push(
      `   Evidence: ${finding.evidence.join(' | ')}`,
    )
  }

  if (finding.recommendation) {
    lines.push(
      `   Recommendation: ${finding.recommendation}`,
    )
  }

  return lines
}

export function generateExplanation(result: ScanResult): string {
  const lines: string[] = []

  lines.push('')
  lines.push('AGENTIA RELEASE GUARDIAN')
  lines.push('Release Risk Explanation')
  lines.push('────────────────────────────────────────────')
  lines.push('')

  lines.push(
    `Overall risk: ${result.riskLevel} (${result.riskScore}/100)`,
  )

  lines.push(
    `Release status: ${result.releaseStatus}`,
  )

  lines.push('')

  if (result.findings.length === 0) {
    lines.push('Why?')
    lines.push('')
    lines.push(
      'No release risks were detected by the configured Guardian analyzers.',
    )
    lines.push('')
  } else {
    lines.push('Why is this release risky?')
    lines.push('')

    result.findings.forEach((finding, index) => {
      lines.push(...summarizeFinding(finding, index + 1))
      lines.push('')
    })
  }

  lines.push('Policy impact')
  lines.push('')

  if (result.policy.evaluation.violations.length === 0) {
    lines.push('✓ No policy violations detected.')
  } else {
    for (const violation of result.policy.evaluation.violations) {
      lines.push(`• ${violation.rule}`)
      lines.push(`  ${violation.message}`)

      if (violation.findings.length > 0) {
        lines.push(
          `  Affected: ${violation.findings.join(', ')}`,
        )
      }

      lines.push('')
    }
  }

  if (result.findings.length > 0) {
    lines.push('Recommended review order')
    lines.push('')

    const orderedFindings = [...result.findings].sort(
      (a, b) => b.score - a.score,
    )

    orderedFindings.forEach((finding, index) => {
      lines.push(
        `${index + 1}. ${finding.file} — ${finding.title}`,
      )
    })

    lines.push('')
  }

  lines.push('Decision basis')
  lines.push('')
  lines.push(
    'The risk score and release decision are produced by deterministic Guardian rules and policy evaluation.',
  )
  lines.push(
    'This explanation summarizes the evidence used by those rules; it does not independently change the release decision.',
  )
  lines.push('')

  return lines.join('\n')
}