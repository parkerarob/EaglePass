# Known Issues

## Firestore Emulator JAR Download Outage

**Date:** 2025-01-12  
**Status:** Active  
**Ticket:** OPS-42  

### Issue
Google CDN outage blocks Firestore emulator JAR downloads. All attempts to download `cloud-firestore-emulator-v1.19.8.jar` from official sources result in incomplete files or error responses.

### Impact
- Firebase emulator suite cannot be started locally
- Integration testing requiring running emulators is blocked
- Manual development workflows requiring emulators are affected

### Workaround
The project uses in-memory Jest tests with `@firebase/rules-unit-testing` v2.0.3 as the primary testing approach. These tests provide complete functional coverage without requiring emulator dependencies.

### Resolution
Monitor Google Cloud Status page and Firebase CLI releases for resolution. Re-enable emulator scripts once JAR downloads are restored.

### Related Files
- `functions/scripts/setup-emulators.sh` (commented out in package.json)
- `functions/scripts/sideload-jar.sh` (commented out in package.json)
- Root `package.json` emulator scripts (removed) 