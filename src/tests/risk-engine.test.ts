import {describe, expect, it} from 'vitest'
import {
  calculateRiskLevel,
  calculateRiskScore,
} from '../engine/risk-engine.js'
import {Finding} from '../engine/types.js'

function finding(score: number): Finding {
  return {
    id: 'TEST',
    category: 'CODE',
    severity: 'LOW',
    title: 'Test finding',
    description: 'Test finding',
    file: 'test.cls',
    score,
  }
}

describe('risk engine', () => {
  it('calculates the total risk score', () => {
    const findings = [
      finding(30),
      finding(15),
      finding(40),
    ]

    expect(calculateRiskScore(findings)).toBe(85)
  })

  it('caps the risk score at 100', () => {
    const findings = [
      finding(60),
      finding(60),
    ]

    expect(calculateRiskScore(findings)).toBe(100)
  })

  it('returns LOW for scores below 30', () => {
    expect(calculateRiskLevel(0)).toBe('LOW')
    expect(calculateRiskLevel(29)).toBe('LOW')
  })

  it('returns MEDIUM for scores from 30 to 59', () => {
    expect(calculateRiskLevel(30)).toBe('MEDIUM')
    expect(calculateRiskLevel(59)).toBe('MEDIUM')
  })

  it('returns HIGH for scores from 60 to 79', () => {
    expect(calculateRiskLevel(60)).toBe('HIGH')
    expect(calculateRiskLevel(79)).toBe('HIGH')
  })

  it('returns CRITICAL for scores 80 and above', () => {
    expect(calculateRiskLevel(80)).toBe('CRITICAL')
    expect(calculateRiskLevel(100)).toBe('CRITICAL')
  })
})