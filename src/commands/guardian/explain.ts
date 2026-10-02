import {Command, Flags} from '@oclif/core'
import {runScan} from '../../engine/scanner.js'
import {generateExplanation} from '../../explain/explanation-engine.js'

export default class GuardianExplain extends Command {
  static override description =
    'Explain the risks and policy impact of the current release'

  static override flags = {
    json: Flags.boolean({
      description: 'Output an AI-ready structured explanation',
      default: false,
    }),
  }

  static override examples = [
    '<%= config.bin %> guardian explain',
    '<%= config.bin %> guardian explain --json',
  ]

  public async run(): Promise<void> {
    const {flags} = await this.parse(GuardianExplain)
    const cwd = process.cwd()

    let result

    try {
      result = await runScan(cwd)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Guardian explanation failed.'

      this.error(message, {exit: 1})
    }

    if (flags.json) {
      const output = {
        release: {
          repository: result.repository,
          changedFiles: result.changedFiles,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          status: result.releaseStatus,
        },
        findings: result.findings.map((finding) => ({
          id: finding.id,
          category: finding.category,
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          file: finding.file,
          evidence: finding.evidence ?? [],
          recommendation: finding.recommendation ?? null,
          score: finding.score,
        })),
        policy: {
          maxRiskScore: result.policy.maxRiskScore,
          passed: result.policy.evaluation.passed,
          violations: result.policy.evaluation.violations,
        },
        explanationContract: {
          riskDecisionSource: 'deterministic-guardian-engine',
          aiRole:
            'Interpret and explain Guardian findings without changing the risk decision.',
        },
      }

      this.log(JSON.stringify(output, null, 2))
      return
    }

    this.log(generateExplanation(result))
  }
}