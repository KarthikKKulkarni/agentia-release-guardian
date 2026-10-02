import { describe, expect, it } from 'vitest'
import { evaluatePolicy } from '../engine/policy-engine.js'
import { Finding } from '../engine/types.js'
import { GuardianPolicy } from '../config/policy.js'

const policy: GuardianPolicy = {
    maxRiskScore: 70,
    rules: {
        requireTests: true,
        blockDestructiveChanges: true,
        requirePermissionReview: true,
    },
}

function finding(
    id: string,
    severity: Finding['severity'],
    score: number,
    file: string,
): Finding {
    return {
        id,
        category:
            id === 'SEC-001'
                ? 'SECURITY'
                : id === 'DEPLOY-001'
                    ? 'GOVERNANCE'
                    : 'TESTING',
        severity,
        title: 'Test finding',
        description: 'Test finding',
        file,
        score,
    }
}

describe('policy engine', () => {
    it('passes when risk is within policy and no blocking findings exist', () => {
        const findings: Finding[] = [
            finding(
                'TEST-001',
                'LOW',
                5,
                'PaymentService.cls',
            ),
        ]

        const result = evaluatePolicy(
            policy,
            findings,
            5,
        )

        expect(result.passed).toBe(true)
        expect(result.violations).toHaveLength(0)
    })

    it('blocks when risk score exceeds the maximum', () => {
        const findings: Finding[] = [
            finding(
                'SEC-001',
                'HIGH',
                30,
                'Admin.permissionset-meta.xml',
            ),
        ]

        const result = evaluatePolicy(
            policy,
            findings,
            75,
        )

        expect(result.passed).toBe(false)
        expect(result.violations).toHaveLength(2)

        expect(result.violations[0].rule).toBe(
            'maxRiskScore',
        )

        expect(result.violations[0].message).toContain(
            'Risk score 75 exceeds maximum allowed score 70',
        )

        expect(result.violations[1].rule).toBe(
            'requirePermissionReview',
        )

        expect(result.violations[1].findings).toEqual([
            'Admin.permissionset-meta.xml',
        ])
    })

    it('blocks destructive changes', () => {
        const findings: Finding[] = [
            finding(
                'DEPLOY-001',
                'CRITICAL',
                40,
                'destructiveChanges.xml',
            ),
        ]

        const result = evaluatePolicy(
            policy,
            findings,
            40,
        )

        expect(result.passed).toBe(false)
        expect(result.violations).toHaveLength(1)
        expect(result.violations[0].rule).toBe(
            'blockDestructiveChanges',
        )
        expect(result.violations[0].findings).toEqual([
            'destructiveChanges.xml',
        ])
    })

    it('requires permission review', () => {
        const findings: Finding[] = [
            finding(
                'SEC-001',
                'HIGH',
                30,
                'Admin.permissionset-meta.xml',
            ),
        ]

        const result = evaluatePolicy(
            policy,
            findings,
            30,
        )

        expect(result.passed).toBe(false)
        expect(result.violations).toHaveLength(1)
        expect(result.violations[0].rule).toBe(
            'requirePermissionReview',
        )
        expect(result.violations[0].findings).toEqual([
            'Admin.permissionset-meta.xml',
        ])
    })

    it('blocks missing tests when tests are required', () => {
        const findings: Finding[] = [
            finding(
                'TEST-001',
                'MEDIUM',
                15,
                'InvoiceService.cls',
            ),
        ]

        const result = evaluatePolicy(
            policy,
            findings,
            15,
        )

        expect(result.passed).toBe(false)
        expect(result.violations).toHaveLength(1)
        expect(result.violations[0].rule).toBe(
            'requireTests',
        )
        expect(result.violations[0].findings).toEqual([
            'InvoiceService.cls',
        ])
    })

    it('reports multiple policy violations together', () => {
        const findings: Finding[] = [
            finding(
                'SEC-001',
                'HIGH',
                30,
                'Admin.permissionset-meta.xml',
            ),
            finding(
                'TEST-001',
                'MEDIUM',
                15,
                'InvoiceService.cls',
            ),
            finding(
                'DEPLOY-001',
                'CRITICAL',
                40,
                'destructiveChanges.xml',
            ),
        ]

        const result = evaluatePolicy(
            policy,
            findings,
            85,
        )

        expect(result.passed).toBe(false)
        expect(result.violations).toHaveLength(4)

        expect(
            result.violations.map(
                (violation) => violation.rule,
            ),
        ).toEqual([
            'maxRiskScore',
            'requireTests',
            'blockDestructiveChanges',
            'requirePermissionReview',
        ])
    })

    it('does not block a related test finding', () => {
        const findings: Finding[] = [
            finding(
                'TEST-001',
                'LOW',
                5,
                'PaymentService.cls',
            ),
        ]

        const result = evaluatePolicy(
            policy,
            findings,
            5,
        )

        expect(result.passed).toBe(true)
        expect(result.violations).toHaveLength(0)
    })
})