import {describe, expect, it} from 'vitest'
import {
  analyzeBlastRadius,
} from '../analyzers/blast-radius.js'
import {ClassifiedFile} from '../analyzers/file-classifier.js'

describe('blast radius analyzer', () => {
  it('identifies application code impact', () => {
    const files: ClassifiedFile[] = [
      {
        path: 'PaymentService.cls',
        type: 'SOURCE',
      },
    ]

    const result = analyzeBlastRadius(files)

    expect(result.items).toHaveLength(1)
    expect(result.items[0].file).toBe(
      'PaymentService.cls',
    )
    expect(result.items[0].impact).toBe(
      'Application logic changes',
    )
    expect(result.affectedAreas).toContain(
      'Application Code',
    )
  })

  it('identifies security impact', () => {
    const files: ClassifiedFile[] = [
      {
        path: 'Admin.permissionset-meta.xml',
        type: 'PERMISSION',
      },
    ]

    const result = analyzeBlastRadius(files)

    expect(result.items[0].impact).toBe(
      'Security and access-control changes',
    )

    expect(result.affectedAreas).toContain('Security')
    expect(result.affectedAreas).toContain(
      'Access Control',
    )
  })

  it('identifies destructive deployment impact', () => {
    const files: ClassifiedFile[] = [
      {
        path: 'destructiveChanges.xml',
        type: 'DESTRUCTIVE',
      },
    ]

    const result = analyzeBlastRadius(files)

    expect(result.items[0].impact).toBe(
      'Deployment or metadata removal',
    )

    expect(result.affectedAreas).toContain(
      'Deployment',
    )

    expect(result.affectedAreas).toContain(
      'Metadata',
    )
  })

  it('identifies multiple affected areas', () => {
    const files: ClassifiedFile[] = [
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

    const result = analyzeBlastRadius(files)

    expect(result.items).toHaveLength(3)

    expect(result.affectedAreas).toEqual([
      'Application Code',
      'Security',
      'Access Control',
      'Deployment',
      'Metadata',
    ])
  })

  it('returns no impact for an empty change set', () => {
    const result = analyzeBlastRadius([])

    expect(result.items).toHaveLength(0)
    expect(result.affectedAreas).toHaveLength(0)
  })
})