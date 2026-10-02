import {Finding} from '../engine/types.js'
import {ClassifiedFile} from './file-classifier.js'

function getFileStem(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const fileName = normalized.split('/').pop() ?? normalized

  return fileName.replace(
    /\.(cls|ts|js|java|cpp|c)$/i,
    '',
  )
}

function hasRelatedTest(
  sourceFile: string,
  repositoryFiles: ClassifiedFile[],
): boolean {
  const sourceStem = getFileStem(sourceFile).toLowerCase()

  return repositoryFiles.some((file) => {
    if (file.type !== 'TEST') {
      return false
    }

    const testStem = getFileStem(file.path).toLowerCase()

    return (
      testStem === `${sourceStem}test` ||
      testStem === `${sourceStem}_test`
    )
  })
}

export function analyzeFiles(
  changedFiles: ClassifiedFile[],
  repositoryFiles: ClassifiedFile[],
): Finding[] {
  const findings: Finding[] = []

  for (const file of changedFiles) {
    // --------------------------------------------------
    // Destructive deployment changes
    // --------------------------------------------------

    if (file.type === 'DESTRUCTIVE') {
      findings.push({
        id: 'DEPLOY-001',
        category: 'GOVERNANCE',
        severity: 'CRITICAL',
        title: 'Destructive deployment change detected',
        description:
          'The release contains a destructive metadata change.',
        file: file.path,
        evidence: [
          'Destructive deployment artifact detected.',
        ],
        recommendation:
          'Review the destructive change and verify that it is intentional.',
        score: 40,
      })
    }

    // --------------------------------------------------
    // Permission changes
    // --------------------------------------------------

    if (file.type === 'PERMISSION') {
      findings.push({
        id: 'SEC-001',
        category: 'SECURITY',
        severity: 'HIGH',
        title: 'Permission or profile change detected',
        description:
          'The release modifies security-sensitive permissions.',
        file: file.path,
        evidence: [
          'Permission-related metadata detected.',
        ],
        recommendation:
          'Review the permission changes before promotion.',
        score: 30,
      })
    }

    // --------------------------------------------------
    // Production source changes
    // --------------------------------------------------

    if (file.type === 'SOURCE') {
      const relatedTest = hasRelatedTest(
        file.path,
        repositoryFiles,
      )

      if (relatedTest) {
        findings.push({
          id: 'TEST-001',
          category: 'TESTING',
          severity: 'LOW',
          title:
            'Production source code changed with related test',
          description:
            'Production source code changed and a related test file was detected.',
          file: file.path,
          evidence: [
            'Source code file changed.',
            'Related test file detected.',
          ],
          recommendation:
            'Verify that the related test adequately covers the change.',
          score: 5,
        })
      } else {
        findings.push({
          id: 'TEST-001',
          category: 'TESTING',
          severity: 'MEDIUM',
          title:
            'Production source code changed without related test',
          description:
            'Production source code changed but no related test file was detected.',
          file: file.path,
          evidence: [
            'Source code file changed.',
            'No related test file detected.',
          ],
          recommendation:
            'Add or update an automated test before promotion.',
          score: 15,
        })
      }
    }
  }

  return findings
}