import {ScanResult} from '../engine/types.js'

export function renderJsonReport(
  result: ScanResult,
): string {
  return JSON.stringify(result, null, 2)
}