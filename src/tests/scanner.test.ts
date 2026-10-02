import {describe, expect, it} from 'vitest'
import {runScan} from '../engine/scanner.js'
import {
  mkdtemp,
  writeFile,
  rm,
} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'

const execFileAsync = promisify(execFile)

async function initializeRepository(
  repository: string,
): Promise<void> {
  await execFileAsync(
    'git',
    ['init', '-b', 'master'],
    {cwd: repository},
  )

  await execFileAsync(
    'git',
    ['config', 'user.email', 'guardian@test.local'],
    {cwd: repository},
  )

  await execFileAsync(
    'git',
    ['config', 'user.name', 'Guardian Test'],
    {cwd: repository},
  )
}

async function commitRepository(
  repository: string,
): Promise<void> {
  await execFileAsync(
    'git',
    ['add', '.'],
    {cwd: repository},
  )

  await execFileAsync(
    'git',
    ['commit', '-m', 'Initial test repository'],
    {cwd: repository},
  )
}

async function createCleanRepository(): Promise<string> {
  const repository = await mkdtemp(
    join(tmpdir(), 'guardian-clean-'),
  )

  await writeFile(
    join(repository, 'README.md'),
    '# Guardian Test Repository\n',
  )

  await writeFile(
    join(repository, 'guardian.yml'),
    `maxRiskScore: 70

rules:
  requireTests: true
  blockDestructiveChanges: true
  requirePermissionReview: true
`,
  )

  await initializeRepository(repository)
  await commitRepository(repository)

  return repository
}

async function createRiskyRepository(): Promise<string> {
  const repository = await mkdtemp(
    join(tmpdir(), 'guardian-risky-'),
  )

  await writeFile(
    join(repository, 'PaymentService.cls'),
    'public class PaymentService {}',
  )

  await writeFile(
    join(repository, 'PaymentServiceTest.cls'),
    '@isTest public class PaymentServiceTest {}',
  )

  await writeFile(
    join(
      repository,
      'Admin.permissionset-meta.xml',
    ),
    '<PermissionSet></PermissionSet>',
  )

  await writeFile(
    join(repository, 'destructiveChanges.xml'),
    '<Package></Package>',
  )

  await writeFile(
    join(repository, 'guardian.yml'),
    `maxRiskScore: 3

rules:
  requireTests: true
  blockDestructiveChanges: true
  requirePermissionReview: true
`,
  )

  await initializeRepository(repository)
  await commitRepository(repository)

  await writeFile(
    join(repository, 'PaymentService.cls'),
    'public class PaymentService { void changed() {} }',
  )

  await writeFile(
    join(
      repository,
      'Admin.permissionset-meta.xml',
    ),
    '<PermissionSet><modifyAllData>true</modifyAllData></PermissionSet>',
  )

  await writeFile(
    join(repository, 'destructiveChanges.xml'),
    '<Package><types><members>OldComponent</members></types></Package>',
  )

  return repository
}

describe('scanner integration', () => {
  it('scans a clean Git repository', async () => {
    const repository = await createCleanRepository()

    try {
      const result = await runScan(repository)

      expect(result.repository.branch).toBe('master')
      expect(result.changedFiles).toBe(0)
      expect(result.findings).toHaveLength(0)
      expect(result.riskScore).toBe(0)
      expect(result.riskLevel).toBe('LOW')
      expect(result.policy.evaluation.passed).toBe(true)
      expect(result.releaseStatus).toBe('PASS')
    } finally {
      await rm(repository, {
        recursive: true,
        force: true,
      })
    }
  })

  it('blocks a risky release with multiple governance violations', async () => {
    const repository = await createRiskyRepository()

    try {
      const result = await runScan(repository)

      expect(result.changedFiles).toBe(3)
      expect(result.riskScore).toBe(75)
      expect(result.riskLevel).toBe('HIGH')
      expect(result.releaseStatus).toBe('BLOCKED')

      expect(result.findings).toHaveLength(3)

      expect(
        result.policy.evaluation.passed,
      ).toBe(false)

      expect(
        result.policy.evaluation.violations,
      ).toHaveLength(3)

      expect(
        result.policy.evaluation.violations.map(
          (violation) => violation.rule,
        ),
      ).toEqual([
        'maxRiskScore',
        'blockDestructiveChanges',
        'requirePermissionReview',
      ])
    } finally {
      await rm(repository, {
        recursive: true,
        force: true,
      })
    }
  })
})