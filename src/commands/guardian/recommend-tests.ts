import {Command} from '@oclif/core'
import {
  analyzeGitRepository,
  getRepositoryFiles,
  isGitRepository,
} from '../../analyzers/git.js'
import {classifyFiles} from '../../analyzers/file-classifier.js'
import {generateTestRecommendations} from '../../analyzers/test-recommender.js'

export default class GuardianRecommendTests extends Command {
  static override description =
    'Recommend tests and validation for the current release'

  static override examples = [
    '<%= config.bin %> guardian recommend-tests',
  ]

  public async run(): Promise<void> {
    const cwd = process.cwd()

    if (!await isGitRepository(cwd)) {
      this.error(
        'No Git repository found in the current directory.',
        {exit: 1},
      )
    }

    const repository = await analyzeGitRepository(cwd)

    const changedFilePaths = repository.changes
      .filter((change) => change.file !== 'guardian.yml')
      .map((change) => change.file)

    const repositoryFiles = await getRepositoryFiles(
      repository.root,
    )

    const allFilePaths = [
      ...new Set([
        ...repositoryFiles,
        ...changedFilePaths,
      ]),
    ]

    const changedFiles = classifyFiles(changedFilePaths)
    const classifiedRepositoryFiles = classifyFiles(
      allFilePaths,
    )

    const result = generateTestRecommendations(
      changedFiles,
      classifiedRepositoryFiles,
    )

    this.log('')
    this.log('AGENTIA RELEASE GUARDIAN')
    this.log('Recommended Tests')
    this.log('────────────────────────────────────────────')
    this.log('')

    if (result.recommendations.length === 0) {
      this.log('No test recommendations generated.')
      this.log('')
      return
    }

    for (const item of result.recommendations) {
      this.log(item.file)
      this.log(`  Type: ${item.type}`)

      if (item.relatedTests.length > 0) {
        this.log(
          `  Related tests: ${item.relatedTests.join(', ')}`,
        )
      } else {
        this.log('  Related tests: None detected')
      }

      this.log('')
      this.log('  Recommendations:')

      for (const recommendation of item.recommendations) {
        this.log(`    • ${recommendation}`)
      }

      this.log('')
    }
  }
}