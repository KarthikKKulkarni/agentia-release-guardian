import {describe, expect, it} from 'vitest'
import {
  classifyFile,
  classifyFiles,
} from '../analyzers/file-classifier.js'

describe('file classifier', () => {
  it('classifies source files', () => {
    expect(classifyFile('PaymentService.cls')).toBe('SOURCE')
    expect(classifyFile('src/service.ts')).toBe('SOURCE')
    expect(classifyFile('app/main.cpp')).toBe('SOURCE')
  })

  it('classifies test files', () => {
    expect(classifyFile('PaymentServiceTest.cls')).toBe('TEST')
    expect(classifyFile('src/service.test.ts')).toBe('TEST')
  })

  it('classifies permission files', () => {
    expect(
      classifyFile('Admin.permissionset-meta.xml'),
    ).toBe('PERMISSION')

    expect(
      classifyFile('Admin.profile-meta.xml'),
    ).toBe('PERMISSION')
  })

  it('classifies destructive deployment files', () => {
    expect(
      classifyFile('destructiveChanges.xml'),
    ).toBe('DESTRUCTIVE')
  })

  it('classifies configuration files', () => {
    expect(classifyFile('config.json')).toBe('CONFIGURATION')
    expect(classifyFile('guardian.yml')).toBe('CONFIGURATION')
    expect(classifyFile('application.properties')).toBe(
      'CONFIGURATION',
    )
  })

  it('classifies metadata files', () => {
    expect(
      classifyFile('objects/Account.object-meta.xml'),
    ).toBe('METADATA')
  })

  it('classifies unknown files', () => {
    expect(classifyFile('README.md')).toBe('UNKNOWN')
    expect(classifyFile('image.png')).toBe('UNKNOWN')
  })

  it('classifies multiple files', () => {
    const result = classifyFiles([
      'PaymentService.cls',
      'PaymentServiceTest.cls',
      'Admin.permissionset-meta.xml',
      'destructiveChanges.xml',
    ])

    expect(result).toEqual([
      {
        path: 'PaymentService.cls',
        type: 'SOURCE',
      },
      {
        path: 'PaymentServiceTest.cls',
        type: 'TEST',
      },
      {
        path: 'Admin.permissionset-meta.xml',
        type: 'PERMISSION',
      },
      {
        path: 'destructiveChanges.xml',
        type: 'DESTRUCTIVE',
      },
    ])
  })
})