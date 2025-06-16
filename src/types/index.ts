export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
  ADMIN = 'ADMIN',
  DEV = 'DEV'
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pass {
  id: string;
  studentId: string;
  fromLocationId: string;
  toLocationId: string;
  status: PassStatus;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: string;
  notes?: string;
}

export enum PassStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface MovementState {
  userId: string;
  locationId: string;
  status: MovementStatus;
  lastUpdated: Date;
}

export enum MovementStatus {
  IN = 'IN',
  OUT = 'OUT'
} 