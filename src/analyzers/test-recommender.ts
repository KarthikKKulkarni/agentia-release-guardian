import {ClassifiedFile} from './file-classifier.js'

export interface TestRecommendation {
  file: string
  type: string
  relatedTests: string[]
  recommendations: string[]
}

export interface TestRecommendationResult {
  recommendations: TestRecommendation[]
}

function getFileStem(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const fileName = normalized.split('/').pop() ?? normalized

  return fileName.replace(
    /\.(cls|ts|js|java|cpp|c)$/i,
    '',
  )
}

function findRelatedTests(
  sourceFile: ClassifiedFile,
  repositoryFiles: ClassifiedFile[],
): string[] {
  const sourceStem = getFileStem(sourceFile.path).toLowerCase()

  return repositoryFiles
    .filter((file) => file.type === 'TEST')
    .filter((file) => {
      const testStem = getFileStem(file.path).toLowerCase()

      return (
        testStem === `${sourceStem}test` ||
        testStem === `${sourceStem}_test`
      )
    })
    .map((file) => file.path)
}

export function generateTestRecommendations(
  changedFiles: ClassifiedFile[],
  repositoryFiles: ClassifiedFile[],
): TestRecommendationResult {
  const recommendations: TestRecommendation[] = []

  for (const file of changedFiles) {
    switch (file.type) {
      case 'SOURCE': {
        const relatedTests = findRelatedTests(
          file,
          repositoryFiles,
        )

        recommendations.push({
          file: file.path,
          type: file.type,
          relatedTests,
          recommendations:
            relatedTests.length > 0
              ? [
                  `Run ${relatedTests.join(', ')}.`,
                  'Verify positive-path behavior.',
                  'Verify negative and error-path behavior.',
                  'Verify boundary conditions for the changed logic.',
                ]
              : [
                  `Create a related test for ${file.path}.`,
                  'Add positive-path coverage.',
                  'Add negative and error-path coverage.',
                  'Add boundary-condition coverage.',
                ],
        })

        break
      }

      case 'PERMISSION':
        recommendations.push({
          file: file.path,
          type: file.type,
          relatedTests: [],
          recommendations: [
            'Validate authorization and access-control behavior.',
            'Review affected permission assignments.',
            'Verify users retain only the intended access.',
          ],
        })
        break

      case 'DESTRUCTIVE':
        recommendations.push({
          file: file.path,
          type: file.type,
          relatedTests: [],
          recommendations: [
            'Run deployment validation before promotion.',
            'Verify that metadata removal is intentional.',
            'Check for dependent components before deployment.',
          ],
        })
        break

      case 'CONFIGURATION':
        recommendations.push({
          file: file.path,
          type: file.type,
          relatedTests: [],
          recommendations: [
            'Validate the configuration in a non-production environment.',
            'Verify expected runtime behavior after the change.',
          ],
        })
        break

      case 'METADATA':
        recommendations.push({
          file: file.path,
          type: file.type,
          relatedTests: [],
          recommendations: [
            'Validate metadata deployment.',
            'Verify dependent components remain functional.',
          ],
        })
        break

      default:
        break
    }
  }

  return {recommendations}
}