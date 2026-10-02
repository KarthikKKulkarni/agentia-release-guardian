# Agentia Release Guardian

> **Know the release risk before you ship.**

Agentia Release Guardian is an Agentia CLI plugin that performs intelligent pre-deployment risk and governance analysis on a Git repository.

It analyzes changed files, identifies security-sensitive and destructive changes, checks test coverage signals, evaluates governance policies, calculates a deterministic release-risk score, and produces actionable recommendations.

---

## Why Release Guardian?

Modern releases can contain much more than application code:

- Source-code changes
- Permission and access-control changes
- Metadata changes
- Deployment configuration
- Destructive changes
- Missing or incomplete test coverage

These risks are often reviewed manually or discovered late in CI/CD.

Release Guardian moves this analysis earlier in the workflow.

```text
Developer changes
       |
       v
agentia guardian scan
       |
       +--------------------+
       |                    |
       v                    v
 Git/change analysis    Policy evaluation
       |                    |
       +---------+----------+
                 |
                 v
          Deterministic
           Risk Engine
                 |
        +--------+--------+
        |                 |
        v                 v
   Risk Score       Policy Violations
        |                 |
        +--------+--------+
                 |
                 v
          PASS / BLOCKED