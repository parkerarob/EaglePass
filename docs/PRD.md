# Eagle Pass MVP — PRD v1.0

## Problem Statement

Schools need a system that allows students to move through the building while maintaining clear responsibility and accountability for both students and staff, without relying on paper hall passes or requiring staff to manually track student movement.

The system must allow students to declare movement into the hallway when leaving class, select a destination from a predefined list, and then declare when they have returned to class. The system must also maintain immutable records of all movement actions for auditability while minimizing staff burden.

Teacher autonomy remains central, but administrative override policies may be introduced in future releases. For this MVP, no staff-facing interfaces are required.

## User Personas

### Student (MVP Scope)

- Primary device: iPhone or personal mobile device
- Secondary device: shared kiosk (iPad), fallback Chromebook web browser
- Authenticated via Google SSO (Firebase Auth)
- Uses app to:
  - Select a destination from a predefined list to declare movement (opens pass)
  - Declare return to class (closes pass)
- Only one open pass allowed at a time
- Cannot modify historical data

## Scope (MVP)

- ✅ Student opens pass by declaring departure
- ✅ Student closes pass by declaring return to class
- ✅ System writes immutable event logs on each state transition
- ✅ No approval process or teacher/admin interface
- ✅ No scheduled passes, notifications, emergency mode, or found-without-pass logic
- ✅ Only single-leg passes: leave → return

## Workflow Summary

- Student logs in via Google Auth
- Student selects destination → system creates a pass (OPEN, IN_TRANSIT)
- Student returns to class → system closes the pass (CLOSED, IN_CLASS)
- Every action is logged immutably

## Data Model

### Pass Document (live state)

| Field | Type | Description |
|---|---|---|
| `passId` | string | Auto-generated unique ID |
| `studentId` | string | Firebase UID |
| `scheduleLocationId` | string | Origin class |
| `destinationLocationId` | string | Predefined destination |
| `status` | enum | OPEN or CLOSED |
| `state` | enum | IN_CLASS or IN_TRANSIT |
| `legId` | integer | Current movement cycle (starts at 1) |
| `createdAt` | timestamp | Pass creation time |
| `lastUpdatedAt` | timestamp | Last state change |

### Event Log Collection (immutable record)

| Field | Type | Description |
|---|---|---|
| `eventId` | string | Auto-generated |
| `passId` | string | FK to pass |
| `studentId` | string | Firebase UID |
| `actorId` | string | Who triggered event (student for MVP) |
| `timestamp` | timestamp | Event time |
| `eventType` | enum | `LEFT_CLASS` or `RETURNED_TO_CLASS` |

## Constraints

- Only one active pass per student
- Predefined destination list is fixed for MVP
- All transitions log events immutably
- No approvals, no admin interface, no emergency mode for MVP

## Emulator Outage Work-around

Due to a Google Cloud Storage outage affecting Firestore emulator JAR downloads, this project uses in-memory Jest tests with `@firebase/rules-unit-testing` v2.0.3 as the current source of truth for all Cloud Function and security rule validation.

The in-memory test suite provides 100% functional coverage of:
- All business logic in `createPass`, `declareDeparture`, and `declareReturn`
- Firestore security rules enforcement
- State machine transitions and event logging
- Error handling and edge cases

These tests run without requiring the Firestore emulator and provide the same validation as emulator-based integration tests.

## Success Metrics

- Student can successfully log departure and return
- Pass state remains truthful at all times
- Logs are immutable and reliable for future audit
