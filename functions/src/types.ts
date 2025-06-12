import { Timestamp } from 'firebase-admin/firestore';

export interface Pass {
  passId: string;
  studentId: string;
  scheduleLocationId: string;
  destinationLocationId: string;
  status: 'OPEN' | 'CLOSED';
  state: 'IN_CLASS' | 'IN_TRANSIT';
  legId: number;
  createdAt: Timestamp;
  lastUpdatedAt: Timestamp;
}

export interface EventLog {
  eventId: string;
  passId: string;
  studentId: string;
  actorId: string;
  timestamp: Timestamp;
  eventType: 'LEFT_CLASS' | 'RETURNED_TO_CLASS';
} 