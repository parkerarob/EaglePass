/**
 * Firestore Security Rules Tests
 * Tests for Task 9: Implement Firestore security rules
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Firestore Security Rules', () => {
  let rulesContent: string;

  beforeAll(() => {
    // Read the actual firestore.rules file
    const rulesPath = join(process.cwd(), '..', '..', 'firestore.rules');
    rulesContent = readFileSync(rulesPath, 'utf-8');
  });

  describe('Rules Structure Validation', () => {
    it('should have correct rules version', () => {
      expect(rulesContent).toContain('rules_version = \'2\';');
    });

    it('should have service cloud.firestore declaration', () => {
      expect(rulesContent).toContain('service cloud.firestore');
    });

    it('should have database match pattern', () => {
      expect(rulesContent).toContain('match /databases/{database}/documents');
    });
  });

  describe('Helper Functions', () => {
    it('should have isAuthenticated function', () => {
      expect(rulesContent).toContain('function isAuthenticated()');
    });

    it('should have getUserData function', () => {
      expect(rulesContent).toContain('function getUserData()');
    });

    it('should have isApproved function', () => {
      expect(rulesContent).toContain('function isApproved()');
    });

    it('should have hasRole function', () => {
      expect(rulesContent).toContain('function hasRole(role)');
    });

    it('should have isAdmin function', () => {
      expect(rulesContent).toContain('function isAdmin()');
    });

    it('should have isTeacher function', () => {
      expect(rulesContent).toContain('function isTeacher()');
    });

    it('should have isStudent function', () => {
      expect(rulesContent).toContain('function isStudent()');
    });

    it('should have isOwner function', () => {
      expect(rulesContent).toContain('function isOwner(userId)');
    });

    it('should have isValidEmail function', () => {
      expect(rulesContent).toContain('function isValidEmail()');
    });

    it('should have teacherHasLocationAccess function', () => {
      expect(rulesContent).toContain('function teacherHasLocationAccess(locationId)');
    });

    it('should have teacherHasStudentAccess function', () => {
      expect(rulesContent).toContain('function teacherHasStudentAccess(studentId)');
    });
  });

  describe('Collection Rules', () => {
    it('should have users collection rules', () => {
      expect(rulesContent).toContain('match /users/{userId}');
    });

    it('should have passes collection rules', () => {
      expect(rulesContent).toContain('match /passes/{passId}');
    });

    it('should have legs subcollection rules', () => {
      expect(rulesContent).toContain('match /passes/{passId}/legs/{legId}');
    });

    it('should have students collection rules', () => {
      expect(rulesContent).toContain('match /students/{studentId}');
    });

    it('should have staff collection rules', () => {
      expect(rulesContent).toContain('match /staff/{staffId}');
    });

    it('should have locations collection rules', () => {
      expect(rulesContent).toContain('match /locations/{locationId}');
    });

    it('should have groups collection rules', () => {
      expect(rulesContent).toContain('match /groups/{groupId}');
    });

    it('should have schedules collection rules', () => {
      expect(rulesContent).toContain('match /schedules/{scheduleId}');
    });

    it('should have reports collection rules', () => {
      expect(rulesContent).toContain('match /reports/{reportId}');
    });

    it('should have audit collection rules', () => {
      expect(rulesContent).toContain('match /audit/{auditId}');
    });

    it('should have settings collection rules', () => {
      expect(rulesContent).toContain('match /settings/{settingId}');
    });

    it('should have notifications collection rules', () => {
      expect(rulesContent).toContain('match /notifications/{notificationId}');
    });
  });

  describe('Security Patterns', () => {
    it('should have role-based access control', () => {
      expect(rulesContent).toContain('hasRole(\'admin\')');
      expect(rulesContent).toContain('hasRole(\'teacher\')');
      expect(rulesContent).toContain('hasRole(\'student\')');
    });

    it('should have location-based access for teachers', () => {
      expect(rulesContent).toContain('teacherHasLocationAccess');
    });

    it('should have student access control for teachers', () => {
      expect(rulesContent).toContain('teacherHasStudentAccess');
    });

    it('should have owner-based access control', () => {
      expect(rulesContent).toContain('isOwner(userId)');
    });

    it('should have email domain validation', () => {
      expect(rulesContent).toContain('@nhcs\\\\.net');
    });

    it('should have default deny rule', () => {
      expect(rulesContent).toContain('match /{document=**}');
      expect(rulesContent).toContain('allow read, write: if false;');
    });
  });

  describe('Specific Security Rules', () => {
    it('should allow students to create their own passes', () => {
      expect(rulesContent).toContain('allow create: if isStudent()');
      expect(rulesContent).toContain('request.resource.data.studentId == request.auth.uid');
    });

    it('should allow students to read their own passes', () => {
      expect(rulesContent).toContain('allow read: if isStudent()');
      expect(rulesContent).toContain('resource.data.studentId == request.auth.uid');
    });

    it('should allow teachers location-based pass access', () => {
      expect(rulesContent).toContain('teacherHasLocationAccess(resource.data.originLocationId)');
      expect(rulesContent).toContain('teacherHasLocationAccess(resource.data.destinationLocationId)');
    });

    it('should allow admins full access', () => {
      expect(rulesContent).toContain('allow read, write: if isAdmin()');
    });

    it('should prevent audit log writes', () => {
      expect(rulesContent).toContain('allow write: if false;');
    });

    it('should allow users to read their own notifications', () => {
      expect(rulesContent).toContain('resource.data.userId == request.auth.uid');
    });
  });

  describe('Data Integrity', () => {
    it('should prevent users from modifying critical fields', () => {
      expect(rulesContent).toContain('!(\'role\' in request.resource.data.diff(resource.data).affectedKeys())');
      expect(rulesContent).toContain('!(\'status\' in request.resource.data.diff(resource.data).affectedKeys())');
      expect(rulesContent).toContain('!(\'uid\' in request.resource.data.diff(resource.data).affectedKeys())');
      expect(rulesContent).toContain('!(\'email\' in request.resource.data.diff(resource.data).affectedKeys())');
    });

    it('should prevent students from modifying pass ownership', () => {
      expect(rulesContent).toContain('!(\'studentId\' in request.resource.data.diff(resource.data).affectedKeys())');
      expect(rulesContent).toContain('!(\'createdAt\' in request.resource.data.diff(resource.data).affectedKeys())');
    });

    it('should prevent admins from modifying their own status', () => {
      expect(rulesContent).toContain('userId != request.auth.uid');
    });
  });

  describe('FERPA Compliance', () => {
    it('should restrict student data access to homeroom teachers', () => {
      expect(rulesContent).toContain('get(/databases/$(database)/documents/students/$(studentId)).data.homeroom ==');
      expect(rulesContent).toContain('get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.homeroom');
    });

    it('should restrict staff data access to department', () => {
      expect(rulesContent).toContain('get(/databases/$(database)/documents/staff/$(staffId)).data.department ==');
      expect(rulesContent).toContain('get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.department');
    });

    it('should restrict group access to members and creators', () => {
      expect(rulesContent).toContain('request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.studentIds');
      expect(rulesContent).toContain('get(/databases/$(database)/documents/groups/$(groupId)).data.createdById == request.auth.uid');
    });

    it('should restrict report access to creators and admins', () => {
      expect(rulesContent).toContain('get(/databases/$(database)/documents/reports/$(reportId)).data.generatedById == request.auth.uid');
    });
  });

  describe('Rule Completeness', () => {
    it('should cover all major collections from database schema', () => {
      const requiredCollections = [
        'users', 'passes', 'students', 'staff', 'locations', 
        'groups', 'schedules', 'reports', 'audit', 'settings', 'notifications'
      ];

      requiredCollections.forEach(collection => {
        expect(rulesContent).toContain(`match /${collection}/`);
      });
    });

    it('should have proper subcollection handling', () => {
      expect(rulesContent).toContain('match /passes/{passId}/legs/{legId}');
    });

    it('should have comprehensive helper functions', () => {
      const requiredFunctions = [
        'isAuthenticated', 'getUserData', 'isApproved', 'hasRole',
        'isAdmin', 'isTeacher', 'isStudent', 'isOwner', 'isValidEmail',
        'teacherHasLocationAccess', 'teacherHasStudentAccess'
      ];

      requiredFunctions.forEach(func => {
        expect(rulesContent).toContain(`function ${func}`);
      });
    });
  });
});
