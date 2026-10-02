import {describe, expect, it} from 'vitest'
import {analyzeFiles} from '../analyzers/risk-analyzer.js'
import {ClassifiedFile} from '../analyzers/file-classifier.js'

describe('risk analyzer', () => {
  it('detects permission changes as HIGH security findings', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'Admin.permissionset-meta.xml',
        type: 'PERMISSION',
      },
    ]

    const findings = analyzeFiles(changedFiles, changedFiles)

    expect(findings).toHaveLength(1)
    expect(findings[0].id).toBe('SEC-001')
    expect(findings[0].category).toBe('SECURITY')
    expect(findings[0].severity).toBe('HIGH')
    expect(findings[0].score).toBe(30)
  })

  it('detects destructive changes as CRITICAL findings', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'destructiveChanges.xml',
        type: 'DESTRUCTIVE',
      },
    ]

    const findings = analyzeFiles(changedFiles, changedFiles)

    expect(findings).toHaveLength(1)
    expect(findings[0].id).toBe('DEPLOY-001')
    expect(findings[0].category).toBe('GOVERNANCE')
    expect(findings[0].severity).toBe('CRITICAL')
    expect(findings[0].score).toBe(40)
  })

  it('detects source changes with a related test', () => {
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

    const findings = analyzeFiles(
      changedFiles,
      repositoryFiles,
    )

    expect(findings).toHaveLength(1)
    expect(findings[0].id).toBe('TEST-001')
    expect(findings[0].severity).toBe('LOW')
    expect(findings[0].score).toBe(5)
    expect(findings[0].description).toContain(
      'related test file was detected',
    )
  })

  it('detects source changes without a related test', () => {
    const changedFiles: ClassifiedFile[] = [
      {
        path: 'InvoiceService.cls',
        type: 'SOURCE',
      },
    ]

    const repositoryFiles: ClassifiedFile[] = [
      ...changedFiles,
    ]

    const findings = analyzeFiles(
      changedFiles,
      repositoryFiles,
    )

    expect(findings).toHaveLength(1)
    expect(findings[0].id).toBe('TEST-001')
    expect(findings[0].severity).toBe('MEDIUM')
    expect(findings[0].score).toBe(15)
    expect(findings[0].description).toContain(
      'no related test file was detected',
    )
  })

  it('detects multiple independent risks', () => {
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

    const findings = analyzeFiles(
      changedFiles,
      repositoryFiles,
    )

    expect(findings).toHaveLength(3)

    expect(
      findings.map((finding) => finding.id),
    ).toEqual([
      'TEST-001',
      'SEC-001',
      'DEPLOY-001',
    ])

    expect(
      findings.reduce(
        (total, finding) => total + finding.score,
        0,
      ),
    ).toBe(75)
  })
})