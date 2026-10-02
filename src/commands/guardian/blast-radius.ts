import {Command} from '@oclif/core'
import {analyzeGitRepository, isGitRepository} from '../../analyzers/git.js'
import {classifyFiles} from '../../analyzers/file-classifier.js'
import {analyzeBlastRadius} from '../../analyzers/blast-radius.js'

export default class GuardianBlastRadius extends Command {
  static override description =
    'Analyze the potential impact areas of the current release'

  static override examples = [
    '<%= config.bin %> guardian blast-radius',
  ]

  public async run(): Promise<void> {
    const cwd = process.cwd()

    if (!await isGitRepository(cwd)) {
      this.error('No Git repository found in the current directory.', {exit: 1})
    }

    const repository = await analyzeGitRepository(cwd)

    const changedFiles = repository.changes
      .filter((change) => change.file !== 'guardian.yml')
      .map((change) => change.file)

    const classifiedFiles = classifyFiles(changedFiles)
    const result = analyzeBlastRadius(classifiedFiles)

    this.log('')
    this.log('AGENTIA RELEASE GUARDIAN')
    this.log('Blast Radius Analysis')
    this.log('────────────────────────────────────────────')
    this.log('')

    if (result.items.length === 0) {
      this.log('No changed files detected.')
      this.log('')
      return
    }

    this.log('Changed Components')
    this.log('────────────────────────────────────────────')
    this.log('')

    for (const item of result.items) {
      this.log(`${item.file}`)
      this.log(`  Type:   ${item.type}`)
      this.log(`  Impact: ${item.impact}`)
      this.log(`  Areas:  ${item.areas.join(', ')}`)
      this.log('')
    }

    this.log('Affected Areas')
    this.log('────────────────────────────────────────────')
    this.log('')

    for (const area of result.affectedAreas) {
      this.log(`• ${area}`)
    }

    this.log('')
  }
}