import {describe, expect, it} from 'vitest'
import {
  generateTestRecommendations,
} from '../analyzers/test-recommender.js'
import {ClassifiedFile} from '../analyzers/file-classifier.js'

describe('test recommender', () => {
  it('recommends an existing related test for source changes', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'PaymentService.cls',
        type: 'SOURCE',
      },
    ]

    const repositoryFiles: ClassifiedFile[] = [
      ...changedFiles,
      {
        path: 'PaymentServiceTest.cls',
        type: 'TEST',
      },
    ]

    const result = generateTestRecommendations(
      changedFiles,
      repositoryFiles,
    )

    expect(result.recommendations).toHaveLength(1)

    expect(
      result.recommendations[0].relatedTests,
    ).toEqual([
      'PaymentServiceTest.cls',
    ])

    expect(
      result.recommendations[0].recommendations,
    ).toContain(
      'Run PaymentServiceTest.cls.',
    )
  })

  it('recommends creating a test when none exists', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'InvoiceService.cls',
        type: 'SOURCE',
      },
    ]

    const result = generateTestRecommendations(
      changedFiles,
      changedFiles,
    )

    expect(result.recommendations).toHaveLength(1)

    expect(
      result.recommendations[0].relatedTests,
    ).toHaveLength(0)

    expect(
      result.recommendations[0].recommendations[0],
    ).toContain(
      'Create a related test',
    )
  })

  it('recommends authorization validation for permission changes', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'Admin.permissionset-meta.xml',
        type: 'PERMISSION',
      },
    ]

    const result = generateTestRecommendations(
      changedFiles,
      changedFiles,
    )

    expect(result.recommendations).toHaveLength(1)

    expect(
      result.recommendations[0].recommendations,
    ).toContain(
      'Validate authorization and access-control behavior.',
    )
  })

  it('recommends deployment validation for destructive changes', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'destructiveChanges.xml',
        type: 'DESTRUCTIVE',
      },
    ]

    const result = generateTestRecommendations(
      changedFiles,
      changedFiles,
    )

    expect(result.recommendations).toHaveLength(1)

    expect(
      result.recommendations[0].recommendations,
    ).toContain(
      'Run deployment validation before promotion.',
    )
  })

  it('generates recommendations for multiple change types', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'PaymentService.cls',
        type: 'SOURCE',
      },
      {
        path: 'Admin.permissionset-meta.xml',
        type: 'PERMISSION',
      },
      {
        path: 'destructiveChanges.xml',
        type: 'DESTRUCTIVE',
      },
    ]

    const repositoryFiles: ClassifiedFile[] = [
      ...changedFiles,
      {
        path: 'PaymentServiceTest.cls',
        type: 'TEST',
      },
    ]

    const result = generateTestRecommendations(
      changedFiles,
      repositoryFiles,
    )

    expect(result.recommendations).toHaveLength(3)

    expect(
      result.recommendations.map(
        (recommendation) => recommendation.file,
      ),
    ).toEqual([
      'PaymentService.cls',
      'Admin.permissionset-meta.xml',
      'destructiveChanges.xml',
    ])
  })

  it('ignores unsupported file types', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'README.md',
        type: 'UNKNOWN',
      },
    ]

    const result = generateTestRecommendations(
      changedFiles,
      changedFiles,
    )

    expect(result.recommendations).toHaveLength(0)
  })
})