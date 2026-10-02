import {ClassifiedFile} from './file-classifier.js'

export interface BlastRadiusItem {
  file: string
  type: string
  impact: string
  areas: string[]
}

export interface BlastRadiusResult {
  items: BlastRadiusItem[]
  affectedAreas: string[]
}

export function analyzeBlastRadius(
  changedFiles: ClassifiedFile[],
): BlastRadiusResult {
  const items: BlastRadiusItem[] = []
  const affectedAreas = new Set<string>()

  for (const file of changedFiles) {
    switch (file.type) {
      case 'DESTRUCTIVE':
        items.push({
          file: file.path,
          type: file.type,
          impact: 'Deployment or metadata removal',
          areas: ['Deployment', 'Metadata'],
        })
        affectedAreas.add('Deployment')
        affectedAreas.add('Metadata')
        break

      case 'PERMISSION':
        items.push({
          file: file.path,
          type: file.type,
          impact: 'Security and access-control changes',
          areas: ['Security', 'Access Control'],
        })
        affectedAreas.add('Security')
        affectedAreas.add('Access Control')
        break

      case 'SOURCE':
        items.push({
          file: file.path,
          type: file.type,
          impact: 'Application logic changes',
          areas: ['Application Code'],
        })
        affectedAreas.add('Application Code')
        break

      case 'CONFIGURATION':
        items.push({
          file: file.path,
          type: file.type,
          impact: 'Runtime or deployment configuration changes',
          areas: ['Configuration'],
        })
        affectedAreas.add('Configuration')
        break

      case 'METADATA':
        items.push({
          file: file.path,
          type: file.type,
          impact: 'Application metadata changes',
          areas: ['Metadata'],
        })
        affectedAreas.add('Metadata')
        break

      case 'TEST':
        items.push({
          file: file.path,
          type: file.type,
          impact: 'Automated test changes',
          areas: ['Testing'],
        })
        affectedAreas.add('Testing')
        break

      default:
        items.push({
          file: file.path,
          type: file.type,
          impact: 'Unclassified repository change',
          areas: ['Unknown'],
        })
        affectedAreas.add('Unknown')
        break
    }
  }

  return {
    items,
    affectedAreas: [...affectedAreas],
  }
}