import {execFile} from 'node:child_process'
import {promisify} from 'node:util'

const execFileAsync = promisify(execFile)

export interface GitFileChange {
  status: string
  file: string
}

export interface GitRepositoryInfo {
  root: string
  branch: string
  changes: GitFileChange[]
}

async function runGit(
  args: string[],
  cwd?: string,
): Promise<string> {
  const {stdout} = await execFileAsync('git', args, {
    cwd,
    windowsHide: true,
  })

  return stdout.trim()
}

export async function isGitRepository(
  cwd: string,
): Promise<boolean> {
  try {
    await runGit(['rev-parse', '--is-inside-work-tree'], cwd)
    return true
  } catch {
    return false
  }
}

export async function getRepositoryRoot(
  cwd: string,
): Promise<string> {
  return runGit(['rev-parse', '--show-toplevel'], cwd)
}

export async function getCurrentBranch(
  cwd: string,
): Promise<string> {
  try {
    return await runGit(['branch', '--show-current'], cwd)
  } catch {
    return 'unknown'
  }
}

export async function getChangedFiles(
  cwd: string,
): Promise<GitFileChange[]> {
  const output = await runGit(
    ['status', '--porcelain=v1'],
    cwd,
  )

  if (!output) {
    return []
  }

  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const status = line.substring(0, 2).trim()
      const file = line.slice(2).trim()

      return {
        status,
        file,
      }
    })
}

export async function getRepositoryFiles(cwd: string): Promise<string[]> {
  const output = await runGit(['ls-files'], cwd)

  if (!output) {
    return []
  }

  return output
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean)
}

export async function analyzeGitRepository(
  cwd: string,
): Promise<GitRepositoryInfo> {
  const root = await getRepositoryRoot(cwd)
  const branch = await getCurrentBranch(cwd)
  const changes = await getChangedFiles(root)

  return {
    root,
    branch,
    changes,
  }
}