# Eagle Pass — AI Operator Standard Operating Procedure (SOP) v1.0

## Purpose

This document defines the roles, responsibilities, procedures, and constraints for all human operators managing AI-assisted builds using Cursor AI for Eagle Pass.

---

## Operator Core Responsibilities

- Execute assigned tasks from the Immutable Build Queue.
- Monitor AI build output for compliance with system rules.
- Log all task completions accurately in Execution Ledger v2.
- Trigger escalations when AI build agents encounter blockers or generate unsafe code.
- Maintain auditability and traceability throughout the build lifecycle.

---

## Operator Authority Scope

- ✅ Initiate task runs via Cursor AI.
- ✅ Perform basic non-functional edits:
  - Code formatting corrections
  - File organization fixes
  - Compilation error fixes
  - Documentation corrections

- ❌ Forbidden:
  - Modifying AI-generated business logic or algorithms.
  - Combining, merging, or reordering tasks.
  - Altering task definitions or queue structure.
  - Modifying AI build risk signals without safety authority approval.
  - Skipping safety review checkpoints.

---

## Build Execution Workflow

1. **Task Selection**
    - Assign task directly from Immutable Build Queue.
    - Confirm task ID and scope.

2. **AI Task Execution**
    - Trigger Cursor AI code generation for the task.
    - Ensure no adjacent tasks are co-executed.

3. **AI Output Review**
    - Validate adherence to:
        - File structure rules
        - Naming conventions
        - Scope isolation
        - Cloud Functions write-only behavior
        - Security rule compliance
        - Risk signals (refer to `ai-risk-signals.md`)
        - Required tests present

4. **Execution Ledger Entry**
    - Record task completion in `execution-ledger-v2.md`.
    - Log:
        - Task ID
        - Operator name/initials
        - Status
        - Timestamps
        - Any flags triggered
        - Notes

5. **Escalation (if needed)**
    - If AI returns ⚠ Blocked or triggers High/Critical risk signals:
        - Attempt one AI prompt rephrase.
        - If still blocked or unsafe → escalate to AI Safety Overseer.
        - Do not manually override without authorization.

6. **Post-Build Validation**
    - Verify full unit test and security rules test coverage.
    - Confirm Build Manifest accuracy prior to Release Authority handoff.

---

## Escalation Protocol Summary

| Scenario | Action | Escalation Target |
| -------- | ------ | ------------------ |
| Task Blocked | Retry prompt once | AI Safety Overseer |
| High/Critical Risk Signal | Pause build | AI Safety Overseer |
| Scope Violation Detected | Pause build | AI Safety Overseer |
| Ledger Anomaly | Record issue | AI Safety Overseer |
| PRD Conflict | Pause build | Governance Committee |

---

## Operator Safety Principles

- Preserve system immutability.
- Always favor safety over speed.
- Zero tolerance for unsanctioned scope changes.
- Full transparency via ledger logs.

---

## Document Authority

This SOP is governed by the AI Governance Charter. Any modifications require Governance Committee approval.
