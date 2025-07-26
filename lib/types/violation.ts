// Based on the documentation provided
export interface Violation {
  id: string;
  licensePlate: string;
  violationType: string;
  photoUrl: string;
  reporterId: string;
  residentId: string | null;
  propertyId: string;
  organizationId: string;
  status:
    | 'pending'
    | 'acknowledged'
    | 'escalated'
    | 'reported'
    | 'claimed';
  createdAt: {
    toDate: () => Date;
  };
  acknowledgedAt?: {
    toDate: () => Date;
  };
}
