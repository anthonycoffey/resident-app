import { Timestamp } from "firebase/firestore";

export type ViolationStatus =
  | 'pending'
  | 'acknowledged'
  | 'escalated'
  | 'reported'
  | 'claimed';

export interface Violation {
  id: string;
  reporterId: string;
  residentId?: string;
  propertyId: string;
  organizationId: string;
  licensePlate: string;
  status: ViolationStatus;
  violationType: string;
  createdAt: Timestamp | { _seconds: number; _nanoseconds: number };
  claimedAt: Timestamp | { _seconds: number; _nanoseconds: number };
  photoUrl: string;
}
