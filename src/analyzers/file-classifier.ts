export type FileType =
  | 'SOURCE'
  | 'TEST'
  | 'PERMISSION'
  | 'METADATA'
  | 'CONFIGURATION'
  | 'DESTRUCTIVE'
  | 'UNKNOWN'

export interface ClassifiedFile {
  path: string
  type: FileType
}

export function classifyFile(
  filePath: string,
): FileType {
  const normalized = filePath
    .replace(/\\/g, '/')
    .toLowerCase()

  if (
    normalized.includes('destructivechanges') ||
    normalized.includes('destructive')
  ) {
    return 'DESTRUCTIVE'
  }

  if (
    normalized.includes('permissionset') ||
    normalized.includes('profile-meta.xml')
  ) {
    return 'PERMISSION'
  }

  if (
    normalized.includes('test') &&
    (
      normalized.endsWith('.cls') ||
      normalized.endsWith('.ts') ||
      normalized.endsWith('.js')
    )
  ) {
    return 'TEST'
  }

  if (
    normalized.endsWith('.cls') ||
    normalized.endsWith('.trigger') ||
    normalized.endsWith('.js') ||
    normalized.endsWith('.ts') ||
    normalized.endsWith('.java') ||
    normalized.endsWith('.cpp') ||
    normalized.endsWith('.c')
  ) {
    return 'SOURCE'
  }

  if (
    normalized.endsWith('.json') ||
    normalized.endsWith('.yaml') ||
    normalized.endsWith('.yml') ||
    normalized.endsWith('.properties')
  ) {
    return 'CONFIGURATION'
  }

  if (normalized.endsWith('.xml')) {
    return 'METADATA'
  }

  return 'UNKNOWN'
}

export function classifyFiles(
  files: string[],
): ClassifiedFile[] {
  return files.map((file) => ({
    path: file,
    type: classifyFile(file),
  }))
}