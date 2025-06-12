// Passes model
export interface Pass {
  passId: string;
  studentId: string;
  scheduleLocationId: string;
  destinationLocationId: string;
  status: 'OPEN' | 'CLOSED';
  state: 'IN_CLASS' | 'IN_TRANSIT';
  legId: number;
  createdAt: FirebaseFirestore.Timestamp;
  lastUpdatedAt: FirebaseFirestore.Timestamp;
}

// EventLogs model
export interface EventLog {
  eventId: string;
  passId: string;
  studentId: string;
  actorId: string;
  timestamp: FirebaseFirestore.Timestamp;
  eventType: 'LEFT_CLASS' | 'RETURNED_TO_CLASS';
} 