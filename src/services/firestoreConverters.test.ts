import { describe, it, expect } from 'vitest';
import {
  userConverter,
  locationConverter,
  passConverter,
  eventLogConverter,
  groupConverter,
  autonomyMatrixConverter,
  restrictionConverter
} from './firestoreConverters';
import { UserRole, FIRESTORE_SCHEMA_VERSION } from '../models/firestoreModels';

const fakeSnap = (data: any, id = 'test-id') => ({ data: () => data, id });

describe('Firestore Data Converters', () => {
  it('userConverter serializes and deserializes correctly', () => {
    const user = {
      id: 'u1',
      name: 'Test User',
      role: UserRole.STUDENT,
      createdAt: 'now',
      updatedAt: 'now',
      schemaVersion: FIRESTORE_SCHEMA_VERSION,
    };
    const firestoreData = userConverter.toFirestore(user);
    expect(firestoreData).toMatchObject(user);
    const fromSnap = userConverter.fromFirestore(fakeSnap(user, user.id));
    expect(fromSnap).toMatchObject(user);
  });

  it('locationConverter serializes and deserializes correctly', () => {
    const location = {
      id: 'l1',
      name: 'Room 101',
      locationType: 'classroom',
      schemaVersion: FIRESTORE_SCHEMA_VERSION,
    };
    const firestoreData = locationConverter.toFirestore(location);
    expect(firestoreData).toMatchObject(location);
    const fromSnap = locationConverter.fromFirestore(fakeSnap(location, location.id));
    expect(fromSnap).toMatchObject(location);
  });

  it('passConverter serializes and deserializes correctly', () => {
    const pass = {
      id: 'p1',
      studentId: 'u1',
      originLocationId: 'l1',
      destinationLocationId: 'l2',
      status: 'OPEN',
      state: 'IN',
      createdAt: 'now',
      lastUpdatedAt: 'now',
      schemaVersion: FIRESTORE_SCHEMA_VERSION,
    };
    const firestoreData = passConverter.toFirestore(pass);
    expect(firestoreData).toMatchObject(pass);
    const fromSnap = passConverter.fromFirestore(fakeSnap(pass, pass.id));
    expect(fromSnap).toMatchObject(pass);
  });

  it('eventLogConverter serializes and deserializes correctly', () => {
    const eventLog = {
      id: 'e1',
      passId: 'p1',
      studentId: 'u1',
      actorId: 't1',
      timestamp: 'now',
      eventType: 'DEPARTED',
      schemaVersion: FIRESTORE_SCHEMA_VERSION,
    };
    const firestoreData = eventLogConverter.toFirestore(eventLog);
    expect(firestoreData).toMatchObject(eventLog);
    const fromSnap = eventLogConverter.fromFirestore(fakeSnap(eventLog, eventLog.id));
    expect(fromSnap).toMatchObject(eventLog);
  });

  it('groupConverter serializes and deserializes correctly', () => {
    const group = {
      id: 'g1',
      name: 'Test Group',
      groupType: 'Positive',
      assignedStudents: ['u1'],
      schemaVersion: FIRESTORE_SCHEMA_VERSION,
    };
    const firestoreData = groupConverter.toFirestore(group);
    expect(firestoreData).toMatchObject(group);
    const fromSnap = groupConverter.fromFirestore(fakeSnap(group, group.id));
    expect(fromSnap).toMatchObject(group);
  });

  it('autonomyMatrixConverter serializes and deserializes correctly', () => {
    const matrix = {
      id: 'a1',
      locationId: 'l1',
      autonomyType: 'Allow',
      schemaVersion: FIRESTORE_SCHEMA_VERSION,
    };
    const firestoreData = autonomyMatrixConverter.toFirestore(matrix);
    expect(firestoreData).toMatchObject(matrix);
    const fromSnap = autonomyMatrixConverter.fromFirestore(fakeSnap(matrix, matrix.id));
    expect(fromSnap).toMatchObject(matrix);
  });

  it('restrictionConverter serializes and deserializes correctly', () => {
    const restriction = {
      id: 'r1',
      studentId: 'u1',
      restrictionType: 'Global',
      isActive: true,
      schemaVersion: FIRESTORE_SCHEMA_VERSION,
    };
    const firestoreData = restrictionConverter.toFirestore(restriction);
    expect(firestoreData).toMatchObject(restriction);
    const fromSnap = restrictionConverter.fromFirestore(fakeSnap(restriction, restriction.id));
    expect(fromSnap).toMatchObject(restriction);
  });
}); 