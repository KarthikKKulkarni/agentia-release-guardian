import {Command, Flags} from '@oclif/core'
import {writeFile} from 'node:fs/promises'
import {runScan} from '../../engine/scanner.js'
import {renderJsonReport} from '../../reporters/json-reporter.js'
import {renderMarkdownReport} from '../../reporters/markdown-reporter.js'

export default class GuardianReport extends Command {
  static override description = 'Generate a Guardian release risk report'

  static override flags = {
    format: Flags.string({
      char: 'f',
      description: 'Report format',
      options: ['json', 'markdown'],
      default: 'json',
    }),

    output: Flags.string({
      char: 'o',
      description: 'Write the report to a file',
    }),
  }

  static override examples = [
    '<%= config.bin %> guardian report',
    '<%= config.bin %> guardian report --format json',
    '<%= config.bin %> guardian report --format markdown',
    '<%= config.bin %> guardian report --format markdown --output guardian-report.md',
    '<%= config.bin %> guardian report --format json --output guardian-report.json',
  ]

  public async run(): Promise<void> {
    const {flags} = await this.parse(GuardianReport)
    const cwd = process.cwd()

    let result

    try {
      result = await runScan(cwd)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Guardian report failed.'

      this.error(message, {exit: 1})
    }

    const report =
      flags.format === 'markdown'
        ? renderMarkdownReport(result)
        : renderJsonReport(result)

    if (flags.output) {
      await writeFile(flags.output, report, 'utf8')

      this.log(`Report written to: ${flags.output}`)
      return
    }

    this.log(report)
  }
}