export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: any; // Firestore timestamp
  type?: 'bulletin' | 'property_notification'; // Optional type field
  level?: 'info' | 'warning' | 'alert';
  propertyId?: string;
  organizationId?: string;
  read?: boolean;
  mobileLink?: string;
  vehicle?: {
    licensePlate: string;
  };
  violationId?: string;
}
